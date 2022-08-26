import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { SOL_ADDRESS_REGEXP } from "../util/validators";
import { useModal } from "../contexts/ModalProvider";
import { getMints } from "../util/get-mints";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import Head from "next/head";
import { download } from "../util/download";
import { toast } from "react-toastify";

export default function GibMints() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm();
  const [loading, setLoading] = useState(false);
  const { setModalState } = useModal();
  const { connection } = useConnection();
  const { connected, publicKey } = useWallet();
  const [counter, setCounter] = useState(0);
  const [localStorageItems, setLocalStorageItems] = useState([]);
  const [selectedStorageItem, setSelectedStorageitem] = useState(null);

  useEffect(() => {
    const items = localStorage.getItem("previous-jobs_get-mints");
    if (items) {
      const parsed = JSON.parse(items);
      setLocalStorageItems(parsed);
      setSelectedStorageitem(parsed[0]);
    }
  }, []);

  const fetchMints = async (val = "") => {
    toast("Downloading your data.", { isLoading: true });
    setLoading(true);
    getMints(val, connection, setCounter)
      .then((mints) => {
        const output = {
          name: `mints-cmid-${val}`,
          timestamp: new Date(),
          items: mints,
        };
        const outputAsString = JSON.stringify(output);
        download(`mints-cmid-${val}.json`, outputAsString);
        const updatedItems = localStorageItems
          ? [...localStorageItems, output]
          : [output];
        const updatedItemsAsString = JSON.stringify(
          localStorageItems ? [...localStorageItems, output] : [output]
        );
        localStorage.setItem("previous-jobs_get-mints", updatedItemsAsString);
        setLocalStorageItems(updatedItems);
        setLoading(false);
      })
      .catch((e) => {
        try {
          setModalState({
            message: e?.message || e,
            open: true,
          });
        } catch {
          setLoading(false);
        }
      })
      .finally(() => {
        toast.dismiss();
        setLoading(false);
      });
  };

  const pubkeyString = publicKey?.toBase58();

  return (
    <>
      <Head>
        <title>🛠️ Pentacle Tools - 🆔 NFT Minters</title>
      </Head>
      <div className="mb-3 w-full max-w-full text-center">
        <h1 className="text-3xl text-white">Get NFT Mints</h1>
        <hr className="my-4 opacity-10" />
      </div>
      <p className="text-center">
        This tool gets all mint IDs associated with the given address.
      </p>
      <hr className="my-4 opacity-10" />
      <div className="bg-gray-900 card">
        <div className="card-body">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
            <div className="md:col-start-2 md:col-span-3">
              <label className="justify-center mb-4 label">
                Please enter CM ID or Verified Creator
              </label>
              <input
                {...register("address", {
                  required: "This field is required!",
                  pattern: {
                    value: SOL_ADDRESS_REGEXP,
                    message: "Invalid address",
                  },
                })}
                required
                type="text"
                className={`input shadow-lg w-full ${
                  !!errors?.address?.message && "input-error"
                }`}
                id="address-field"
                autoComplete="on"
              />
              {!!errors?.address?.message && (
                <label className="label text-error">
                  {errors?.address?.message}
                </label>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-4 justify-center items-center mt-6">
            <form
              onSubmit={handleSubmit(({ address }) => fetchMints(address))}
              className={`flex flex-col w-full`}
            >
              <div className="text-center">
                <button
                  className={`btn btn-primary rounded-box shadow-lg ${
                    loading ? "loading" : ""}`}
                  disabled={!!errors?.address}
                  type="submit"
                >
                  {loading && counter === 0 && `Getting transactions...`}
                  {loading &&
                    counter > 0 &&
                    `Getting Mints.. ${counter} so far `}
                  {!loading && "Get Mints!"}
                </button>
              </div>

              {connected ? (
                <>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setValue("address", pubkeyString);
                      fetchMints(pubkeyString);
                    }}
                    className="btn btn-primary rounded-box"
                  >
                    {" "}
                    Use Wallet <br />
                    {pubkeyString.slice(0, 3)}...
                    {pubkeyString.slice(
                      pubkeyString.length - 3,
                      pubkeyString.length
                    )}
                  </button>
                </>
              ) : (
                <></>
              )}
            </form>

            {!!localStorageItems?.length && (
              <>
                <label className="label">Previous Downloads</label>
                <div
                  className="flex flex-row gap-3 justify-center"
                  style={{ flexWrap: "wrap" }}
                >
                  <select className="select">
                    {localStorageItems.map((item) => (
                      <>
                        <option>
                          CM-ID: {item.name.split(`mints-cmid-`)[1]} -
                          {new Date(item.timestamp).toLocaleString()} -{" "}
                          {item.items.length} mints
                        </option>
                      </>
                    ))}
                  </select>
                  <button
                    className="shadow-lg btn btn-primary rounded-box"
                    onClick={() => {
                      download(
                        `${selectedStorageItem.name}.json`,
                        JSON.stringify(selectedStorageItem)
                      );
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/download-icon.png" alt="" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
