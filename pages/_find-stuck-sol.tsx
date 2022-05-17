import React, { useContext, useEffect, useState } from "react";
import { SOL_ADDRESS_REGEXP } from "../util/validators";
import { getStuckSol } from "../util/get-stuck-sol";
import { ModalContext } from "../providers/modal-provider";
import { useForm } from "react-hook-form";
import { AlertContext } from "../providers/alert-provider";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";

export default function GibStuckSol() {
  const { publicKey } = useWallet();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [loading, setLoading] = useState(false);
  const { setModalState } = useContext(ModalContext);
  const endpoint = process.env.NEXT_PUBLIC_RPC!;
  const { setAlertState } = useContext(AlertContext);

  const fetchStuckSol = ({ address }) => {
    setAlertState({
      message: "Grabbing Candy Machine Data...",
      open: true,
    });

    setLoading(true);
    getStuckSol(address, endpoint)
      .then(({ total, accounts }) => {
        setModalState({
          message:
            total === 0
              ? "No SOL stuck in any accounts"
              : `${total} SOL are in ${accounts} accounts`,
          open: true,
        });
      })
      .catch((e) => {
        setModalState({
          message: e,
          open: true,
        });
      })
      .finally(() => {
        setLoading(false);
        setAlertState({ open: false });
      });
  };

  return (
    <>
      <div className="prose max-w-full text-center mb-3">
        <h1 className="text-4xl text-white">Find stuck SOL</h1>
        <hr className="opacity-10 my-4" />
      </div>
      <p className="px-2 text-center">
        This tool finds out how much SOL you have stuck in candy machine rents.{" "}
        <br />
        <a
          target="_blank"
          rel="noreferrer"
          style={{ textDecoration: "underline" }}
          href="https://github.com/staccDOTsol/candy_config_refunds.MD"
        >
          {" "}
          Made possible by this script by stacc.sol
        </a>
      </p>
      <hr className="opacity-10 my-4" />

      <div className="card bg-gray-900">
        <form onSubmit={handleSubmit(fetchStuckSol)}>
          <div className="card-body">
            <label className="mb-4 justify-center label">
              Please enter SOL address to get amount of SOL stuck in candy
              machines
            </label>

           <div className="w-full text-center">
           <WalletMultiButton style={{margin: '0 auto'}} />
           </div>


            <>
              <div className="w-full text-center text-xl my-2">
                Or
              </div>
              <input
                {...register("address", {
                  required: "Field is required",
                  pattern: {
                    value: SOL_ADDRESS_REGEXP,
                    message: "Invalid address",
                  },
                })}
                className={`input shadow-lg w-full ${
                  !!errors?.address?.message && "input-error"
                }`}
              />
            </>
            {!!errors?.address?.message && (
              <label className="label text-error">
                {errors?.address?.message}
              </label>
            )}
            <div className="text-center mt-6">
              <button
                className={`btn btn-primary rounded-box shadow-lg ${
                  loading ? "loading" : ""
                }`}
                disabled={errors?.address}
                onClick={() => fetchStuckSol({ address: publicKey.toBase58() })}
              >
                {loading ? "Getting configs.." : "Find Stuck SOL"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
