/* eslint-disable react/display-name */
import React, { FunctionComponent, useEffect, useMemo, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { TokenInfo } from "@solana/spl-token-registry";
import { useWallet } from "@solana/wallet-adapter-react";

import { TOKEN_LIST_URL, useJupiter } from "@jup-ag/react-hook";

//import FeeInfo from "./FeeInfo";
import fetch from "cross-fetch";
import { toast } from "react-toastify";

const defaultProps = {
  styles: {
    primaryBackground: "#0E0D11",
    secondaryBackground: "#131318",
    stroke: "#51576B",
    primaryText: "#fff",
    accent: "#3f52ff",
  },
};

interface IJupiterFormProps {
  styles?: {
    primaryBackground: string;
    secondaryBackground: string;
    stroke: string;
    primaryText: string;
    accent: string;
  };
}

type UseJupiterProps = Parameters<typeof useJupiter>[0];

const SECOND_TO_REFRESH = 30;

const JupiterForm: FunctionComponent<IJupiterFormProps> = ({}) => {
  const wallet = useWallet();
  const [tokenMap, setTokenMap] = useState<Map<string, TokenInfo>>(new Map());
  const [exp, setExp] = useState(new RegExp("", "i"));

  const [formValue, setFormValue] = useState<UseJupiterProps>({
    amount: 10,
    inputMint: new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"),
    outputMint: new PublicKey("SHDWyBxihqiCj6YekG2GUr7wqKLeLAMK1gHZck9pL6y"),
    slippage: 5, // 0.5%
  });

  const [inputTokenInfo, outputTokenInfo] = useMemo(() => {
    return [
      tokenMap.get(formValue.inputMint?.toBase58() || ""),
      tokenMap.get(formValue.outputMint?.toBase58() || ""),
    ];
  }, [formValue.inputMint, formValue.outputMint, tokenMap]);

  useEffect(() => {
    fetch(TOKEN_LIST_URL["mainnet-beta"])
      .then((res) => res.json())
      .then((tokens: TokenInfo[]) => {
        setTokenMap(
          tokens.reduce((map, item) => {
            map.set(item.address, item);
            return map;
          }, new Map())
        );
      });
  }, [setTokenMap]);

  const amountInDecimal = useMemo(() => {
    return formValue.amount * 10 ** (inputTokenInfo?.decimals || 1);
  }, [inputTokenInfo, formValue.amount]);

  const allTokenMints = useMemo(
    () => [
      "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      "So11111111111111111111111111111111111111112",
    ],
    []
  );

  const {
    routeMap,
    routes,
    loading,
    exchange,
    //error,
    refresh,
    lastRefreshTimestamp,
  } = useJupiter({
    ...formValue,
    amount: amountInDecimal,
  });

  // ensure outputMint can be swapable to inputMint
  useEffect(() => {
    if (formValue.inputMint) {
      const possibleOutputs = routeMap.get(formValue.inputMint.toBase58());

      if (
        possibleOutputs &&
        !possibleOutputs?.includes(formValue.outputMint?.toBase58() || "")
      ) {
        setFormValue((val) => ({
          ...val,
          outputMint: new PublicKey(possibleOutputs[0]),
        }));
      }
    }
  }, [formValue.inputMint, formValue.outputMint, routeMap]);

  const [, setTimeDiff] = useState(lastRefreshTimestamp);
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (loading) return;

      const diff = (new Date().getTime() - lastRefreshTimestamp) / 1000;
      setTimeDiff((diff / SECOND_TO_REFRESH) * 100);

      if (diff >= SECOND_TO_REFRESH) {
        refresh();
      }
    }, 1000);
    return () => clearInterval(intervalId);
  }, [lastRefreshTimestamp, loading, refresh]);

  const Option = React.memo(({ value }: { value: any }) => {
    const found = tokenMap.get(value);

    return (
      <div key={value} className="flex flex-row gap-5 items-center p-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt={found?.symbol}
          src={found?.logoURI}
          style={{ width: "30px", borderRadius: "2rem" }}
        />
        <span>{found?.symbol}</span>
      </div>
    );
  });

  return (
    <div className="mx-auto my-6 max-w-md border border-primary card">
      <div className="card-body">
        <div className="grid grid-cols-1 gap-6">
          <div className="w-full form-control">
            <span className="mb-3 label-text">You pay</span>
            <label className="w-full input-group">
              <select
                id="inputMint"
                className="flex-1 border select"
                name="inputMint"
                defaultValue={allTokenMints[0]}
                onChange={(e) => {
                  console.log("e", e);
                  console.log("e.value.key", e.target.value);
                  const pbKey = new PublicKey(e.target.value);
                  if (pbKey) {
                    setFormValue((val) => ({
                      ...val,
                      inputMint: pbKey,
                    }));
                  }
                }}
              >
                {allTokenMints
                  .filter((o) => exp.test(o) && tokenMap.get(o)?.symbol)
                  .map((opt) => {
                    const value = tokenMap.get(opt);
                    return (
                      <option key={opt} value={value?.address}>
                        {value?.symbol}
                      </option>
                    );
                  })}
              </select>
              <input
                type={"text"}
                name="amount"
                className="flex-1 input"
                id="amount"
                placeholder="0"
                style={{ height: "100%" }}
                defaultValue={formValue.amount}
                onInput={(e: any) => {
                  let newValue = Number(e.target?.value || 0);
                  newValue = Number.isNaN(newValue) ? 0 : newValue;
                  setFormValue((val) => ({
                    ...val,
                    amount: Math.max(newValue, 0),
                  }));
                }}
              />
            </label>
          </div>
          <div className="form-control">
            <span className="mb-3 label-text">You get</span>
            <div className="input-group">
              <input
                disabled
                id="outputMint"
                className="flex-1 border border-r-0 input border-success disabled"
                name="outputMint"
                defaultValue={"SHDW"}
              />
              <input
                type={"text"}
                className="flex-1 border border-l-0 input border-success disabled"
                name="outAmount"
                id="outAmount"
                placeholder="0"
                disabled
                style={{ height: "100%" }}
                value={
                  routes
                    ? routes[0].outAmount /
                      10 ** (outputTokenInfo?.decimals || 1)
                    : 0
                }
              />
            </div>
          </div>

          <div className="flex flex-col">
            <span className="my-3">Best route out of {routes?.length}:</span>
            {routes?.[0] &&
              (() => {
                const route = routes[0];
                return (
                  <div
                    className="flex flex-row gap-3 p-3 border border-primary"
                    style={{
                      marginBottom: 10,
                      borderRadius: "1rem",
                    }}
                  >
                    <div className="flex flex-col">
                      <span>
                        {route.marketInfos
                          .map((info) => info.amm.label)
                          .join(" -> ")}
                      </span>
                      <span>
                        {route.marketInfos
                          .map(
                            (info) =>
                              `${
                                tokenMap.get(info?.inputMint.toString())?.symbol
                              } -> ${
                                tokenMap.get(info?.outputMint.toString())
                                  ?.symbol
                              }`
                          )
                          .join(" -> ")}
                      </span>
                    </div>
                  </div>
                );
              })()}
          </div>

          <div className="flex justify-center items-center">
            <button
              type="button"
              className={`w-full btn btn-outline btn-success ${
                loading && "loading"
              }`}
              disabled={loading}
              onClick={async () => {
                if (
                  !loading &&
                  routes?.[0] &&
                  wallet.signAllTransactions &&
                  wallet.signTransaction &&
                  wallet.sendTransaction &&
                  wallet.publicKey
                ) {
                  const swapResult = await exchange({
                    wallet,
                    routeInfo: routes[0],
                    onTransaction: async () => {
                      toast("sending transaction");
                    },
                  });

                  console.log({ swapResult });

                  if ("error" in swapResult) {
                    console.log("Error:", swapResult.error);
                  } else if ("txid" in swapResult) {
                    toast.dismiss();
                    toast("Success!", {
                      autoClose: 3000,
                    });
                    console.log("Sucess:", swapResult.txid);
                    console.log("Input:", swapResult.inputAmount);
                    console.log("Output:", swapResult.outputAmount);
                  }
                }
              }}
            >
              Swap best route
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

JupiterForm.defaultProps = defaultProps;

export default JupiterForm;
