import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import React, { useContext, useEffect, useState } from "react";
import { AlertContext } from "../providers/alert-provider";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { shortenAddress } from "../util/shorten-address";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { BundlrContext } from "../providers/bundlr-provider";

export default function ArweaveWallet() {
  const wallet = useWallet();
  const [solBalance, setSolBalance] = useState<number>();
  const { connection } = useConnection();
  const { balance: bundlrBalance, bundlerHttpAddress } =
    useContext(BundlrContext);

  const { setAlertState } = useContext(AlertContext);

  useEffect(() => {
    if (wallet?.publicKey) {
      const iv = setInterval(() => {
        connection.getBalance(wallet?.publicKey).then((b) => setSolBalance(b));
      }, 1000);

      return () => clearInterval(iv);
    }
  }, [connection, wallet?.publicKey]);

  return (
    <>
      <div className="card bg-primary">
        <div className="card-body p-4">
          <div className="flex flex-row gap-5 items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="arweave-logo.jpeg"
              className="rounded-full w-14 h-14"
              width="56"
              height="56"
            />
            <div>
              Address:
              <CopyToClipboard
                text={wallet?.publicKey?.toBase58()}
                onCopy={() =>
                  setAlertState({
                    message: "Copied to clipboard!",
                    duration: 2000,
                    open: true,
                  })
                }
              >
                <span className={`cursor-pointer ml-1`}>
                  {shortenAddress(wallet?.publicKey?.toBase58())}
                </span>
              </CopyToClipboard>
              <p>Balance: {solBalance / LAMPORTS_PER_SOL} SOL</p>
            </div>

            <div>
              <div>Bundlr: {bundlerHttpAddress}</div>
              <div>Funding: {+bundlrBalance / LAMPORTS_PER_SOL} SOL</div>
            </div>

            <div className="ml-auto">
              <div className="btn-group"></div>
            </div>
          </div>
        </div>
      </div>
      {solBalance / LAMPORTS_PER_SOL < 0.02 && (
        <div className="alert alert-error mt-6 border border-red-500">
          Warning! Your balance is too low to mint reliably!
        </div>
      )}
    </>
  );
}
