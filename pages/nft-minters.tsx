import React, { useCallback, useContext, useState } from "react";
import { download } from "../util/download";
import jsonFormat from "json-format";
import { ModalContext } from "../providers/modal-provider";
import { useForm } from "react-hook-form";
import { getAddresses, validateSolAddressArray } from "../util/validators";
import { AlertContext } from "../providers/alert-provider";
import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { from, mergeMap, tap, toArray } from "rxjs";
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
  const { connection } = useConnection();

  const fetchMinters = useCallback(
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
      let i = 0;
      const owners = [];
      const errors = [];
      const fetchOwner = async (addy: string) => {
        let tx;
        let firstSig;
        let txContent;
        let owner;
        while (!owner) {
          try {
            tx = await connection.getConfirmedSignaturesForAddress2(
              new PublicKey(addy)
            );
            firstSig = tx.sort((a, b) => a.blockTime - b.blockTime)[0];
            if (firstSig?.signature) {
              txContent = await connection.getTransaction(firstSig?.signature);

              owner = txContent?.meta?.postTokenBalances[0]?.owner;
              if (owner) {
                owners.push(owner);
              }
            }
          } catch (e) {
            console.error(e?.message || e);
            errors.push({ address: addy, error: e?.message || e });
          }
        }
      };

      from(parsed)
        .pipe(
          mergeMap(
            (addy) =>
              from(fetchOwner(addy)).pipe(
                tap((res) => {
                  i++;
                  setCounter(i);
                })
              ),
            12
          ),
          toArray()
        )
        .subscribe(() => {
          download(
            `minters-${Date.now()}.json`,
            jsonFormat({ owners: [...owners], errors })
          );
        });
    },
    [endpoint, setAlertState, setModalState]
  );

  return (
    <>
      <Head>
        <title>🛠️ Pentacle Tools - 👛 NFT Minters</title>
      </Head>
      <div className="prose max-w-full text-center mb-3">
        <h1 className="text-4xl  text-white">NFT Minters</h1>
        <hr className="opacity-10 my-4" />
      </div>
      <p className="px-2 text-center">
        This tools gives you a list of first minters for a list of Solana NFTs.
        This helps you e.g. for airdrops to those who initially minted your NFT
        collection.
      </p>
      <hr className="my-4 opacity-10" />
      <div className="card bg-gray-900 max-w-full">
        <form
          onSubmit={handleSubmit(fetchMinters)}
          className={`w-full flex flex-col`}
        >
          <div className="card-body">
            <label className="mb-4 justify-center label">
              Please enter SOL mint IDs as JSON array to get their minters.
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
                {loading ? `${counter} / ${len}` : "Get Minters"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
