import { getAssociatedTokenAddress } from "@solana/spl-token-v2";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { SHDW_TOKEN } from "../util/accounts";

const initState = {
  solBalance: "0",
  shdwBalance: "0",
  usdcBalance: '0',
  shdwBalanceAsNumber: 0,
  forceUpdate: () => {}
};

const BalanceContext = createContext(initState);

export function BalanceProvider({ children }: { children: JSX.Element }) {
  const [shdwBalance, setShdwBalance] = useState("0");
  const [shdwBalanceAsNumber, setShdwBalanceAsNumber] = useState(0);
  const [solBalance, setSolBalance] = useState("0");
  const [usdcBalance, setUsdcBalance] = useState('0');
  const [update, forceUpdate] = useState();

  const { publicKey } = useWallet();
  const { connection } = useConnection();

  useEffect(() => {
    console.log(update);
    const fetchBalances = async () => {
      const solBalance = (
        (await connection.getBalance(publicKey)) / LAMPORTS_PER_SOL
      ).toFixed(4);
      setSolBalance(solBalance);
      const shdwBalance = (
        await connection.getTokenAccountBalance(
          await getAssociatedTokenAddress(SHDW_TOKEN, publicKey)
        )
      );
      setShdwBalanceAsNumber(shdwBalance.value.uiAmount);
      setShdwBalance(shdwBalance.value.uiAmount.toFixed(4));
      const usdcBalance = (
        await connection.getTokenAccountBalance(
          await getAssociatedTokenAddress(new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'), publicKey)
        )
      ).value.uiAmount.toFixed(4);
      setUsdcBalance(usdcBalance);
    };

    if (publicKey) {
      fetchBalances();

      const iv = setInterval(async () => {
        await fetchBalances();
      }, 10000);
      return () => clearInterval(iv);
    }
  }, [connection, publicKey, update]);

  return (
    <BalanceContext.Provider
      value={{
        shdwBalance,
        shdwBalanceAsNumber,
        solBalance,
        usdcBalance,
        forceUpdate
      } as any}
    >
      {children}
    </BalanceContext.Provider>
  );
}

export const useBalance = () => useContext(BalanceContext);
