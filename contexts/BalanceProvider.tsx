import { getAssociatedTokenAddress } from "@solana/spl-token-v2";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { SHDW_TOKEN } from "../util/accounts";

const initState = {
  solBalance: "0",
  shdwBalance: "0",
  usdcBalance: "0",
  shdwBalanceAsNumber: 0,solBalanceAsNumber:0,usdcBalanceAsNumber:0,
  fetchBalances: () => {},
};

const BalanceContext = createContext(initState);

export function BalanceProvider({ children }: { children: JSX.Element }) {
  const [shdwBalance, setShdwBalance] = useState("0");
  const [shdwBalanceAsNumber, setShdwBalanceAsNumber] = useState(0);
  const [solBalance, setSolBalance] = useState("0");
  const [solBalanceAsNumber, setSolBalanceAsNumber] = useState(0);
  const [usdcBalance, setUsdcBalance] = useState("0");
  const [usdcBalanceAsNumber, setUsdcBalanceAsNumber] = useState(0);

  const { publicKey } = useWallet();
  const { connection } = useConnection();

  const fetchBalances = useCallback(async () => {
    connection
      .getBalance(publicKey)
      .then((solBalance) => solBalance / LAMPORTS_PER_SOL)
      .then((solBalance) => {
        setSolBalance(solBalance.toFixed(4));
        setSolBalanceAsNumber(solBalance);
      });
    connection
      .getTokenAccountBalance(
        await getAssociatedTokenAddress(SHDW_TOKEN, publicKey)
      )
      .then((shdwBalance) => {
        setShdwBalanceAsNumber(shdwBalance.value.uiAmount);
        setShdwBalance(shdwBalance.value.uiAmount.toFixed(4));
      });

    connection
      .getTokenAccountBalance(
        await getAssociatedTokenAddress(
          new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"),
          publicKey
        )
      )
      .then((usdcBalance) => {
        setUsdcBalance(usdcBalance.value.uiAmount.toFixed(4));
        setUsdcBalanceAsNumber(usdcBalance.value.uiAmount);
      });
  }, [connection, publicKey]);

  useEffect(() => {
    if (publicKey) {
      fetchBalances();

      const iv = setInterval(async () => {
        await fetchBalances();
      }, 10000);
      return () => clearInterval(iv);
    }
  }, [connection, fetchBalances, publicKey]);

  return (
    <BalanceContext.Provider
      value={
        {
          shdwBalance,
          shdwBalanceAsNumber,
          solBalance,
          solBalanceAsNumber,
          usdcBalance,
          usdcBalanceAsNumber,
          fetchBalances,
        } as any
      }
    >
      {children}
    </BalanceContext.Provider>
  );
}

export const useBalance = () => useContext(BalanceContext);
