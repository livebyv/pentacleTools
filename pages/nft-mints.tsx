import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { SOL_ADDRESS_REGEXP } from "../util/validators";
import { useModal } from "../contexts/ModalProvider";
import { useAlert } from "../contexts/AlertProvider";
import { getMints } from "../util/get-mints";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import Head from "next/head";
import { download } from "../util/download";

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
  const { setAlertState } = useAlert();
  const { connected, publicKey } = useWallet();
  const [counter, setCounter] = useState(0);
  const fetchMints = async (val = "") => {
    setAlertState({
      message: (
        <button className="btn btn-ghost loading">
          Downloading your data.
        </button>
      ),
      open: true,
    });
    setLoading(true);
    getMints(val, connection, setCounter)
      .then((mints) => {
        download(`mints-cmid-${val}.json`, JSON.stringify(mints));
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
        setAlertState({
          message: "",
          open: false,
        });
        setLoading(false);
      });
  };

  const pubkeyString = publicKey?.toBase58();

  return (
    <>
      <Head>
        <title>🛠️ Pentacle Tools - 🆔 NFT Minters</title>
      </Head>
      <div className="mb-3 w-full max-w-full text-center">
        <h1 className="text-3xl text-white">Get NFT Mints</h1>
        <hr className="my-4 opacity-10" />
      </div>
      {/* <div className="alert">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="flex-shrink-0 w-6 h-6 stroke-current"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <div className="block">
          <div>
            Due to changes in Solanas software this tool no longer functions.
            Head over to
            <a href="https://magiceden.io/mintlist-tool">
              https://magiceden.io/mintlist-tool
            </a>{" "}
            for a working version.
          </div>
        </div>
      </div> */}
      <p className="px-2 text-center">
        This tool gets all mint IDs associated with the given address.
      </p>
      <hr className="my-4 opacity-10" />
      <div className="px-2 text-center">
        <div className="alert">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="flex-shrink-0 w-6 h-6 stroke-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <div className="block">
            <div>
              Be aware: One of the more recent updates to Solana included a size
              filter for certain calls, which is why we can no longer query as
              we used to. Right now this site is implementing experimental
              crawling. It can be quite slow (&gt;30 minutes) and is not 100%
              reliable.
            </div>
            <div>
              <strong>
                This can be used with both, Verified Creator ID as well as CM
                ID!
              </strong>
            </div>
          </div>
        </div>
      </div>
      <hr className="my-4 opacity-10" />
      <div className="bg-gray-900 card">
        <form
          onSubmit={handleSubmit(({ address }) => fetchMints(address))}
          className={`flex flex-col w-full`}
        >
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
            <div className="flex gap-4 justify-center items-center mt-6">
              <button
                className={`btn btn-primary rounded-box shadow-lg ${
                  loading ? "loading" : ""}`}
                disabled={errors?.address}
                type="submit"
              >
                {loading ? `Getting Mints.. ${counter} so far ` : "Get Mints!"}
              </button>
              {connected ? (
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
              ) : (
                <></>
              )}
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
