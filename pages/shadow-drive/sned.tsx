import { ShdwDrive, StorageAccountResponse } from "@shadow-drive/sdk";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { PublicKey } from "@solana/web3.js";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import jsonFormat from "json-format";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

import { getAccounts, isValidUnit } from "../../util/shdw";
import { FileUpload } from "../../components/file-upload";
import { sizeMB } from "../../components/paginated-files";
import { useFiles } from "../../contexts/FileProvider";
import createFileList from "../../util/create-file-list";
import { download } from "../../util/download";
import { shortenAddress } from "../../util/shorten-address";
import { BalanceProvider, useBalance } from "../../contexts/BalanceProvider";
import { ImageURI } from "../../util/image-uri";
import JupiterSwap from "../../components/jupiter-swap";

interface StorageAccountResponseWithVersion extends StorageAccountResponse {
  version: string;
}

const CreateWidget = ({ callback, onCancel, shdwDrive, hasCancel = true }) => {
  const { register, handleSubmit, reset } = useForm();
  const onSubmit = handleSubmit(
    async ({ storageAccountName, storageAccountSize }) => {
      if (!storageAccountName || !isValidUnit(storageAccountSize)) {
        return;
      }

      const id = toast(
        ` Storage Account "${storageAccountName}" is being created...`,
        { isLoading: true }
      );
      try {
        const response = await (shdwDrive as ShdwDrive).createStorageAccount(
          storageAccountName,
          storageAccountSize,
          "v2"
        );
        toast.dismiss(id);
        toast("Storage account created at " + response.shdw_bucket, {
          autoClose: 3000,
          type: "success",
        });
        reset();
        callback(response.shdw_bucket);
      } catch (e) {
        toast.dismiss();
        toast("An error occured. Check Console for more info!", {
          autoClose: 3000,
          type: "error",
        });
      }
    }
  );

  return (
    <div className="p-2 mx-auto rounded-lg card bg-base-300">
      <div className="p-4">
        <form className="grid grid-cols-4 gap-4" onSubmit={onSubmit}>
          <input
            type="text"
            {...register("storageAccountName")}
            className="col-span-2 w-60 input"
            placeholder="Name"
          />
          <input
            type="text"
            {...register("storageAccountSize")}
            className="col-span-2 w-60 input"
            placeholder="Size (in kb, mb or gb, e.g. 10mb)"
          />

          <>
            <input
              className="col-span-2 col-start-3 row-start-2 btn btn-success btn-sm btn-outline"
              type="submit"
              value={"Add"}
            />
            {hasCancel && (
              <button
                className="col-span-2 col-start-1 row-start-2 btn btn-sm btn-outline"
                onClick={onCancel}
              >
                Cancel
              </button>
            )}
          </>
        </form>
      </div>
    </div>
  );
};

