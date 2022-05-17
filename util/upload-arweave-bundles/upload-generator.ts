import {
  ArweaveSigner,
  bundleAndSignData,
  createData,
  DataItem,
} from "arbundles";
import { getArweave } from "./reference";

type UIFile = { file: File; buffer: ArrayBuffer };
type GenFile = UIFile & { key: string };

/**
 * Tags to include with every individual transaction.
 */
const BASE_TAGS = [{ name: "App-Name", value: "SOL NFT Tools" }];

// The limit for the cumulated size of files to include in a single bundle.
// arBundles has a limit of 250MB, we use our own limit way below that to:
// - account for the bundling overhead (tags, headers, ...)
// - lower the risk of having to re-upload numerous / voluminous files
// - lower the risk for OOM crashes
// - provide feedback to the user as the files are bundled & uploaded progressively
// Change at your own risk.
const BUNDLE_SIZE_BYTE_LIMIT = 100 * 1000 * 1000;

/**
 * Simplistic helper to convert a bytes value to its MB counterpart.
 */
export function sizeMB(bytes: number): number {
  return bytes / (1000 * 1000);
}

type BundleRange = {
  count: number;
  size: number;
};

/**
 * From a list of file pairs, compute the BundleRange that should be included
 * in a bundle, consisting of one or multiple image + manifest pairs,
 * according to the size of the files to be included in respect of the
 * BUNDLE_SIZE_LIMIT.
 */
function getBundleRange(files: GenFile[]): BundleRange {
  let total = 0;
  let count = 0;
  for (const { key, buffer } of files) {
    const fileSize = buffer.byteLength;

    if (total + fileSize >= BUNDLE_SIZE_BYTE_LIMIT) {
      if (count === 0) {
        console.log(
          `File (${key}) too big (${sizeMB(
            fileSize
          )}MB) for size limit of ${sizeMB(BUNDLE_SIZE_BYTE_LIMIT)}MB.`
        );
        return;
      }
      break;
    }

    total += fileSize;
    count += 1;
  }
  return { count, size: total };
}

type BundleFileResult = {
  key: string;
  link: string;
  name: string;
  type: string;
  size: number;
  txId: string;
  dataItem: DataItem;
};

type UploadGeneratorResult = {
  items: Array<BundleFileResult>;
  bundle: string;
};

async function processBundleFiles(
  signer: ArweaveSigner,
  files: Array<GenFile>,
  { count, size }: BundleRange
) {
  console.log(
    `Computed Bundle range, including ${count} file pair(s) totaling ${sizeMB(
      size
    )}MB.`
  );
  const bundleFiles = files.splice(0, count);
  return bundleFiles.reduce<
    Promise<[Array<BundleFileResult>, Array<DataItem>]>
  >(
    // Process a bundle file.
    // - retrieve binary data, put it in a DataItem
    // - sign the file.
    // - build the uploaded file link from the txId
    // - fill the results accumulator
    async function processBundleFile(accP, file) {
      const [accResults, accDataItems] = await accP;
      console.debug("Processing File", file.key);

      const tags = [
        ...BASE_TAGS,
        { name: "Content-Type", value: file.file.type },
      ];
      const dataItem = createData(new Uint8Array(file.buffer), signer, {
        tags,
      });
      await dataItem.sign(signer);
      const link = `https://arweave.net/${dataItem.id}`;

      accResults.push({
        key: file.key,
        size: file.buffer.byteLength,
        name: file.file.name,
        type: file.file.type,
        dataItem,
        link,
        txId: dataItem.id,
      });

      accDataItems.push(dataItem);

      console.debug("Processed File", file.key);
      return [accResults, accDataItems];
    },
    Promise.resolve([[], []])
  );
}

async function bundleAndUpload(arweave, signer, jwk, results, dataItems) {
  const startBundleTime = Date.now();
  console.log("Bundling...");
  const bundle = await bundleAndSignData(dataItems, signer);
  const endBundleTime = Date.now();
  console.log(
    `Bundled ${dataItems.length} data items in ${
      (endBundleTime - startBundleTime) / 1000
    }s`
  );
  const tx = await bundle.toTransaction(arweave, jwk);
  await arweave.transactions.sign(tx, jwk);
  console.log("Uploading bundle...");
  await arweave.transactions.post(tx);
  console.log("Bundle uploaded!", tx.id);

  return { items: results, bundle: tx.id };
}

/**
 * Initialize the Arweave Bundle Upload Generator.
 * Returns a Generator function that allows to trigger an asynchronous bundle
 * upload to Arweave when calling generator.next().
 * The Arweave Bundle Upload Generator automatically groups assets file pairs
 * into appropriately sized bundles.
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Generator
 */
export function* makeArweaveBundleUploadGenerator(
  uiFiles: Array<UIFile>,
  jwk: any
): Generator<null | Promise<UploadGeneratorResult>> {
  const signer = new ArweaveSigner(jwk);
  const arweave = getArweave();

  // Yield null value before processing files & uploading bundles for initialization.
  yield Promise.resolve(null);

  const files = uiFiles.map(({ file, buffer }) => ({
    key: file.name,
    buffer,
    file,
  }));

  // As long as we still have files needing upload
  while (files.length) {
    // compute the next range of files we can include in the next bundle.
    const range = getBundleRange(files);
    if (range === undefined) {
      return;
    }
    // process the files into a bundle.
    const result = processBundleFiles(signer, files, range).then(
      ([results, dataItems]) =>
        bundleAndUpload(arweave, signer, jwk, results, dataItems)
    );
    yield result;
  }
}
