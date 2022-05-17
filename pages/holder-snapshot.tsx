import React, { useCallback, useContext, useState } from "react";
import { getHolders } from "../util/holder-snapshot";
import { download } from "../util/download";
import jsonFormat from "json-format";
import { ModalContext } from "../providers/modal-provider";
import { useForm } from "react-hook-form";
import { getAddresses, validateSolAddressArray } from "../util/validators";
import { AlertContext } from "../providers/alert-provider";
import Head from "next/head";
export default function GetHolders() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [counter, setCounter] = useState(0);
  const [len, setLen] = useState(0);
  const [loading, setLoading] = useState(false);
  const { setModalState } = useContext(ModalContext);
  const { setAlertState } = useContext(AlertContext);
  const endpoint = process.env.NEXT_PUBLIC_RPC!;
  const fetchHolders = useCallback(
    async ({ mints }: { mints: string }) => {
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

      getHolders(
        parsed,
        setCounter,
        endpoint,
        localStorage.getItem("auth-token") ||
          (await (await fetch("/api/get-token")).json()).access_token
      ).subscribe({
        next: (e) => {
          download("gib-holders.json", jsonFormat(e, { size: 1, type: "tab" }));
          setLoading(false);
        },
        error: (e) => {
          setModalState({
            open: true,
            message: JSON.stringify(e),
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
    },
    [endpoint, setAlertState, setModalState]
  );

  return (
    <>
      <Head>
        <title>🛠️ Pentacle Tools - 📷 NFT Holders</title>
      </Head>
      <div className="prose max-w-full text-center mb-3">
        <h1 className="text-4xl  text-white">Holder Snapshot</h1>
        <hr className="opacity-10 my-4" />
      </div>
      <p className="px-2 text-center">
        This tools gives you a snapshot of holders from Solana Mint IDs. It will
        return an object with holders, mints and amounts.
        <br />
        <strong>Works with SPLs as well as NFTs</strong>
      </p>
      <hr className="my-4 opacity-10" />
      <div className="card bg-gray-900 max-w-full">
        <form
          onSubmit={handleSubmit(fetchHolders)}
          className={`w-full flex flex-col`}
        >
          <div className="card-body">
            <label className="mb-4 justify-center label">
              Please enter SOL mint IDs as JSON array to get their holders.
            </label>

            <textarea
              {...register("mints", {
                validate: validateSolAddressArray,
                required: "Field is required",
              })}
              rows={4}
              className={`textarea w-full shadow-lg`}
            />
            {!!errors?.mints?.message && (
              <label className="label text-error">
                {errors?.mints?.message}
              </label>
            )}
            <div className="text-center mt-6">
              <button
                type="submit"
                disabled={!!errors?.mints}
                className={`btn btn-primary rounded-box shadow-lg ${
                  loading ? "loading" : ""
                }`}
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
