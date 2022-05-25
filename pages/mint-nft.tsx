// DISCLAIMER:
// THIS FILE IS ABSOLUTE CHAOS AND I KNOW IT!

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { AttributesForm } from "../components/attributes-form";
import jsonFormat from "json-format";
import { Controller, useForm } from "react-hook-form";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import FileTile from "../components/file-tile";
import { URL_MATCHER } from "../util/validators";
import { useAlert } from "../contexts/AlertProvider";
import { getRange } from "../util/get-range";
import { fileToBuffer } from "../util/file-to-buffer";
import { ShdwDrive } from "@shadow-drive/sdk";
import { toPublicKey } from "../util/to-publickey";
import createFileList from "../util/create-file-list";
import { useModal } from "../contexts/ModalProvider";
import { Creator } from "../util/metadata-schema";
import { Metaplex, walletAdapterIdentity } from "@metaplex-foundation/js-next";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import { SHDW_TOKEN } from "../util/accounts";

export default function GibAirdrop() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm();
  const { setModalState } = useModal();
  const { setAlertState } = useAlert();
  const [loading, setLoading] = useState(false);
  const wallet = useWallet();
  const [numberOfFiles, setNumberOfFiles] = useState(1);
  const [files, setFiles] = useState<File[]>([]);
  const [mint, setMint] = useState("");
  const { connection } = useConnection();
  const handleRemoveFile = useCallback(
    (name: string) => {
      setFiles(files.filter((f) => f.name !== name));
    },
    [files]
  );

  const FilesForm = useMemo(
    () => (
      <>
        <label className="label" htmlFor="files">
          <span className="label-text">Files (up to 4)*</span>
        </label>
        <div className="btn-group">
          {numberOfFiles < 4 && (
            <button
              className="btn btn-primary"
              onClick={(e) => {
                e.preventDefault();
                setNumberOfFiles(numberOfFiles + 1);
              }}
            >
              Add file
            </button>
          )}
          {numberOfFiles > 1 && (
            <button
              className="btn btn-error"
              onClick={(e) => {
                e.preventDefault();
                setNumberOfFiles(numberOfFiles - 1);
                setFiles(files.slice(0, numberOfFiles - 1));
              }}
            >
              Remove file
            </button>
          )}
        </div>
        <div className="upload-field grid grid-cols-2 gap-4 my-4">
          {getRange(numberOfFiles).map((i) => (
            <FileTile
              key={i}
              file={files[i]}
              remove={handleRemoveFile}
              setFiles={setFiles}
              files={files}
            />
          ))}
        </div>

        {!!files?.length && (
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="label" htmlFor="imageUrlFileName">
                Image URL
              </label>
              <select
                {...register("imageUrlFileName")}
                className="select w-full"
              >
                <option selected disabled value=""></option>
                {files.map((f, i) => (
                  <option key={i} value={f.name}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="animationUrlFileName">
                Animation URL
              </label>
              <select
                {...register("animationUrlFileName")}
                className="select w-full"
              >
                <option selected disabled value=""></option>
                {files.map((f, i) => (
                  <option key={i} value={f.name}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
        <br />
      </>
    ),
    [files, numberOfFiles, setNumberOfFiles, handleRemoveFile, register]
  );

  const pubKeyString = useMemo(
    () => wallet?.publicKey?.toBase58(),
    [wallet?.publicKey]
  );

  const upload = useCallback(
    async (formData) => {
      setLoading(true);
      setAlertState!({
        message: (
          <button className="loading btn btn-ghost">Starting Upload</button>
        ),
        open: true,
      });

      const shdwDrive = await new ShdwDrive(connection, wallet).init();

      const m = Object.assign({
        name: formData.name,
        symbol: formData.symbol || null,
        description: formData.description || null,
        seller_fee_basis_points: +formData.seller_fee_basis_points || 0,
        image: formData.image || null,
        animation_url: formData.animation_url || null,
        attributes: formData.attributes || [],
        external_url: formData.external_url || null,
        properties: {
          category: formData?.properties?.category || "image",
          creators: [
            new Creator({
              address: wallet?.publicKey,
              share: 100,
              verified: true,
            }),
          ],
        },
      });

      try {
        // TODO: Upload all files at once, use determinstic file name
        const bytes = await files.reduce(async (acc, curr) => {
          return (await acc) + (await fileToBuffer(curr)).buffer.byteLength;
        }, Promise.resolve(0));

        alert(
          `You will need circa ${((bytes * 1.2) / LAMPORTS_PER_SOL).toFixed(
            6
          )} SHDW`
        );
        const { shdw_bucket } = await shdwDrive.createStorageAccount(
          `NFT-${Date.now()}`,
          `${Math.round((bytes * 1.2) / 1000)}kb`
        );

        const vidFile = files.find((_m) => _m.type.startsWith("video"));
        const imgFile = files.find((_m) => _m.type.startsWith("image"));

        m.animation_url = formData.animationUrlFileName
          ? `https://shdw-drive.genesysgo.net/${shdw_bucket}/${formData.animationUrlFileName}`
          : !!vidFile?.name
          ? `https://shdw-drive.genesysgo.net/${shdw_bucket}/${vidFile?.name}`
          : null;
        m.image = formData.imageUrlFileName
          ? `https://shdw-drive.genesysgo.net/${shdw_bucket}/${formData.imageUrlFileName}`
          : !!imgFile?.name
          ? `https://shdw-drive.genesysgo.net/${shdw_bucket}/${imgFile.name}`
          : null;

        m.properties.files = files.map((f) => {
          return {
            type: f.type,
            uri: `https://shdw-drive.genesysgo.net/${shdw_bucket}/${f.name}`,
          };
        });
        setAlertState!({
          message: (
            <button className="loading btn btn-ghost">
              Uploading {files.length + 1} files
            </button>
          ),
          open: true,
        });

        const res = (
          await shdwDrive.uploadMultipleFiles(
            toPublicKey(shdw_bucket),
            createFileList([
              ...files,
              new File([jsonFormat(m)], "manifest.json", {
                type: "application/json",
              }),
            ])
          )
        ).map((file) => ({
          file: files.find((f) => f.name === file.fileName),
          ...file,
        }));

        const creators = [
          new Creator({
            address: wallet?.publicKey,
            share: 100,
            verified: true,
          }),
        ];

        setAlertState!({
          message: (
            <button className="loading btn btn-ghost">Minting NFT</button>
          ),
          open: true,
        });
        const metaplex = new Metaplex(connection).use(
          walletAdapterIdentity(wallet.wallet.adapter)
        );

        const { transactionId } = await metaplex.nfts().create({
          symbol: m.symbol || "",
          name: m.name || "",
          uri: `https://shdw-drive.genesysgo.net/${shdw_bucket}/manifest.json`,
          sellerFeeBasisPoints: !Number.isNaN(+m.seller_fee_basis_points)
            ? +m.seller_fee_basis_points
            : 0,
          creators,
          isMutable: true
        });

        debugger;

        if (transactionId === "failed") {
          alert(transactionId);
          setLoading(false);
        } else {
          let confirmed = false;
          while (!confirmed) {
            setAlertState!({
              message: (
                <div className="flex flex-row items-center">
                  <button className="loading btn btn-ghost"></button> Confirming
                  transaction{" "}
                  <a
                    href={`https://explorer.solana.com/tx/${transactionId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="truncate"
                  >
                    {transactionId.slice(0, 3)} ...{" "}
                    {transactionId.slice(transactionId.length - 3)}
                  </a>
                </div>
              ),
              open: true,
            });
            const tx = await connection
              .getTransaction(transactionId, { commitment: "confirmed" })
              .catch((e) => {
                alert(e);
              });

            if (tx && tx?.meta?.postTokenBalances[0]?.mint) {
              setMint(tx?.meta?.postTokenBalances[0]?.mint);
              setAlertState({
                severity: "success",
                duration: 5000,
                message: "Success!",
                open: true,
              });
              confirmed = true;
            } else {
              await new Promise((resolve) => setTimeout(resolve, 100));
            }
          }
        }
        setLoading(false);
      } catch (e) {
        console.error(e);
        setLoading(false);
        setAlertState({
          open: false,
        });
        setModalState({
          message: "An error occured! For info check console!",
          open: true,
        });
      }
    },
    [wallet, files, connection, setAlertState]
  );

  const [balances, setBalances] = useState({
    shdw: "0",
    sol: "0",
  });

  useEffect(() => {
    (async () => {
      if (wallet.publicKey) {
        const shdwBalance = await connection.getTokenAccountBalance(
          await getAssociatedTokenAddress(SHDW_TOKEN, wallet.publicKey)
        );
        const solBalance = await connection.getBalance(wallet.publicKey);
        setBalances({
          shdw: shdwBalance.value.uiAmount.toFixed(2),
          sol: (solBalance / LAMPORTS_PER_SOL).toFixed(2),
        });
      }
    })();
  }, [wallet?.publicKey]);

  return wallet?.publicKey ? (
    <div>
      <br />

      <h2 className="text-3xl text-center">
        NFT Minting - powered by SHDW Drive - BETA
      </h2>

      <div>
        {!!balances.shdw && (
          <div className="w-full text-center mt-3">
            <span className="badge badge-success">{balances.shdw} SHDW</span>
            <span className="badge badge-primary ml-3">{balances.sol} SOL</span>
          </div>
        )}
      </div>

      <hr className="opacity-10 my-3" />

      <div className="card bg-gray-900">
        <div className="card-body">
          {!wallet && <WalletMultiButton />}
          {wallet && (
            <form
              className={`w-full flex flex-col`}
              onSubmit={handleSubmit((e) => upload(e))}
            >
              <h2 className="text-3xl font-bold text-center">Metadata</h2>
              <div className="text-center">
                The metadata standard is defined{" "}
                <a
                  href="https://docs.phantom.app/integrating/tokens/non-fungible-tokens"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: "underline" }}
                >
                  here by Phantom
                </a>
              </div>
              <br />
              <div
                className="form-control pb-6"
                style={{ position: "relative" }}
              >
                <label className="label">
                  <span className="label-text">Name *</span>
                </label>
                <input
                  type="text"
                  placeholder="Name"
                  className={`input input-bordered ${
                    !!errors.name ? "input-error" : ""
                  }`}
                  {...register("name", { required: true, maxLength: 32 })}
                />
                {errors.name && (
                  <label
                    className="label py-0"
                    style={{ position: "absolute", bottom: 0 }}
                  >
                    <span className="label-text-alt text-red-400">
                      {errors.name.type === "maxLength" && "Max 32 characters!"}
                      {errors.name.type === "required" && "Field is required!"}
                    </span>
                  </label>
                )}
              </div>
              <div
                className="form-control pb-6"
                style={{ position: "relative" }}
              >
                <label className="label" htmlFor="symbol">
                  <span className="label-text">Symbol</span>
                </label>
                <input
                  type="text"
                  placeholder="Symbol"
                  className={`input input-bordered ${
                    !!errors.symbol ? "input-error" : ""
                  }`}
                  {...register("symbol", { maxLength: 10 })}
                />
                {errors.symbol && (
                  <label
                    className="label py-0"
                    style={{ position: "absolute", bottom: 0 }}
                  >
                    <span className="label-text-alt text-red-400">
                      Max 10 characters!
                    </span>
                  </label>
                )}
              </div>
              <div
                className="form-control pb-6"
                style={{ position: "relative" }}
              >
                <label className="label" htmlFor="description">
                  <span className="label-text">Description</span>
                </label>
                <textarea
                  className="textarea h-24"
                  placeholder="Description"
                  {...register("description")}
                ></textarea>
              </div>{" "}
              <div
                className="form-control pb-6"
                style={{ position: "relative" }}
              >
                <label className="label">
                  <span className="label-text">
                    External URL (Link to your website, e.g.
                    https://rugbirdz.com)
                  </span>
                </label>
                <input
                  type="text"
                  placeholder="External URL"
                  {...register("external_url", { pattern: URL_MATCHER })}
                  className={`input input-bordered ${
                    !!errors.external_url ? "input-error" : ""
                  }`}
                />

                {errors.external_url && (
                  <label
                    className="label py-0"
                    style={{ position: "absolute", bottom: 0 }}
                  >
                    <span className="label-text-alt text-red-400">
                      Not a valid url, don&apos;t forget protocol (https://)
                    </span>
                  </label>
                )}
              </div>
              <div
                className="form-control pb-6"
                style={{ position: "relative" }}
              >
                <label htmlFor="category" className="label">
                  <span className="label-text">Category</span>
                </label>
                <Controller
                  name="properties.category"
                  control={control}
                  render={({ field: { onChange, onBlur, value, ref } }) => (
                    <select
                      onBlur={onBlur}
                      onChange={onChange}
                      className="select"
                      value={value}
                      ref={ref}
                      name="category"
                    >
                      <option value="image">Image</option>
                      <option value="video">Video</option>
                      <option value="html">HTML</option>
                    </select>
                  )}
                />
              </div>
              <div
                className="form-control pb-6"
                style={{ position: "relative" }}
              >
                <label className="label" htmlFor="seller_fee_basis_points">
                  <span className="label-text">
                    Resale Fee (0-10 000, e.g. for 5% use 500)
                  </span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="10000"
                  placeholder="e.g. 500"
                  {...register("seller_fee_basis_points", {
                    min: 0,
                    max: 10_000,
                  })}
                  className={`input input-bordered ${
                    !!errors.seller_fee_basis_points ? "input-error" : ""
                  }`}
                />

                {errors.seller_fee_basis_points && (
                  <label
                    className="label py-0"
                    style={{ position: "absolute", bottom: 0 }}
                  >
                    <span className="label-text-alt text-red-400">
                      Must be between 0 and 10 000
                    </span>
                  </label>
                )}
              </div>
              <AttributesForm register={register} />
              {FilesForm}
              {wallet && (
                <button
                  className={`btn ${loading ? "loading" : ""}`}
                  disabled={loading}
                  type="submit"
                >
                  Next
                </button>
              )}
            </form>
          )}
        </div>
      </div>

      <input
        type="checkbox"
        id="my-modal-2"
        checked={!!mint}
        className="modal-toggle"
      />

      <div id="my-modal" className="modal">
        <div className="modal-box">
          <p>
            NFT has been minted.{" "}
            <a
              className="link"
              target="_blank"
              rel="noopener noreferrer"
              href={`https://solscan.io/token/${mint}`}
            >
              View on SolScan
            </a>
          </p>
          <div className="modal-action">
            <a onClick={() => setMint(undefined)} className="btn">
              Close
            </a>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <>
      <div className="card bg-gray-700 max-w-xs mx-auto">
        <div className="card-body">
          <h2 className="text-center">To begin please</h2>
          <br />
          <WalletMultiButton />
        </div>
      </div>
    </>
  );
}
