import React, { useCallback, useEffect, useState } from "react";
import jsonFormat from "json-format";
import { download } from "../util/download";
import { CopyToClipboard } from "../components/copy-to-clipboard";
import {
  LAMPORTS_PER_SOL,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useAlert } from "../providers/alert-provider";
import IdField from "../components/id-field";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { MEMO_ID } from "../util/accounts";
import { toPublicKey } from "../util/to-publickey";
import { getBlockhashWithRetries } from "../util/get-blockhash-with-retries";
import { sliceIntoChunks } from "../util/slice-into-chunks";
import { parseAddresses } from "../util/parse-addresses";
import { useModal } from "../providers/modal-provider";
import { LinkIcon } from "../components/icons";

export default function Snedmaster() {
  const [loading, setLoading] = useState(false);
  const { connection } = useConnection();
  const { setAlertState } = useAlert();
  const { setModalState } = useModal();
  const [solBalance, setSolBalance] = useState<number | "none">("none");
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
  const wallet = useWallet();

  const mint = useCallback(
    async ({ amount, ids = "" }: { amount: string; ids: string }) => {
      try {
        const addresses = parseAddresses(ids);
        const amt = parseFloat(amount);

        if (isNaN(amt)) {
          alert("Invalid amount!");
          return;
        }

        if (
          !confirm(`This send a total of ${(amt * addresses.length).toFixed(
            4
          )} SOL to ${addresses.length} addresses. 
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

        const getTransferIxs = ({
          amount,
          destination,
        }: {
          amount: number;
          destination: string;
        }) => {
          const ixs = [
            SystemProgram.transfer({
              lamports: Math.round(amount * LAMPORTS_PER_SOL),
              toPubkey: toPublicKey(destination),
              fromPubkey: wallet?.publicKey,
            }),
            new TransactionInstruction({
              keys: [
                { pubkey: wallet?.publicKey, isSigner: true, isWritable: true },
              ],
              data: Buffer.from(
                `Sent over pentacle.tools at ${Date.now()}`,
                "utf-8"
              ),
              programId: MEMO_ID,
            }),
          ];

          return { ixs, destination, amount };
        };

        const reduced = (addresses as string[])
          .reduce((acc, curr) => {
            const found = acc.find((a) => a.destination === curr);
            if (found) {
              found.amount += amt;
            } else {
              acc.push({ amount: amt, destination: curr });
            }
            return acc;
          }, [])
          .map(getTransferIxs);
        const txs = [];
        const sigs = [];

        for (const slice of sliceIntoChunks(reduced, 5)) {
          const tx = new Transaction();
          const ixs = [...slice.map((s) => s.ixs).flat()];
          debugger;
          tx.add(...ixs);
          tx.feePayer = wallet?.publicKey;
          tx.recentBlockhash = (
            await getBlockhashWithRetries(connection)
          ).blockhash;
          txs.push(tx);
        }

        await wallet.signAllTransactions(txs);

        let counter = 1;

        for (const tx of txs) {
          try {
            const sig = await connection
              .sendRawTransaction(tx.serialize())
              .catch((e) => {
                console.log(e);
                return "failed";
              });

            setAlertState({
              message: (
                <>
                  Confirming {counter} of {txs.length} transactions.
                </>
              ),
              open: true,
            });
            await connection.confirmTransaction(sig, "confirmed");
            sigs.push({
              txId: sig,
              amount: tx.amount,
              destination: tx.destination,
            });
            counter++;
          } catch (e) {
            console.error(e);
          }
        }
        const filename = `Airdrop-${Date.now()}.json`;
        download(filename, jsonFormat(sigs));
        setModalState({
          message: `Succesfully downloaded ${filename}`,
          open: true,
        });
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
    [connection, isSnackbarOpen, wallet, setAlertState, setModalState]
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
      <div className="w-full max-w-full text-center mb-3">
        <h1 className="text-3xl text-white">Snedmaster 9000</h1>
        <hr className="opacity-10 my-4" />
      </div>
      <p className="px-2 text-center">
        This tool sends out a certain amount of Solana to different addresses.
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
                        rel="noopener noreferrer"
                        target="_blank"
                        href={`https://solanabeach.io/address/${wallet?.publicKey.toBase58()}`}
                      >
                        <LinkIcon width={16} height={16} />
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
