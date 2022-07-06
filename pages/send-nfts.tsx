import React, { useReducer, useCallback, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/router";
import { ParsedAccountData, PublicKey, Transaction } from "@solana/web3.js";
import {
  createAssociatedTokenAccountInstruction,
  createCloseAccountInstruction,
  createTransferInstruction,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { useForm } from "react-hook-form";

import { useModal } from "../contexts/ModalProvider";
import Head from "next/head";
import { fetchMetaForUI } from "../util/token-metadata";

import { toPublicKey } from "../util/to-publickey";
import { SOL_ADDRESS_REGEXP } from "../util/validators";
import { sliceIntoChunks } from "../util/slice-into-chunks";
import { NFTPreview } from "../components/nft-preview";
import { getBlockhashWithRetries } from "../util/get-blockhash-with-retries";
import { LeftIcon, RightIcon } from "../components/icons";
import { shortenAddress } from "../util/shorten-address";
import { toast } from "react-toastify";
const initState: {
  nfts: any[];
  status: string;
  publicAddress: null | string;
  itemsPerPage: 12 | 24 | 120;
  isModalOpen: boolean;
  isSending: boolean;
  selectedNFTs: PublicKey[];
} = {
  nfts: [],
  publicAddress: null,
  status: "idle",
  itemsPerPage: 12,
  isModalOpen: false,
  isSending: false,
  selectedNFTs: [],
};

type SendNftAction =
  | { type: "started"; payload?: null }
  | { type: "error"; payload?: null }
  | { type: "unselectAll"; payload?: null }
  | { type: "sending"; payload?: null }
  | { type: "sent"; payload?: null }
  | { type: "success"; payload: { nfts: any[] } }
  | { type: "nfts"; payload: { nfts: any[] } }
  | { type: "isModalOpen"; payload: { isModalOpen: boolean } }
  | { type: "publicAddress"; payload: { publicAddress: string } }
  | { type: "itemsPerPage"; payload: { itemsPerPage: number } }
  | { type: "selectedNFTs"; payload: { selectedNFTs: PublicKey[] } };

const reducer = (state: typeof initState, action: SendNftAction) => {
  switch (action.type) {
    case "started":
      return { ...state, status: "pending" };
    case "nfts":
      return { ...state, nfts: action.payload.nfts };
    case "sending":
      return { ...state, isSending: true };
    case "sent":
      return { ...state, isSending: false };
    case "error":
      return { ...state, status: "rejected" };
    case "itemsPerPage":
      return { ...state, itemsPerPage: action.payload.itemsPerPage };
    case "isModalOpen":
      return { ...state, isModalOpen: action.payload.isModalOpen };
    case "publicAddress":
      return { ...state, publicAddress: action.payload.publicAddress };
    case "success":
      return { ...state, status: "resolved", nfts: action.payload.nfts };
    case "unselectAll":
      return { ...state, selectedNFTs: [] };
    case "selectedNFTs":
      return {
        ...state,
        selectedNFTs: action.payload.selectedNFTs,
      };
    default:
      throw new Error("unsupported action type given on SendNFTs reducer");
  }
};

export default function SendNFTs() {
  const { setModalState } = useModal();
  const { connection } = useConnection();
  const { publicKey, signAllTransactions } = useWallet();
  const router = useRouter();

  const {
    getValues,
    register,
    formState: { errors },
    handleSubmit,
  } = useForm({ mode: "onBlur" });
  const [state, dispatch] = useReducer(reducer, initState);

  const handleNFTs = useCallback(async () => {
    if (!publicKey) {
      return;
    }

    const pubkeyString = publicKey.toBase58();

    try {
      dispatch({ type: "started" });
      dispatch({
        type: "publicAddress",
        payload: { publicAddress: pubkeyString },
      });
      const accounts = await connection.getParsedProgramAccounts(
        TOKEN_PROGRAM_ID,
        {
          filters: [
            {
              dataSize: 165, // number of bytes
            },
            {
              memcmp: {
                offset: 32, // number of bytes
                bytes: pubkeyString, // base58 encoded string
              },
            },
          ],
        }
      );
      const mints = accounts
        .filter(
          (a) =>
            (a.account.data as ParsedAccountData).parsed.info.tokenAmount
              .uiAmount
        )
        .map((a) => (a.account.data as ParsedAccountData).parsed.info.mint);
      const data = (
        await fetchMetaForUI(mints, () => {}, connection).toPromise()
      ).filter((e) => !e.failed);

      const nftsWithImages = data.map((nft) => {
        if (nft) {
          if (nft.metadata?.image) {
            return { ...nft, image: nft.metadata?.image };
          } else if (nft.metadata?.properties?.category === "video") {
            return {
              ...nft,
              image: null,
              // @TODO fix this naive implementation
              video: {
                ...(nft?.metadata?.properties?.files[1] ||
                  nft?.metadata?.properties?.files[0]),
              },
            };
          } else return { ...nft, image: null, video: null };
        } else return { ...nft, image: null, video: null };
      });
      dispatch({ type: "success", payload: { nfts: nftsWithImages } });
    } catch (err) {
      console.log(err);
      dispatch({ type: "error" });
    }
  }, [publicKey, dispatch]);

  const itemsPerPage = useMemo(() => state.itemsPerPage, [state]);

  const page = useMemo(() => {
    return Number(router.query.page) || 1;
  }, [router.query]);

  const nftsToRender = useMemo(() => {
    if (!state.nfts) {
      return [];
    }

    const nftsCopy = [...state.nfts];
    const chunkedNFTs = [];
    const firstChunk = nftsCopy.splice(0, itemsPerPage);
    chunkedNFTs.push(firstChunk);
    while (nftsCopy.length) {
      const chunk = nftsCopy.splice(0, itemsPerPage);
      chunkedNFTs.push(chunk);
    }
    return chunkedNFTs[page - 1];
  }, [state, page, itemsPerPage]);

  const handleNextPage = useCallback(() => {
    router.replace({
      pathname: router.pathname,
      query: { ...router.query, page: page + 1 },
    });
  }, [page, router]);

  const handlePrevPage = useCallback(() => {
    if (page - 1 === 1) {
      const newQuery = { ...router.query };
      delete newQuery.page;
      router.replace({ pathname: router.pathname, query: { ...newQuery } });
      return;
    }

    router.replace({
      pathname: router.pathname,
      query: { ...router.query, page: page - 1 },
    });
  }, [page, router]);

  const handleItemsPerPageSelection = useCallback(
    (itemsPerPage: number) => {
      dispatch({ type: "itemsPerPage", payload: { itemsPerPage } });
    },
    [dispatch]
  );

  const handleNFTSelect = useCallback(
    (selectedNFT: string) => {
      const newPubkey = toPublicKey(selectedNFT);
      const idx = state.selectedNFTs.findIndex((nft) => nft.equals(newPubkey));
      if (idx >= 0) {
        const newItems = state.selectedNFTs.filter(
          (nft) => !nft.equals(newPubkey)
        );
        dispatch({ type: "selectedNFTs", payload: { selectedNFTs: newItems } });
      } else {
        const newItems = [...state.selectedNFTs, newPubkey];
        dispatch({ type: "selectedNFTs", payload: { selectedNFTs: newItems } });
      }
    },
    [state.selectedNFTs]
  );

  const handleNFTUnselect = useCallback(
    (mint: PublicKey) => {
      const newItems = state.selectedNFTs.filter((nft) => !nft.equals(mint));
      dispatch({ type: "selectedNFTs", payload: { selectedNFTs: newItems } });
    },
    [state.selectedNFTs]
  );

  const removeNFT = useCallback(
    (nft: PublicKey) => {
      dispatch({
        type: "nfts",
        payload: {
          nfts: state.nfts.filter((i) => !toPublicKey(i.mint).equals(nft)),
        },
      });
    },
    [state.nfts]
  );

  const createAssociatedTokenAccountsForMints = useCallback(
    async (mints: PublicKey[], destination: string) => {
      const resolvedTokenaccountsWithoutBalances = (
        await Promise.all(
          mints.map(async (mint) => ({
            mint,
            ata: await getAssociatedTokenAddress(
              mint,
              toPublicKey(destination),
              false
            ),
            balance: await connection.getBalance(
              await getAssociatedTokenAddress(
                mint,
                toPublicKey(destination),
                false
              )
            ),
          }))
        )
      ).filter((mint) => !mint.balance);
      const txs = [];
      for (const slice of sliceIntoChunks(
        resolvedTokenaccountsWithoutBalances,
        5
      )) {
        const tx = new Transaction().add(
          ...slice.map((acc) =>
            createAssociatedTokenAccountInstruction(
              publicKey,
              acc.ata,
              toPublicKey(destination),
              acc.mint
            )
          )
        );
        tx.recentBlockhash = (
          await getBlockhashWithRetries(connection)
        ).blockhash;
        tx.feePayer = publicKey;
        txs.push(tx);
      }
      if (txs.length) {
        await signAllTransactions(txs);
      }

      for (const tx of txs) {
        const id = await connection.sendRawTransaction(tx.serialize());
        await connection.confirmTransaction(id);
      }
    },
    [signAllTransactions, connection, publicKey]
  );

  const handleMultiSned = useCallback(async () => {
    if (!publicKey || !state.selectedNFTs) {
      return;
    }

    dispatch({ type: "sending" });

    const { destination } = getValues();

    const id = toast("Creating token accounts..", {
      isLoading: true,
    });

    await createAssociatedTokenAccountsForMints(
      state.selectedNFTs,
      destination
    );

    try {
      const txs = [];
      for (const slice of sliceIntoChunks(state.selectedNFTs, 3)) {
        txs.push(
          ...(await Promise.all(
            slice.map(async (mint) => {
              const sourceATA = await getAssociatedTokenAddress(
                mint,
                publicKey,
                false
              );

              const destATA = await getAssociatedTokenAddress(
                mint,
                toPublicKey(destination),
                false
              );

              const tokenAccBalance = +(
                await connection.getTokenAccountBalance(sourceATA)
              ).value.amount;

              const instruction = createTransferInstruction(
                sourceATA,
                destATA,
                publicKey,
                tokenAccBalance,
                []
              );

              const closeIx = createCloseAccountInstruction(
                sourceATA,
                publicKey,
                publicKey,
                []
              );

              const transaction = new Transaction().add(instruction, closeIx);
              transaction.recentBlockhash = (
                await getBlockhashWithRetries(connection)
              ).blockhash;
              transaction.feePayer = publicKey;
              return transaction;
            })
          ))
        );
      }

      await signAllTransactions(txs);
      toast.done(id);
      const loadingId = toast(`Sending ${txs.length} transactions...`, {
        isLoading: true,
      });
      const sliced = sliceIntoChunks(
        txs.map(async (tx, i) => {
          const id = await connection.sendRawTransaction(tx.serialize());
          await connection.confirmTransaction(id, "finalized").catch(() => {
            setModalState({
              message: `Transaction ${id} could not be confirmed in time, please check explorer.`,
              open: true,
            });
          });
          return id;
        }),
        3
      );

      toast.done(loadingId);
      await handleNFTs();
      dispatch({ type: "sent" });
      setModalState({
        open: true,
        message: "sent all NFTs!",
      });
    } catch (err) {
      console.error(err);
      toast.dismiss();
      setModalState({
        message: err.message,
        open: true,
      });
      dispatch({ type: "sent" });
    }
  }, [
    publicKey,
    state,
    removeNFT,
    handleNFTUnselect,
    connection,
    setModalState,
    signAllTransactions
  ]);

  const confirmationModal = useMemo(() => {
    return state.isModalOpen && document.body
      ? createPortal(
          <div className="flex fixed inset-0 justify-center items-center p-4 bg-black bg-opacity-75">
            <div className="p-4 w-full max-w-sm bg-gray-800 rounded-lg shadow-lg">
              <p className="text-2xl text-center text-white">
                Are you sure you want send thse NFTs to{" "}
                {shortenAddress(getValues().destination)}
                {`${
                  state.selectedNFTs.length === 1
                    ? "this NFT"
                    : ` these ${state.selectedNFTs.length} NFTs?`
                }`}
                ?
                <br />
                <br />
                <strong>
                  It cannot be undone and they will be destroyed!!! Make sure
                  you know what you are doing!
                </strong>
              </p>

              <div className="flex justify-center items-center p-4 mt-8 w-full">
                <button
                  type="button"
                  className="mr-4 btn rounded-box"
                  onClick={() => {
                    dispatch({
                      type: "isModalOpen",
                      payload: { isModalOpen: false },
                    });
                  }}
                >
                  nope
                </button>
                <button
                  type="button"
                  onClick={() => {
                    dispatch({
                      type: "isModalOpen",
                      payload: { isModalOpen: false },
                    });
                    handleMultiSned();
                  }}
                  className={`btn rounded-box btn-primary ${
                    state.isSending ? "loading" : ""
                  }`}
                >
                  {state.isSending ? "sending!!" : "yup"}
                </button>
              </div>
            </div>
          </div>,
          document.querySelector("body")
        )
      : null;
  }, [state, handleNFTUnselect, handleMultiSned]);

  const itemsPerPageSelectionDisplay = useMemo(() => {
    const options = [12, 24, 120];

    return (
      <div className="flex justify-center items-center mt-8 w-full">
        <p className="mr-2">Items per page:</p>
        <div className="flex">
          {options.map((opt, index) => (
            <div key={opt}>
              <button
                type="button"
                onClick={() => handleItemsPerPageSelection(opt)}
                disabled={opt === itemsPerPage}
                className={opt === itemsPerPage ? "" : "underline"}
              >
                {opt}
              </button>
              {index < options.length - 1 ? (
                <span className="mx-2">|</span>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    );
  }, [itemsPerPage, handleItemsPerPageSelection]);

  const paginationDisplay = useMemo(() => {
    return state.nfts.length > itemsPerPage ? (
      <div className="flex justify-between items-center m-auto mt-8 w-full max-w-md">
        <button
          type="button"
          className="shadow btn rounded-box"
          onClick={handlePrevPage}
          disabled={page < 2}
        >
          <i>
            <LeftIcon />
          </i>
        </button>
        <div className="text-xl text-center text-white">
          {page} / {/* trying maffs */}
          {state.nfts?.length % itemsPerPage === 0
            ? state.nfts?.length / itemsPerPage
            : Math.floor(state.nfts?.length / itemsPerPage) + 1}
        </div>
        <button
          type="button"
          className="shadow btn rounded-box"
          onClick={handleNextPage}
          disabled={
            page >=
            (state.nfts?.length % itemsPerPage === 0
              ? state.nfts?.length / itemsPerPage
              : Math.floor(state.nfts?.length / itemsPerPage) + 1)
          }
        >
          <i>
            <RightIcon />
          </i>
        </button>
      </div>
    ) : null;
  }, [state.nfts, itemsPerPage, page, handlePrevPage, handleNextPage]);

  useEffect(() => {
    if (publicKey && state.status === "idle") {
      handleNFTs();
    }
  }, [publicKey, state, handleNFTs]);

  const nftDisplay = useMemo(() => {
    if (["idle", "pending"].includes(state.status)) {
      return (
        <p className="text-lg text-center text-white">
          <button className="btn btn-ghost loading"></button>
          fetching NFTs...
        </p>
      );
    }

    return state.status === "rejected" ? (
      <p className="text-lg text-center text-white">
        There was an error fetching your NFTS :(
      </p>
    ) : (
      <>
        <div>
          {state.nfts.length === 0 ? (
            <p className="text-lg text-center text-white">
              You have no NFTs :(
            </p>
          ) : (
            <div className="flex flex-wrap items-center">
              {nftsToRender?.map((nft) => (
                <div
                  className="p-2 w-1/2 sm:w-1/3 md:w-1/4"
                  id={nft.mint}
                  key={nft.mint}
                >
                  <NFTPreview
                    nft={nft}
                    selectable
                    handleNFTSelect={handleNFTSelect}
                    selected={
                      !!state.selectedNFTs.find((n) =>
                        n.equals(toPublicKey(nft.mint))
                      )
                    }
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <form
          className="flex flex-col justify-center items-center"
          onSubmit={handleSubmit((e) => {
            dispatch({
              type: "isModalOpen",
              payload: { isModalOpen: true },
            });
          })}
        >
          <div className="mb-3 w-64">
            <label className="label" htmlFor="destination">
              Destination address
            </label>

            <input
              type="text"
              className="w-full input"
              id="destination"
              required
              {...register("destination", {
                required: "Please enter Solana Address!",
                pattern: {
                  value: SOL_ADDRESS_REGEXP,
                  message: "Invalid Address!",
                },
              })}
            />
            {errors?.required && (
              <span className="mt-2 text-error">
                {errors?.required?.message}
              </span>
            )}
            {errors?.destination?.message && (
              <span className="mt-2 text-error">
                {errors?.destination?.message}
              </span>
            )}
          </div>
          <div>
            <input
              type="submit"
              value={
                state.selectedNFTs.length
                  ? `sned ${state.selectedNFTs.length} ${
                      state.selectedNFTs.length === 1 ? "item" : "items"
                    }`
                  : "selecc to sned"
              }
              className="mt-2 rounded-full shadow btn btn-primary"
              disabled={!state.selectedNFTs.length || errors.destination}
            />
          </div>
        </form>
        {paginationDisplay}
        {itemsPerPageSelectionDisplay}
      </>
    );
  }, [
    state,
    itemsPerPageSelectionDisplay,
    paginationDisplay,
    nftsToRender,
    errors.destination,
    errors.required,
    handleNFTSelect,
  ]);

  return (
    <>
      <Head>
        <title>🛠️ Pentacle Tools - Send NFTs</title>
      </Head>
      <div className="mb-3 w-full max-w-full text-center">
        <h1 className="text-3xl text-white">Send NFTs</h1>
        <hr className="my-4 opacity-10" />
      </div>
      <p className="px-2 text-center">
        This tool facilitates bulk sending of NFTs
      </p>
      <div className="flex flex-col justify-center items-center my-4 text-sm">
        {publicKey ? (
          <>
            <p className="text-center text-white break-all">
              <span>Connected Address:</span>
              <br />
              {state.publicAddress}
            </p>
          </>
        ) : (
          <WalletMultiButton
            style={{
              fontSize: "0.75rem",
              height: "2rem",
            }}
          />
        )}
      </div>
      <hr className="my-4 opacity-10" />
      {publicKey ? (
        <div className="p-4 bg-gray-900 shadow card">{nftDisplay}</div>
      ) : null}
      {confirmationModal}
    </>
  );
}