function Sned() {
  const { register, setValue } = useForm();
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const { files, totalSize, setFiles } = useFiles();
  const wallet = useWallet();
  const { connection } = useConnection();
  const shdwDrive = useRef<ShdwDrive>(null);
  const [accounts, setAccounts] = useState<StorageAccountResponseWithVersion[]>(
    []
  );
  const [selectedAccount, setSelectedAccount] = useState<string>();
  const { solBalance, shdwBalance } = useBalance();
  const [showingForm, setShowingForm] = useState(false);
  const [isCreatingStorageAccount, setIsCreatingStorageAccount] =
    useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const { query } = useRouter();

  const onStorageCreateSuccess = useCallback(
    async (id) => {
      const accs = await getAccounts(shdwDrive.current);
      if (accs.length) {
        setAccounts(accs);
        setIsCreatingStorageAccount(false);
        setSelectedAccount(id);
        setValue("selectedAccount", id);
      }
    },
    [setValue]
  );

  useEffect(() => {
    if (query?.storageAccount && wallet?.publicKey) {
      setSelectedAccount(query?.storageAccount as string);
      setValue("selectedAccount", query?.storageAccount);
    }
  }, [query?.storageAccount, setValue, wallet?.publicKey]);

  useEffect(() => {
    (async () => {
      if (wallet && wallet.publicKey) {
        setLoading(true);
        const shdw = await new ShdwDrive(connection, wallet).init();
        shdwDrive.current = shdw;
        const accs = await getAccounts(shdwDrive.current);
        if (accs.length) {
          setAccounts(accs);
          setSelectedAccount(accs[0].publicKey.toBase58());
        }
        setLoading(false);
      }
    })();
  }, [connection, wallet]);

  const upload = useCallback(async () => {
    setUploadLoading(true);
    const res = await shdwDrive.current.uploadMultipleFiles(
      new PublicKey(selectedAccount),
      createFileList(files)
    );

    download(`shdw-upload-${Date.now()}`, jsonFormat(res));
    setUploadSuccess(true);
    setUploadLoading(false);
  }, [files, selectedAccount]);

  const filesTooLarge = useMemo(
    () =>
      totalSize >
      (accounts.find((acc) => acc.publicKey.toBase58() === selectedAccount)
        ?.account?.storageAvailable ||
        accounts.find((acc) => acc.publicKey.toBase58() === selectedAccount)
          ?.account?.storage),
    [accounts, selectedAccount, totalSize]
  );

  if (uploadSuccess) {
    return (
      <>
        <div className="mb-3 max-w-full text-center">
          <h1 className="text-4xl text-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={ImageURI.GenesysGo}
              alt=""
              className="mr-3"
              style={{
                width: 48,
                height: 48,
                display: "inline",
              }}
            />
            SHDW Sned 9000
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={ImageURI.GenesysGo}
              alt=""
              className="ml-3"
              style={{
                width: 48,
                height: 48,
                display: "inline",
              }}
            />
          </h1>
          {!!shdwBalance && (
            <div className="mt-3">
              <span className="badge badge-success">{shdwBalance} SHDW</span>
              <span className="ml-3 badge badge-primary">{solBalance} SOL</span>
            </div>
          )}
          <button
            className="mt-3 btn btn-success btn-outline btn-sm"
            onClick={() => setShowingForm(!showingForm)}
          >
            {showingForm ? "Close Swap" : "Get $SHDW"}
          </button>
          <hr className="my-4 opacity-10" />
          <div>
            Upload has been successful, check your downloaded files for the
            logs.
            <br />
            <button
              className="mt-3 btn btn-primary"
              onClick={() => {
                setFiles([]);
                setUploadSuccess(false);
              }}
            >
              Do another upload
            </button>
          </div>
        </div>
      </>
    );
  }
  return (
    <>
      <div className="mb-3 max-w-full text-center">
        <h1 className="text-4xl text-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={ImageURI.GenesysGo}
            alt=""
            className="mr-3"
            style={{
              width: 48,
              height: 48,
              display: "inline",
            }}
          />
          SHDW Sned 9000
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={ImageURI.GenesysGo}
            alt=""
            className="ml-3"
            style={{
              width: 48,
              height: 48,
              display: "inline",
            }}
          />
        </h1>
        {!!shdwBalance && (
          <div className="mt-3">
            <span className="badge badge-success">{shdwBalance} SHDW</span>
            <span className="ml-3 badge badge-primary">{solBalance} SOL</span>
          </div>
        )}
        <button
          className="mt-3 btn btn-success btn-outline btn-sm"
          onClick={() => setShowingForm(!showingForm)}
        >
          {showingForm ? "Close Swap" : "Get $SHDW"}
        </button>
        <hr className="my-4 opacity-10" />
      </div>

      {showingForm && (
        <div className="my-3">
          <JupiterSwap />
        </div>
      )}

      <div className="max-w-full bg-gray-900 card">
        <div className="card-body">
          {!!wallet?.publicKey ? (
            !!accounts.length ? (
              <>
                {" "}
                <div className="grid grid-cols-3">
                  <div className="col-start-2 form-control">
                    <label className="label">
                      <span className="label-text">Storage Account</span>
                    </label>
                    <select
                      className="mb-3 select"
                      {...register("selectedAccount")}
                      onChange={(e) => {
                        const found = accounts.find(
                          (acc) =>
                            acc.publicKey.toBase58() === e.currentTarget.value
                        );
                        setSelectedAccount(found.publicKey.toBase58());
                      }}
                      value={selectedAccount}
                    >
                      {accounts.map((account) => (
                        <option
                          selected={
                            account.publicKey.toBase58() === selectedAccount
                          }
                          value={account.publicKey.toBase58()}
                          key={account.publicKey.toBase58()}
                        >
                          ({(account as any).version}){" "}
                          {account.account.identifier} -{" "}
                          {shortenAddress(account.publicKey.toBase58())} -{" "}
                          {sizeMB(
                            (account as any).reserved_bytes -
                              (account as any).current_usage
                          )}{" "}
                          MB free
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                {uploadLoading ? (
                  <>
                    <div className="flex justify-center items-center p-3 text-center">
                      <button className="btn btn-ghost loading">
                        Uploading {files?.length} files.
                      </button>
                    </div>
                  </>
                ) : (
                  !isCreatingStorageAccount && (
                    <button
                      className={`mx-auto w-52 btn btn-primary btn-sm`}
                      onClick={async () => {
                        setIsCreatingStorageAccount(!isCreatingStorageAccount);
                      }}
                      disabled={loading}
                    >
                      Add new Storage Account
                    </button>
                  )
                )}
                {isCreatingStorageAccount && (
                  <CreateWidget
                    shdwDrive={shdwDrive.current}
                    callback={onStorageCreateSuccess}
                    onCancel={() => setIsCreatingStorageAccount(false)}
                  />
                )}
                <hr className="my-2 opacity-20" />
                <div className="mt-4">
                  <FileUpload />
                </div>
                {!!filesTooLarge && (
                  <div className="text-center">
                    <div className="badge badge-error">
                      Files too large for selected storage account!
                    </div>
                  </div>
                )}
                {!!files.length && (
                  <div className="mt-6 text-center">
                    <button
                      className={`btn btn-primary rounded-box shadow-lg ${
                        loading ? "loading" : ""}`}
                      disabled={!files.length || filesTooLarge}
                      onClick={upload}
                    >
                      {loading ? "Uploading..." : "Upload"}
                    </button>
                    <br />
                  </div>
                )}
              </>
            ) : loading ? (
              <div className="flex justify-center items-center">
                <button className="btn btn-ghost loading"></button>
              </div>
            ) : (
              <>
                <div className="w-full text-center">
                  {" "}
                  No storage accounts yet.
                </div>
                <div className="grid grid-cols-4 w-full">
                  <div className="col-span-2 col-start-2">
                    <CreateWidget
                      shdwDrive={shdwDrive.current}
                      callback={onStorageCreateSuccess}
                      onCancel={() => {}}
                      hasCancel={false}
                    />
                  </div>
                </div>
              </>
            )
          ) : (
            <div className="flex flex-row justify-center items-center">
              <WalletMultiButton />
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// export default Sned;
const Wrapper = () => (
  <BalanceProvider>
    <Sned />
  </BalanceProvider>
);
export default Wrapper;
