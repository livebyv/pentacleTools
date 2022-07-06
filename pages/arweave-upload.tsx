import { JWKInterface } from "arweave/node/lib/wallet";
import React, { useCallback, useEffect, useState } from "react";
import { FileUpload } from "../components/file-upload";
import { download } from "../util/download";
import jsonFormat from "json-format";
import Image from "next/image";
import { CopyToClipboard } from "../components/copy-to-clipboard";
import { makeArweaveBundleUploadGenerator } from "../util/upload-arweave-bundles/upload-generator";
import { useForm } from "react-hook-form";
import { getArweave } from "../util/upload-arweave-bundles/reference";
import { shortenAddress } from "../util/shorten-address";
import { useFiles } from "../contexts/FileProvider";
import Head from "next/head";
import { DownloadIcon, LinkIcon, TrashIcon } from "../components/icons";
import { toast } from "react-toastify";

export const generateArweaveWallet = async () => {
  const arweave = getArweave();
  const key = await arweave.wallets.generate();
  localStorage.setItem("arweave-key", JSON.stringify(key));
  return key;
};

const fileToBuffer = (
  file: File
): Promise<{ buffer: ArrayBuffer; file: File }> => {
  return new Promise((resolve) => {
    var reader = new FileReader();

    reader.onload = function (readerEvt) {
      var buffer = readerEvt.target.result;

      resolve({
        buffer: buffer as ArrayBuffer,
        file,
      });
    };

    reader.readAsArrayBuffer(file);
  });
};

export const getKeyForJwk = (jwk) => {
  const arweave = getArweave();
  return arweave.wallets.jwkToAddress(jwk);
};

