import React, { useContext, useEffect, useReducer } from "react";
import { useForm } from "react-hook-form";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import Head from "next/head";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import ShdwDrive from "@shadow-drive/sdk";
import { StorageAccount } from "@shadow-drive/sdk/dist/types";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddress } from "@solana/spl-token";

import { AlertContext } from "../../providers/alert-provider";
import { sizeMB } from "../../components/file-tile";
import { ModalContext } from "../../providers/modal-provider";
import { ImageURI } from "../../util/image-uri";
import { SHDW_TOKEN } from "../../util/accounts";
import { ExplorerLink } from "../../components/explorer-link";
const isValidUnit = (str: string) => {
  const num = parseFloat(str);
  if (isNaN(num)) {
    return false;
  }
  const unit = str.split(`${num}`)[1].toUpperCase();
  if (!["MB", "KB", "GB"].includes(unit)) {
    return false;
  }
  return true;
};
export default function ShdwDrivePage() {
  const initState: {
    balance: string;
    shdwBalance: string;
    createStorageLoading: boolean;
    shdwDrive: ShdwDrive;
    storageAccounts: { account: StorageAccount; publicKey: PublicKey }[];
    buttonsLoading: Record<string, boolean>;
    isCreatingStorageAccount: boolean;
    loading: boolean;
  } = {
    balance: "",
    shdwBalance: "",
    createStorageLoading: false,
    shdwDrive: null,
    storageAccounts: [],
    buttonsLoading: {},
    isCreatingStorageAccount: false,
    loading: true,
  };
  const [state, dispatch] = useReducer(
    (
      state: typeof initState,
      action:
        | { type: "loading"; payload?: { loading: boolean } }
        | { type: "balance"; payload?: { balance: string } }
        | { type: "shdwBalance"; payload?: { shdwBalance: string } }
        | {
            type: "createStorageLoading";
            payload?: { createStorageLoading: boolean };
          }
        | { type: "shdwDrive"; payload?: { shdwDrive: ShdwDrive } }
        | {
            type: "isCreatingStorageAccount";
            payload?: { isCreatingStorageAccount: boolean };
          }
        | {
            type: "storageAccounts";
            payload?: {
              storageAccounts: {
                account: StorageAccount;
                publicKey: PublicKey;
              }[];
            };
          }
        | {
            type: "buttonsLoading";
            payload?: { buttonsLoading: Record<string, boolean> };
          }
    ) => {
      switch (action.type) {
        case "loading":
          return { ...state, loading: action.payload.loading };
        case "balance":
          return { ...state, balance: action.payload.balance };
        case "storageAccounts":
          return { ...state, storageAccounts: action.payload.storageAccounts };
        case "shdwBalance":
          return { ...state, shdwBalance: action.payload.shdwBalance };
        case "shdwDrive":
          return { ...state, shdwDrive: action.payload.shdwDrive };
        case "isCreatingStorageAccount":
          return {
            ...state,
            isCreatingStorageAccount: action.payload.isCreatingStorageAccount,
          };
        case "createStorageLoading":
          return {
            ...state,
            createStorageLoading: action.payload.createStorageLoading,
          };
        case "buttonsLoading":
          return { ...state, buttonsLoading: action.payload.buttonsLoading };

        default: {
          throw new Error(
            "unsupported action type given on SHDW Drive reducer"
          );
        }
      }
    },
    initState
  );
  const { setModalState } = useContext(ModalContext);
  const { register, handleSubmit, getValues, reset } = useForm();
  const { setAlertState } = useContext(AlertContext);
  const { connection } = useConnection();
  const wallet = useWallet();

  useEffect(() => {
    (async () => {
      if (wallet?.publicKey) {
        const shdwDrive = await new ShdwDrive(connection, wallet).init();
        dispatch({
          type: "shdwDrive",
          payload: { shdwDrive },
        });
        const storageAccounts = await shdwDrive.getStorageAccounts();
        dispatch({
          type: "storageAccounts",
          payload: {
            storageAccounts: storageAccounts as any as {
              account: StorageAccount;
              publicKey: PublicKey;
            }[],
          },
        });

        const shdwBalance = await connection.getTokenAccountBalance(
          await getAssociatedTokenAddress(SHDW_TOKEN, wallet.publicKey)
        );
        const solBalance = await connection.getBalance(wallet.publicKey);
        dispatch({
          type: "shdwBalance",
          payload: {
            shdwBalance: shdwBalance.value.amount,
          },
        });
        dispatch({
          type: "balance",
          payload: { balance: (solBalance / LAMPORTS_PER_SOL).toFixed(2) },
        });
        dispatch({ type: "loading", payload: { loading: false } });
      }
    })();
  }, [wallet?.publicKey]);

  const onSubmit = handleSubmit(
    async ({ storageAccountName, storageAccountSize }) => {
      if (!storageAccountName || !isValidUnit(storageAccountSize)) {
        return;
      }
      dispatch({
        type: "createStorageLoading",
        payload: { createStorageLoading: true },
      });
      setAlertState({
        open: true,
        message: (
          <div className="p-3">
            <button className="btn btn-ghost loading"></button>
            Storage Account &quot;{storageAccountName}&quot; is being created...
          </div>
        ),
      });
      try {
        const response = await state.shdwDrive.createStorageAccount(
          storageAccountName,
          storageAccountSize
        );
        setAlertState({
          open: false,
          message: <></>,
        });
        setModalState({
          message: (
            <div>
              <h3>Storage Account created!</h3>
              <p>
                <ExplorerLink txId={response.transaction_signature} />
              </p>
            </div>
          ),
          open: true,
        });

        reset();
        dispatch({
          type: "isCreatingStorageAccount",
          payload: { isCreatingStorageAccount: false },
        });
        setTimeout(async () => {
          const storageAccounts = await state.shdwDrive.getStorageAccounts();
          dispatch({
            type: "storageAccounts",
            payload: {
              storageAccounts: storageAccounts as any as {
                account: StorageAccount;
                publicKey: PublicKey;
              }[],
            },
          });
        }, 2000);
      } catch (e) {
        setAlertState({
          open: false,
          message: <></>,
        });
        setModalState({
          message: (
            <div>
              <h3>An error occured. Check Console for more info...!</h3>
            </div>
          ),
          open: true,
        });
      }
    }
  );
  const handleDeleteStorageAccount = async ({ publicKey, pubKeyString, i }) => {
    dispatch({
      type: "buttonsLoading",
      payload: {
        buttonsLoading: {
          ...state.buttonsLoading,
          [pubKeyString]: true,
        },
      },
    });
    try {
      const response = await state.shdwDrive.deleteStorageAccount(publicKey);
      setModalState({
        message: (
          <div>
            <h3>Storage Account will be deleted</h3>
            <p>
              <ExplorerLink txId={response.txid} />
            </p>
          </div>
        ),
        open: true,
      });
      const updatedArr = [...state.storageAccounts];
      updatedArr[i].account.deleteRequestEpoch =
        (await connection.getEpochInfo()).epoch + 1;

      dispatch({
        type: "storageAccounts",
        payload: {
          storageAccounts: updatedArr,
        },
      });
    } catch (e) {
      console.log(e);
    }
    dispatch({
      type: "buttonsLoading",
      payload: {
        buttonsLoading: {
          ...state.buttonsLoading,
          [pubKeyString]: false,
        },
      },
    });
  };

  const handleCancelDeleteStorageAccountRequest = async ({
    publicKey,
    pubKeyString,
    i,
  }) => {
    dispatch({
      type: "buttonsLoading",
      payload: {
        buttonsLoading: {
          ...state.buttonsLoading,
          [pubKeyString]: true,
        },
      },
    });
    try {
      const response = await state.shdwDrive.cancelDeleteStorageAccount(
        publicKey
      );
      setModalState({
        message: (
          <div>
            <h3>Storage Account delete request will be cancelled</h3>
            <p>
              <ExplorerLink txId={response.txid} />
            </p>
          </div>
        ),
        open: true,
      });

      const updatedArr = [...state.storageAccounts];
      updatedArr[i].account.deleteRequestEpoch = 0;

      dispatch({
        type: "storageAccounts",
        payload: {
          storageAccounts: updatedArr,
        },
      });
    } catch (e) {
      setModalState({
        message: "An error occured. Check Console for more info...",
        open: true,
      });
      console.log(e);
    }

    dispatch({
      type: "buttonsLoading",
      payload: {
        buttonsLoading: {
          ...state.buttonsLoading,
          [pubKeyString]: false,
        },
      },
    });
  };
  return (
    <>
      <Head>
        <title>🛠️ Pentacle Tools - SHDW Drive</title>
      </Head>
      <div className="max-w-full text-center mb-3">
        <h1 className="text-4xl text-white">
          <img
            src={ImageURI.GenesysGo}
            alt=""
            className="mr-2"
            style={{
              width: 48,
              height: 48,
              display: "inline",
            }}
          />
          SHDW Drive
          <img
            src={ImageURI.GenesysGo}
            alt=""
            className="ml-2"
            style={{
              width: 48,
              height: 48,
              display: "inline",
            }}
          />
        </h1>
        <span>In no affiliation with GenesysGo</span> <br />
        {!!state.shdwBalance && (
          <span className="badge badge-primary mt-3">
            Balance: {state.shdwBalance} SHDW \ {state.balance} SOL
          </span>
        )}
        <hr className="opacity-10 my-4" />
      </div>
      <div>
        {wallet.connected && !!state.loading && (
          <div className="w-full text-center">
            {" "}
            <button className="btn btn-ghost loading mx-auto"></button>
          </div>
        )}
        {!wallet.connected && (
          <div className="w-full flex justify-center items-center">
            <WalletMultiButton />
          </div>
        )}

        {wallet.connected && (
          <>
            <div className="card bg-gray-900 max-w-full p-6">
              {!state.storageAccounts.length && (
                <div>
                  No storage accounts yet. 
                </div>
              )}

              <ul>
                <li>
                  <div className="flex mb-4">
                    {state.isCreatingStorageAccount && (
                      <form
                        className="grid grid-cols-2 mb-4 gap-4"
                        onSubmit={onSubmit}
                      >
                        <input
                          type="text"
                          {...register("storageAccountName")}
                          className="input w-60"
                          placeholder="Name"
                        />
                        <input
                          type="text"
                          {...register("storageAccountSize")}
                          className="input w-60"
                          placeholder="Size (in kb, mb or gb, e.g. 10mb)"
                        />
                      </form>
                    )}
                    <div></div>

                    <div className="flex flex-1 gap-3 justify-end">
                      {state.isCreatingStorageAccount && (
                        <input
                          className="btn btn-success w-24 btn-outline"
                          type="submit"
                          value={"Add"}
                          disabled={state.createStorageLoading}
                          onClick={() => {
                            onSubmit(getValues() as any);
                          }}
                        />
                      )}
                      <button
                        className={`btn btn-primary ${
                          state.isCreatingStorageAccount ? "w-24" : ""
                        }`}
                        onClick={async () => {
                          dispatch({
                            type: "isCreatingStorageAccount",
                            payload: {
                              isCreatingStorageAccount:
                                !state.isCreatingStorageAccount,
                            },
                          });
                        }}
                        disabled={state.createStorageLoading}
                      >
                        {state.isCreatingStorageAccount
                          ? "Cancel"
                          : "Add new Storage Account"}
                      </button>
                    </div>
                  </div>
                </li>
                {state.storageAccounts
                  .sort((a, b) =>
                    a.account.identifier.localeCompare(b.account.identifier)
                  )
                  .map(
                    (
                      {
                        account,
                        publicKey,
                      }: {
                        account: StorageAccount;
                        publicKey: PublicKey;
                      },
                      i
                    ) => {
                      const pubKeyString = publicKey.toBase58();

                      return (
                        <li key={pubKeyString}>
                          <div className="flex flex-row justify-between items-center">
                            <div className="flex flex-row gap-6">
                              <div>
                                <span
                                  className={`${
                                    !!account.deleteRequestEpoch &&
                                    "text-red-500"
                                  }`}
                                >
                                  {" "}
                                  <strong>{account.identifier}</strong>
                                </span>
                                {!!account.deleteRequestEpoch && (
                                  <span className="text-red-500">
                                    {" "}
                                    - Will be deleted in epoch{" "}
                                    {account.deleteRequestEpoch}!
                                  </span>
                                )}
                                <br />
                                <a
                                  href={`https://solscan.io/account/${pubKeyString}`}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  {pubKeyString}
                                </a>
                                <br />
                                <div>
                                  <a
                                    target="_blank"
                                    href={`/shadow-drive/files?storageAccount=${pubKeyString}`}
                                    rel="noopener noreferrer"
                                  >
                                    <button className="btn btn-sm btn-primary my-2">
                                      See files
                                    </button>
                                  </a>
                                </div>
                                <div className="badge badge-ghost">
                                  Free:{" "}
                                  {sizeMB(
                                    +(account.storageAvailable as any)
                                      ?.toNumber()
                                      ?.toFixed(2)
                                  ).toFixed(2)}{" "}
                                  MB /
                                  {sizeMB(
                                    +(account.storage as any)
                                      ?.toNumber()
                                      ?.toFixed(2)
                                  ).toFixed(2)}{" "}
                                  MB
                                </div>
                              </div>
                            </div>
                            {!!account.deleteRequestEpoch && (
                              <button
                                className={`btn btn-error btn-sm w-32 btn-outline ${
                                  state.buttonsLoading[pubKeyString] &&
                                  " loading"
                                }`}
                                onClick={() =>
                                  handleCancelDeleteStorageAccountRequest({
                                    pubKeyString,
                                    publicKey,
                                    i,
                                  })
                                }
                              >
                                undelet
                              </button>
                            )}

                            {/* <div className="flex gap-3">
                              <label
                                className={`btn btn-primary btn-sm w-32`}
                                htmlFor="file"
                              >
                                {isUploadingFile ? "" : "Upload file"}
                              </label>
                              <input
                                disabled={isUploadingFile}
                                type="file"
                                id="file"
                                name="file"
                                className="hidden"
                                onChange={async (e) => {
                                  console.log(e);
                                  if (e.target.files[0]) {
                                    const fd = new NodeFormData();
                                    const buff = await file2Buffer(
                                      e.target.files[0]
                                    );
                                    Object.assign(fd, {
                                      getBuffer: () => ({ buffer: buff }),
                                    });
                                    fd.append("file", e.target.files[0]);
                                    const response = await drive.uploadFile(
                                      publicKey,
                                      fd
                                    );
                                    debugger;
                                  }
                                }}
                              ></input>

                            </div> */}
                            {!account.deleteRequestEpoch && (
                              <button
                                className={`btn btn-error btn-sm w-32 ${
                                  !!state.buttonsLoading[pubKeyString]
                                    ? "loading"
                                    : ""
                                } `}
                                onClick={() =>
                                  handleDeleteStorageAccount({
                                    pubKeyString,
                                    publicKey,
                                    i,
                                  })
                                }
                              >
                                {!!state.buttonsLoading[pubKeyString]
                                  ? ""
                                  : "delet"}
                              </button>
                            )}
                          </div>
                          <progress
                            className="progress progress-primary"
                            value={account.storageAvailable / account.storage}
                          ></progress>

                          <hr className="opacity-10 my-3" />
                        </li>
                      );
                    }
                  )}
              </ul>
            </div>
            {/* <div className="card bg-gray-900 max-w-full">
              <div className="card-body">
                <div className="mt-4">
                  <FileUpload />
                </div>

                {!!files.length && (
                  <div className="text-center mt-6">
                    <button
                      className={`btn btn-primary rounded-box shadow-lg ${
                        loading ? "loading" : ""
                      }`}
                      disabled={!files.length}
                      onClick={onSubmit}
                    >
                      {loading ? "Uploading..." : "Upload"}
                    </button>
                    <br />
                  </div>
                )}
              </div>
            </div> */}
          </>
        )}
      </div>
    </>
  );
}
