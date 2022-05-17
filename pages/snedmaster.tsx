import React, { useCallback, useContext, useEffect, useState } from "react";
import jsonFormat from "json-format";
import { download } from "../util/download";
import { CopyToClipboard } from "react-copy-to-clipboard";
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { AlertContext } from "../providers/alert-provider";
import IdField from "../components/id-field";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { createTransferInstruction } from "@solana/spl-token";

export default function Snedmaster() {
  const [loading, setLoading] = useState(false);
  const { connection } = useConnection();
  const [solBalance, setSolBalance] = useState<number | "none">("none");
  const { setAlertState } = useContext(AlertContext);
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
  const wallet = useWallet();

  const mint = useCallback(
    async ({ amount, ids = "" }: { amount: string; ids: string }) => {
      try {
        let addresses;
        const getVal = () => {
          try {
            return JSON.parse(ids);
          } catch {
            if (ids.includes(",")) {
              return ids
                .split(",")
                .map((t) => t.trim())
                .filter((a) => a);
            }
            if (/\n/.exec(ids)?.length) {
              return ids
                .split("\n")
                .map((t) => t.trim())
                .filter((a) => a);
            }
            if (/\r/.exec(ids)?.length) {
              return ids
                .split("\r")
                .map((t) => t.trim())
                .filter((a) => a);
            }
            return [ids];
          }
        };
        addresses = getVal();

        const amt = parseFloat(amount);

        if (isNaN(amt)) {
          alert("Invalid amount!");
          return;
        }

        if (
          !confirm(`This send a total of ${amt * addresses.length} SOL to ${
            addresses.length
          } addresses. 
        Proceed?`)
        ) {
          return;
        }

        setLoading(true);

        if (!isSnackbarOpen) {
          setAlertState({
            message: "snedsnedsned...",
            open: true,
          });
          setIsSnackbarOpen(true);
        }

        const transferSol = async ({
          amount,
          destination,
        }: {
          amount: number;
          destination: string;
        }) => {
          let blockhash;
          while (!blockhash) {
            try {
              blockhash = await (
                await connection.getRecentBlockhash()
              ).blockhash;
            } catch (e) {
              console.log(e);
              await new Promise((resolve) => setTimeout(resolve, 1000));
            }
          }

          const tx = new Transaction({
            recentBlockhash: blockhash,
            feePayer: wallet?.publicKey,
          }).add(
            SystemProgram.transfer({
              lamports: amount * LAMPORTS_PER_SOL,
              toPubkey: new PublicKey(destination),
              fromPubkey: wallet?.publicKey,
            }),
            new TransactionInstruction({
              keys: [
                { pubkey: wallet?.publicKey, isSigner: true, isWritable: true },
              ],
              data: Buffer.from(`Sent by snedmaster at ${Date.now()}`, "utf-8"),
              programId: new PublicKey(
                "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"
              ),
            })
          );
          await new Promise((resolve) => setTimeout(resolve, 100));
          return { tx, destination, amount };
        };

        const reduced = (addresses as string[]).reduce((acc, curr) => {
          const found = acc.find((a) => a.destination === curr);
          if (found) {
            found.amount += amt;
          } else {
            acc.push({ amount: amt, destination: curr });
          }
          return acc;
        }, []);

        const txs = (
          await Promise.allSettled(reduced.map((a) => transferSol(a)))
        ).map((f) => f.status === "fulfilled" && f.value);
        await wallet.signAllTransactions(txs.map(({ tx }) => tx));
        const sigs = [];
        for (const tx of txs) {
          sigs.push({
            txId: await connection
              .sendRawTransaction(tx.tx.serialize())
              .catch((e) => {
                console.log(e);
                return "failed";
              }),
            amount: tx.amount,
            destination: tx.destination,
          });
        }
        download(`Airdrop-${Date.now()}.json`, jsonFormat(sigs));
      } catch (e) {
        console.error(e);
        setAlertState({
          severity: "error",
          message: "An error occured, check log out",
          duration: 5000,
        });
        setLoading(false);
      }
    },
    [connection, isSnackbarOpen, wallet]
  );

  const clipboardNotification = () =>
    setAlertState({ message: "Copied to clipboard!", duration: 2000 });

  useEffect(() => {
    const itv = setInterval(async () => {
      if (wallet?.publicKey) {
        setSolBalance(await connection.getBalance(wallet?.publicKey).catch());
      }
    }, 1000);
    return () => clearInterval(itv);
  }, [connection, wallet?.publicKey]);
  return (
    <>
      <div className="prose max-w-full text-center mb-3">
        <h1 className="text-4xl text-white">Snedmaster 9000</h1>
        <hr className="opacity-10 my-4" />
      </div>
      <p className="px-2 text-center">
        This tools sends out a certain amount of Solana to different addresses.
        <br />
        <strong>Warning</strong>: always check the json for errors!
      </p>
      <hr className="opacity-10 my-4" />

      <div className={`grid gap-4 grid-cols-1`}>
        {wallet && (
          <div className="card bg-primary">
            <div className="card-body p-4">
              <div className="flex flex-row gap-5 items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/solana-logo.jpeg"
                  className="rounded-full w-14 h-14"
                  width="56"
                  height="56"
                  alt=""
                />
                {wallet?.connected ? (
                  <div>
                    Address:
                    <CopyToClipboard
                      text={wallet?.publicKey?.toBase58()}
                      onCopy={clipboardNotification}
                    >
                      <span className={`cursor-pointer ml-1`}>
                        {wallet?.publicKey?.toBase58()}
                      </span>
                    </CopyToClipboard>
                    <p>
                      Balance:{" "}
                      {solBalance === "none" ? (
                        <span style={{ marginLeft: "1rem" }}>
                          <button className="btn btn-ghost loading btn-disabled"></button>
                        </span>
                      ) : (
                        solBalance / LAMPORTS_PER_SOL
                      )}
                    </p>
                  </div>
                ) : (
                  <>
                    <WalletMultiButton />
                    {!wallet?.connected && (
                      <h2 className="text-2xl">Please log into wallet!</h2>
                    )}
                  </>
                )}

                <div className="ml-auto">
                  <div className="btn-group">
                    {wallet?.connected && (
                      <a
                        className="btn btn-circle btn-sm"
                        rel="noreferrer"
                        target="_blank"
                        href={`https://solanabeach.io/address/${wallet?.publicKey}`}
                      >
                        <i className="fas fa-external-link-square-alt" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <hr className="my-4 opacity-10" />
      {wallet?.connected && <IdField sned={(e) => mint(e)} loading={loading} />}
    </>
  );
}
