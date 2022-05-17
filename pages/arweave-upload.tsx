import { JWKInterface } from "arweave/node/lib/wallet";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { FileUpload } from "../components/file-upload";
import { download } from "../util/download";
import jsonFormat from "json-format";
import Image from "next/image";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { makeArweaveBundleUploadGenerator } from "../util/upload-arweave-bundles/upload-generator";
import { Spinner } from "../components/spinner";
import { useForm } from "react-hook-form";
import { getArweave } from "../util/upload-arweave-bundles/reference";
import { shortenAddress } from "../util/shorten-address";
import { AlertContext } from "../providers/alert-provider";
import { ArweaveURI } from "../util/arweave-uri";
import { useFiles } from "../hooks/use-files";
import { WebBundlr } from "@bundlr-network/client";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  getPhantomWallet,
  getSolflareWallet,
} from "@solana/wallet-adapter-wallets";
import Head from "next/head";

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
  const { setAlertState } = useContext(AlertContext);
  const wallet = useWallet();

  const generate = useCallback(async () => {
    const jwk = await generateArweaveWallet();

    localStorage.setItem("arweave-key", JSON.stringify(jwk));
    const _address = await getKeyForJwk(jwk);
    setAddress(_address);
    setJwk(jwk);
  }, []);

  const initialiseBundlr = async () => {
    const selector = document.querySelector(
      ".wallet-adapter-button-start-icon img"
    );
    const provName = selector?.attributes
      .getNamedItem("alt")
      .value.split(" ")[0];
    const getProvider = async (name) => {
      wallet;
    };

    const bundlr = new WebBundlr(
      "https://node1.bundlr.network",
      "solana",
      await getProvider(provName)
    );
    await bundlr.ready();
    return bundlr; // done!
  };

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
  useEffect(() => {
    (async () => {
      if (wallet.connected) {
        const bundlr = await initialiseBundlr();
        console.log(bundlr)
      }
    })();
  }, [wallet.connected]);

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

    console.log(results);
    setLoading(false);
    download(`AR-upload-${Date.now()}.json`, jsonFormat(results));
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

  const importKey = useCallback(
    async (key) => {
      try {
        const parsed = JSON.parse(key);
        const addr = await getArweave()?.wallets.jwkToAddress(parsed);
        setJwk(parsed);
        setAddress(addr);
        localStorage.setItem("arweave-key", key);
        setAlertState({
          message: "Successfully imported key!",
          open: true,
          duration: 3000,
        });
      } catch (e) {
        console.log(e);
        setAlertState({
          message: "Key could not be imported!",
          open: true,
          duration: 3000,
          severity: "error",
        });
      }
    },
    [setAlertState]
  );

  const clipboardNotification = useCallback(() => {
    setAlertState({
      message: "Copied to clipboard!",
      duration: 2000,
      open: true,
    });
  }, [setAlertState]);

  const onSubmit = handleSubmit(({ key }) => importKey(key));

  return (
    <>
         <Head>
        <title>🛠️ Pentacle Tools - ⬆️ Arweave Upload</title>
      </Head>
      <div className="prose max-w-full text-center mb-3">
        <h1 className="text-4xl text-white">Arweave Upload</h1>
        <hr className="opacity-10 my-4" />
      </div>
      <div className="flex flex-col">
        <div className="px-2 text-center mb-4">
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
          <div className="card bg-gray-900">
            <div className="card-body">
              <button
                className={`btn btn-primary rounded-box inline-block mx-auto mb-3 shadow-lg ${
                  loading ? "loading" : ""
                }`}
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
                  className="textarea shadow-lg w-full"
                  rows={10}
                  id="key"
                />
                <div className="text-center mt-6">
                  <button
                    className={`btn btn-primary rounded-box shadow-lg`}
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
            className="card bg-primary text-white shadow-lg max-w-full mx-auto my-4"
            style={{ width: 400 }}
          >
            <div className="card-body p-4">
              <div className="flex flex-row gap-5 items-center">
                <Image
                  src={ArweaveURI.ArweaveLogo}
                  className="rounded-full w-14 h-14 shadow-lg"
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
                    <span className={`cursor-pointer ml-1`}>
                      {shortenAddress(address)}
                    </span>
                  </CopyToClipboard>
                  <p>
                    Balance:{" "}
                    {balance === "none" ? <Spinner /> : (+balance).toFixed(6)}
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
                      className="btn btn-circle btn-sm shadow-lg"
                    >
                      <i className="fa fa-trash"></i>
                    </button>
                    <button
                      onClick={() =>
                        download(`arweave-${address}.json`, jsonFormat(jwk))
                      }
                      className="btn btn-circle btn-sm shadow-lg"
                      title="Download"
                    >
                      <i className="fa fa-download"></i>
                    </button>
                    <a
                      href={`https://viewblock.io/arweave/address/${address}`}
                      target="_blank"
                      className="btn btn-circle btn-sm shadow-lg"
                      rel="noreferrer"
                      title="View on explorer"
                    >
                      <i className="fa fa-external-link-alt"></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {jwk && (
          <div className="card bg-gray-900 max-w-full">
            <div className="card-body">
              <div className="mt-4">
                <FileUpload />
              </div>

              {!!files.length && (
                <div className="text-center mt-6">
                  <button
                    className={`btn btn-primary rounded-box shadow-lg ${
                      loading ? "loading" : ""
                    }`}
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