export default function GetARLinks() {
  const [jwk, setJwk] = useState<JWKInterface>();
  const [address, setAddress] = useState<string>();
  const [balance, setBalance] = useState("none");
  const { files } = useFiles();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit } = useForm();

  const generate = useCallback(async () => {
    const jwk = await generateArweaveWallet();

    localStorage.setItem("arweave-key", JSON.stringify(jwk));
    const _address = await getKeyForJwk(jwk);
    setAddress(_address);
    setJwk(jwk);
  }, []);

  useEffect(() => {
    (async () => {
      const previousKey = localStorage.getItem("arweave-key");
      if (!previousKey) {
        return;
      }
      if (!address) {
        try {
          const parsed = JSON.parse(previousKey);
          setJwk(parsed);
          const _address = await getKeyForJwk(parsed);
          setAddress(_address);
        } catch (e) {
          console.log(e);
        }
      }
    })();
  }, [address]);

  const upload = useCallback(async () => {
    setLoading(true);
    const f = await Promise.all(files.map(fileToBuffer));

    // Arweave Native storage leverages Arweave Bundles.
    // It allows to encapsulate multiple independent data transactions
    // into a single top level transaction,
    // which pays the reward for all bundled data.
    // https://github.com/Bundlr-Network/arbundles
    // Each bundle consists of one or multiple files.
    // Initialize the Arweave Bundle Upload Generator.
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Generator
    const arweaveBundleUploadGenerator = makeArweaveBundleUploadGenerator(
      f,
      jwk
    );

    let bundleUploader = arweaveBundleUploadGenerator.next();
    let results = [];

    while (!bundleUploader.done) {
      const bundlingResult = await bundleUploader.value;
      if (bundlingResult) {
        results.push(
          ...bundlingResult.items.map((i) => ({ link: i.link, name: i.name }))
        );
      }
      bundleUploader = arweaveBundleUploadGenerator.next();
    }

    setLoading(false);
    const filename = `AR-upload-${Date.now()}.json`;
    download(filename, jsonFormat(results));
  }, [files, jwk]);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (address) {
        const balance = await getArweave().wallets.getBalance(address);
        setBalance(getArweave().ar.winstonToAr(balance));
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [address, balance]);

  const importKey = async (key) => {
    try {
      const parsed = JSON.parse(key);
      const addr = await getArweave()?.wallets.jwkToAddress(parsed);
      setJwk(parsed);
      setAddress(addr);
      localStorage.setItem("arweave-key", key);
      toast("Successfully imported key!", {
        autoClose: 3000,
        type: "error",
      });
    } catch (e) {
      console.log(e);
      toast("An error occured!", {
        autoClose: 3000,
        type: "error",
      });
    }
  };

  const clipboardNotification = () =>
    toast("Copied to clipboard!", {
      autoClose: 2000,
    });

  const onSubmit = handleSubmit(({ key }) => importKey(key));

  return (
    <>
      <Head>
        <title>🛠️ Pentacle Tools - ⬆️ Arweave Upload</title>
      </Head>
      <div className="mb-3 max-w-full text-center">
        <h2 className="text-3xl text-white">Arweave Upload</h2>
        <hr className="my-4 opacity-10" />
      </div>
      <div className="flex flex-col">
        <div className="px-2 mb-4 text-center">
          This tool lets you upload files to arweave. Currently limited to 150mb
          total per batch of files. <br />
          To reset the form please reload.
          <br />
          <strong>
            Caution: Beta Version! Often files will have a delay before showing
            up behind the URL.{" "}
          </strong>
          <strong>
            Make sure to check on them before using in production!
          </strong>
          <br />
          <hr className="my-3 opacity-10" />
          Send some AR to this wallet to start uploading. You can download and
          empty the wallet later.
          <br /> You can get AR on{" "}
          <a
            href="https://binance.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Binance
          </a>
        </div>
        {!jwk && (
          <div className="bg-gray-900 card">
            <div className="card-body">
              <button
                className={`btn btn-primary rounded-box inline-block mx-auto mb-3 shadow-lg ${
                  loading ? "loading" : ""}`}
                onClick={generate}
              >
                Generate Wallet
              </button>
              <form className="flex flex-col" onSubmit={onSubmit}>
                <div className="text-center">Or</div>
                <label htmlFor="key" className="label">
                  Import Wallet (JWK JSON)
                </label>
                <textarea
                  {...register("key")}
                  className="w-full shadow-lg textarea"
                  rows={10}
                  id="key"
                />
                <div className="mt-6 text-center">
                  <button
                    className={`shadow-lg btn btn-primary rounded-box`}
                    type="submit"
                  >
                    Import
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {jwk && (
          <div
            className="mx-auto my-4 max-w-full text-white shadow-lg card bg-primary"
            style={{ width: 400 }}
          >
            <div className="p-4 card-body">
              <div className="flex flex-row gap-5 items-center">
                <Image
                  src="https://shdw-drive.genesysgo.net/FihpNAwDm8i6gBsqeZjV9fn8SkkpYFgcWt5BSszPusnq/arweave.png"
                  className="w-14 h-14 rounded-full shadow-lg"
                  width="56"
                  height="56"
                  alt="Arweave Logo"
                />
                <div>
                  Address:
                  <CopyToClipboard
                    text={address}
                    onCopy={clipboardNotification}
                  >
                    <span className={`ml-1 cursor-pointer`}>
                      {shortenAddress(address)}
                    </span>
                  </CopyToClipboard>
                  <p>
                    Balance:{" "}
                    {balance === "none" ? (
                      <button className="btn btn-ghost loading" />
                    ) : (
                      (+balance).toFixed(6)
                    )}
                  </p>
                </div>

                <div className="ml-auto">
                  <div className="btn-group">
                    <button
                      onClick={() => {
                        if (
                          !confirm(
                            "Are you sure you want to delete this key? Make sure you have a backup!"
                          )
                        ) {
                          return;
                        }
                        setJwk(undefined);
                        setAddress(undefined);
                        localStorage.removeItem("arweave-key");
                      }}
                      title="Delete"
                      className="shadow-lg btn btn-circle btn-sm"
                    >
                      <i>
                        <TrashIcon width={16} height={16} />
                      </i>
                    </button>
                    <button
                      onClick={() =>
                        download(`arweave-${address}.json`, jsonFormat(jwk))
                      }
                      className="shadow-lg btn btn-circle btn-sm"
                      title="Download"
                    >
                      <DownloadIcon width={16} height={16} />
                    </button>
                    <button className="shadow-lg btn btn-circle btn-sm">
                      <a
                        href={`https://viewblock.io/arweave/address/${address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="View on explorer"
                      >
                        <LinkIcon width={16} height={16} />
                      </a>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {jwk && (
          <div className="max-w-full bg-gray-900 card">
            <div className="card-body">
              <div className="mt-4">
                <FileUpload />
              </div>
              {!!files.length && (
                <div className="mt-6 text-center">
                  <button
                    className={`btn btn-primary rounded-box shadow-lg ${
                      loading ? "loading" : ""}`}
                    disabled={!files.length}
                    onClick={upload}
                  >
                    {loading ? "Uploading..." : "Upload"}
                  </button>
                  <br />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
