import React, { useCallback, useState } from "react";
import jsonFormat from "json-format";
import { useForm } from "react-hook-form";
import Head from "next/head";
import { useConnection } from "@solana/wallet-adapter-react";

import { getAddresses, validateSolAddressArray } from "../util/validators";
import { useModal } from "../contexts/ModalProvider";
import { useAlert } from "../contexts/AlertProvider";
import { getOwners } from "../util/holder-snapshot";
import { download } from "../util/download";

export default function HolderSnapshot() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [counter, setCounter] = useState(0);
  const [len, setLen] = useState(0);
  const [loading, setLoading] = useState(false);
  const { setModalState } = useModal();
  const { setAlertState } = useAlert();
  const { connection } = useConnection();
  const fetchHolders = useCallback(
    async ({ mints }: { mints: string }) => {
      const parsed = getAddresses(mints);
      setAlertState({
        message: (
          <button className="btn btn-ghost loading">
            Downloading your data.
          </button>
        ),
        open: true,
      });
      setLen(parsed.length);
      setLoading(true);

      const owners = await getOwners(parsed, connection, setCounter).catch(
        () => {
          setModalState({
            open: true,
            message: "An error occured!",
          });
          setLoading(false);
        }
      );

      const filename = "gib-holders.json";
      download(filename, jsonFormat(owners, { size: 1, type: "tab" }));
      setLoading(false);
      setModalState({
        message: `Successfully downloaded ${filename}`,
        open: true,
      });
    },
    [setAlertState, setModalState, connection]
  );

  return (
    <>
      <Head>
        <title>🛠️ Pentacle Tools - 📷 NFT Holders</title>
      </Head>
      <div className="mb-3 w-full max-w-full text-center">
        <h1 className="text-3xl text-white">Holder Snapshot</h1>
        <hr className="my-4 opacity-10" />
      </div>
      <p className="px-2 text-center">
        This tool gives you a snapshot of holders from Solana Mint IDs. It will
        return an object with holders, mints and amounts.
        <br />
        <strong>Works with SPLs as well as NFTs</strong>
      </p>
      <hr className="my-4 opacity-10" />
      <div className="max-w-full bg-gray-900 card">
        <form
          onSubmit={handleSubmit(fetchHolders)}
          className={`flex flex-col w-full`}
        >
          <div className="card-body">
            <label className="justify-center mb-4 label">
              Please enter SOL mint IDs as JSON array to get their holders.
            </label>

            <textarea
              {...register("mints", {
                validate: validateSolAddressArray,
                required: "Field is required",
              })}
              rows={4}
              className={`w-full shadow-lg textarea`}
            />
            {!!errors?.mints?.message && (
              <label className="label text-error">
                {errors?.mints?.message}
              </label>
            )}
            <div className="mt-6 text-center">
              <button
                type="submit"
                disabled={!!errors?.mints}
                className={`btn btn-primary rounded-box shadow-lg ${loading ? "loading" : ""}`}
              >
                {loading ? `${counter} / ${len}` : "Get Holders"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
