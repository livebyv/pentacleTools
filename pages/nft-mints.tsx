import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { SOL_ADDRESS_REGEXP } from "../util/validators";
import { useModal } from "../contexts/ModalProvider";
import { getMints } from "../util/get-mints";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import Head from "next/head";
import { download } from "../util/download";
import { toast } from "react-toastify";
import DownloadHistory from "../components/download-history";
import { CameraIcon, CoinsIcon, InfoIcon } from "../components/icons";
import Link from "next/link";
import { useRouter } from "next/router";

export default function GibMints() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm();
  const [loading, setLoading] = useState(false);
  const { setModalState } = useModal();
  const { connection } = useConnection();
  const { connected, publicKey } = useWallet();
  const [counter, setCounter] = useState(0);
  const pubkeyString = useMemo(() => publicKey?.toBase58(), [publicKey]);
  const [localStorageItems, setLocalStorageItems] = useState<
    { name: string; timestamp: number; items: any[] }[]
  >([]);

  const openActionModal = (jobName) => {
    setModalState({
      message: (
        <>
          <div>Successfully downloaded</div>
          <div>Use this data to...</div>

          <div className="grid gap-3 mt-6">
            <Link href={`/holder-snapshot?jobName=${jobName}`} passHref>
              <a>
                <button className="gap-3 py-3 w-full h-24 btn btn-accent">
                  <CameraIcon width={32} height={32} />
                  <div>Get Holder Snapshot</div>
                </button>
              </a>
            </Link>
            <Link href={`/token-metadata?jobName=${jobName}`} passHref>
              <a>
                <button className="gap-3 py-3 w-full h-24 btn btn-accent">
                  <InfoIcon width={32} height={32} />
                  <div> Get Token Metadata</div>
                </button>
              </a>
            </Link>
            <Link href={`/nft-minters?jobName=${jobName}`} passHref>
              <a>
                <button className="gap-3 py-3 w-full h-24 btn btn-accent">
                  <CoinsIcon width={32} height={32} />
                  <div>Get NFT Minters</div>
                </button>
              </a>
            </Link>
          </div>
        </>
      ),
      open: true,
    });
  };

  const fetchMints = async (val = "") => {
    toast("Downloading your data.", { isLoading: true });
    setLoading(true);
    getMints(val, connection, setCounter)
      .then((mints: any[]) => {
        const now = Date.now();
        const name = `mints-cmid-${val}-${now}`;
        const output = {
          name: name,
          timestamp: now,
          items: mints,
        };
        const outputAsString = JSON.stringify(output);
        download(`${name}.json`, outputAsString);
        const updatedItems = localStorageItems
          ? [...localStorageItems, output]
          : [output];
        setLocalStorageItems(updatedItems);
        localStorage.setItem("user-mint-lists", JSON.stringify(updatedItems));
        openActionModal(name);
        setLoading(false);
      })
      .catch((e) => {
        try {
          setModalState({
            message: e?.message || e,
            open: true,
          });
        } catch {
          setLoading(false);
        }
      })
      .finally(() => {
        toast.dismiss();
        setLoading(false);
        setCounter(0);
      });
  };

  return (
    <>
      <Head>
        <title>🛠️ Cryptostraps Tools - 🆔 NFT Minters</title>
      </Head>
      <div className="mb-3 w-full max-w-full text-center">
        <h1 className="text-3xl text-white">Get NFT Mints</h1>
        <hr className="my-4 opacity-10" />
      </div>
      <p className="text-center">
        This tool gets all mint IDs associated with the given address.
      </p>
      <hr className="my-4 opacity-10" />
      <div className="bg-gray-900 card">
        <div className="card-body">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
            <div className="md:col-start-2 md:col-span-3">
              <label className="justify-center mb-4 label">
                Please enter CM ID or Verified Creator
              </label>
              <input
                {...register("address", {
                  required: "This field is required!",
                  pattern: {
                    value: SOL_ADDRESS_REGEXP,
                    message: "Invalid address",
                  },
                })}
                required
                type="text"
                className={`input shadow-lg w-full ${
                  !!errors?.address?.message && "input-error"
                }`}
                id="address-field"
                autoComplete="on"
              />
              {!!errors?.address?.message && (
                <label className="label text-error">
                  {errors?.address?.message}
                </label>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-4 justify-center items-center mt-6">
            <form
              onSubmit={handleSubmit(({ address }) => fetchMints(address))}
              className={`flex flex-col w-full`}
            >
              <div className="text-center">
                <button
                  className={`btn btn-primary rounded-box shadow-lg ${
                    loading ? "loading" : ""}`}
                  disabled={!!errors?.address}
                  type="submit"
                >
                  {loading && counter === 0 && `Getting transactions...`}
                  {loading &&
                    counter > 0 &&
                    `Getting Mints.. ${counter} so far `}
                  {!loading && "Get Mints!"}
                </button>
              </div>

              {connected ? (
                <div className="mt-3 text-center">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setValue("address", pubkeyString);
                      fetchMints(pubkeyString);
                    }}
                    className="btn btn-primary rounded-box"
                  >
                    {" "}
                    Use Wallet <br />
                    {pubkeyString.slice(0, 3)}...
                    {pubkeyString.slice(
                      pubkeyString.length - 3,
                      pubkeyString.length
                    )}
                  </button>
                </div>
              ) : (
                <></>
              )}
            </form>

            {!!localStorageItems?.length && (
              <DownloadHistory
                localstorageId="nft-mints"
                localStorageItems={localStorageItems}
                setLocalStorageItems={setLocalStorageItems}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
