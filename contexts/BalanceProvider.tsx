import { getAssociatedTokenAddress } from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { SHDW_TOKEN } from "../util/accounts";
import { StringPublicKey } from "../util/token-metadata";

const initState = {
  solBalance: "0",
  shdwBalance: "0",
};

const BalanceContext = createContext(initState);

export function BalanceProvider({ children }: { children: JSX.Element }) {
  const [shdwBalance, setShdwBalance] = useState("0");
  const [solBalance, setSolBalance] = useState("0");

  const { publicKey } = useWallet();
  const { connection } = useConnection();

  useEffect(() => {
    const fetchBalances = async () => {
      const solBalance = (
        (await connection.getBalance(publicKey)) / LAMPORTS_PER_SOL
      ).toFixed(4);
      setSolBalance(solBalance);
      const shdwBalance = (
        await connection.getTokenAccountBalance(
          await getAssociatedTokenAddress(SHDW_TOKEN, publicKey)
        )
      ).value.uiAmount.toFixed(4);
      setShdwBalance(shdwBalance);
    };

    if (publicKey) {
      fetchBalances();

      const iv = setInterval(async () => {
        await fetchBalances();
      }, 10000);
      return () => clearInterval(iv);
    }
  }, [publicKey]);

  return (
    <BalanceContext.Provider
      value={{
        shdwBalance,
        solBalance,
      }}
    >
      {children}
    </BalanceContext.Provider>
  );
}

export const useBalance = () => useContext(BalanceContext);
