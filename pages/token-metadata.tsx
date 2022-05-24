import React, { useState } from "react";
import { fetchMetaForUI } from "../util/token-metadata";
import { download } from "../util/download";
import jsonFormat from "json-format";
import { useModal } from "../contexts/ModalProvider";
import { useForm } from "react-hook-form";
import { getAddresses, validateSolAddressArray } from "../util/validators";
import { useAlert } from "../contexts/AlertProvider";
import Head from "next/head";
import { useConnection } from "@solana/wallet-adapter-react";

export default function GetMeta() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [loading, setLoading] = useState(false);
  const [counter, setCounter] = useState(0);
  const [len, setLen] = useState(0);
  const { setModalState } = useModal();
  const { connection } = useConnection();
  const { setAlertState } = useAlert();

  const fetchMeta = ({ mints }: { mints: string }) => {
    const parsed = getAddresses(mints);

    setAlertState({
      message: (
        <button className="btn btn-disabled btn-ghost loading">
          Downloading your data.
        </button>
      ),
      open: true,
    });

    setLen(parsed.length);
    setLoading(true);
    fetchMetaForUI(parsed, setCounter, connection).subscribe({
      next: (e) => {
        download("gib-meta.json", jsonFormat(e, { size: 1, type: "tab" }));
        setLoading(false);
      },
      error: (e) => {
        setModalState({
          message: e?.message ? e.message : "An error occurred",
          open: true,
        });
        setLoading(false);
      },
      complete: () => {
        setAlertState({
          message: "",
          open: false,
        });
      },
    });
  };

  return (
    <div>
      <Head>
        <title>🛠️ Pentacle Tools - ℹ️ NFT Metadata</title>
      </Head>
      <div className="w-full max-w-full text-center mb-3">
        <h1 className="text-3xl text-white">Token Metadata</h1>
        <hr className="opacity-10 my-4" />
      </div>
      <p className="px-2 text-center">
        This tool gives you onchain an arweave/ipfs metadata from Solana Mint
        IDs.
      </p>
      <hr className="opacity-10 my-4" />
      <div className="card bg-gray-900 max-w-full">
        <form
          onSubmit={handleSubmit(fetchMeta)}
          className="w-full flex flex-col"
        >
          <div className="card-body">
            <label htmlFor="mints" className="label mb-4 justify-center">
              Please enter SOL mint IDs to get their metadata
            </label>
            <textarea
              {...register("mints", {
                validate: validateSolAddressArray,
                required: "Field is required",
              })}
              rows={4}
              className={`textarea w-full shadow-lg ${
                !!errors?.mints && "input-error"
              }`}
              id="mints"
              name="mints"
            />
            {!!errors?.mints?.message && (
              <label className="label text-error">
                {errors?.mints?.message}
              </label>
            )}
            <div className="text-center mt-6">
              <button
                className={`btn btn-primary rounded-box shadow-lg ${
                  loading ? "loading" : ""
                }`}
                type="submit"
              >
                {loading ? `${counter} / ${len}` : "Get Meta"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
