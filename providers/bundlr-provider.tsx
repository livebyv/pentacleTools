import { WebBundlr } from "@bundlr-network/client";
import { useWallet } from "@solana/wallet-adapter-react";
import BigNumber from "bignumber.js";
import React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { AlertContext } from "./alert-provider";

const initialState: {
  updateFundAmount?: Function;
  updateWithdrawAmount?: Function;
  withdraw?: Function;
  setWithdrawAmount?: Function;
  fund?: Function;
  clean?: Function;
  bundler?: WebBundlr;
  balance?: string;
  bundlerHttpAddress?: string;
} = {};

export const BundlrContext = createContext(initialState);

export function BundlrProvider({ children }) {
  const wallet = useWallet();
  const providerMap = {
    Phantom: async (c: any) => {
      if ((window as any).solana.isPhantom) {
        await wallet.connect();
        return wallet;
      }
    },
  } as any;

  const currencyMap = {
    solana: {
      providers: ["Phantom"],
      opts: {},
    },
  } as any;

  const defaultCurrency = "solana";
  const defaultSelection = "Phantom";

  const [balance, setBalance] = useState<string>();
  const [bundler, setBundler] = useState<WebBundlr>();
  const bundlerHttpAddress = "https://node1.bundlr.network";
  const [withdrawAmount, setWithdrawAmount] = React.useState<string>();

  const { setAlertState } = useContext(AlertContext);
  const intervalRef = React.useRef<NodeJS.Timer>();

  useEffect(() => {
    if (wallet.publicKey) {
      initBundlr(wallet.adapter);
    }
  }, [wallet.publicKey]);

  const clean = async () => {
    clearInterval(intervalRef.current);
    setBalance(undefined);
    setBundler(undefined);
  };

  useEffect(() => {
    if (bundler && !intervalRef) {
      const iv = setInterval(async () => {
        bundler
          ?.getLoadedBalance()
          .then((r) => {
            setBalance(r.toString());
          })
          .catch((_) => clearInterval(intervalRef.current));
      }, 5000);
  
      intervalRef.current = iv;
  
      return () => clearInterval(iv)
    }
  }, []);

  useEffect(() => {
    bundler?.getLoadedBalance().then((r) => {
      setBalance(r.toString());
    });
  }, [bundler]);

  // parse decimal input into atomic units
  const parseInput = (input: string | number) => {
    const conv = new BigNumber(input).multipliedBy(
      bundler!.currencyConfig.base[1]
    );
    if (conv.isLessThan(1)) {
      setAlertState({ severity: "error", message: `Value too small!`, open: true, duration: 3000 });
      return;
    }
    return conv;
  };



  const fund = async (fundAmount) => {
    if (bundler && fundAmount) {
      const value = parseInput(fundAmount);
      if (!value) return;
      await bundler
        .fund(value)
        .then((res) => {
          setAlertState({
            severity: "success",
            message: `Funded ${res?.target}
        tx ID : ${res?.id}`,
            duration: 10000,
            open: true, 
          });
        })
        .catch((e) => {
          setAlertState({
            severity: "error",
            message: `Failed to fund - ${e.data?.message || e.message}`,
            open: true, 
            duration: 10000
          });
        });
    }
  };

  const withdraw = async () => {
    if (bundler && withdrawAmount) {
      setAlertState({
        severity: "info",
        message: "Withdrawing..",
        duration: 15000,
        open: true
      });
      const value = parseInput(withdrawAmount);
      if (!value) return;
      await bundler
        .withdrawBalance(value)
        .then((data) => {
          setAlertState({
            severity: "success",
            message: `Withdrawal successful - ${data.data?.tx_id}`,
            duration: 5000,
        open: true
          });
        })
        .catch((err: any) => {
          setAlertState({
            severity: "error",
            message: `
            Withdrawal Unsuccessful!

            ${err.message}
            `,
            duration: 5000,
        open: true
          });
        });
    }
  };

  const updateWithdrawAmount = (evt: React.BaseSyntheticEvent) => {
    setWithdrawAmount(evt.target.value);
  };

  /**
   * initialises the selected provider/currency
   * @param cname currency name
   * @param pname provider name
   * @returns
   */
  const initProvider = async () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (wallet) {
      setBundler(undefined);
      return;
    }

    const p = providerMap[defaultSelection]; // get provider entry
    const c = currencyMap[defaultCurrency];
    console.log(`loading: ${defaultSelection} for ${defaultCurrency}`);
    await wallet.connect().catch((e: Error) => {
      setAlertState({
        severity: "error",
        message: `Failed to load provider ${defaultSelection}`,
        duration: 10000,
        open: true

      });
      console.log(e);
      return;
    });
    // setProvider(providerInstance);
  };

  const initBundlr = async (provider) => {
    const bundlr = new WebBundlr(bundlerHttpAddress, defaultCurrency, provider);
    try {
      // Check for valid bundlr node
      await bundlr.utils.getBundlerAddress(defaultCurrency);
    } catch {
      setAlertState({
        severity: "error",
        message: `Failed to connect to bundlr ${bundlerHttpAddress}`,
        duration: 10000,
        open: true

      });
      return;
    }
    try {
      await bundlr.ready();
    } catch (err) {
      console.log(err);
    } //@ts-ignore
    if (!bundlr.address) {
      console.log("something went wrong");
    }
    setAlertState({
      severity: "success",
      message: `Connected to ${bundlerHttpAddress}`,
      open: true,
      duration: 5000
    });
    setBundler(bundlr);
  };

  useEffect(() => {
    if (wallet.publicKey) {
      initProvider();
    }
  }, [wallet.publicKey]);

  return (
    <BundlrContext.Provider
      value={{
        updateWithdrawAmount,
        withdraw,
        setWithdrawAmount,
        fund,
        clean,
        bundler,
        balance,
        bundlerHttpAddress,
      }}
    >
      {children}
    </BundlrContext.Provider>
  );
}
