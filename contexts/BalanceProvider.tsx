import { getAssociatedTokenAddress } from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { createContext, useContext, useEffect, useReducer } from "react";
import { SHDW_TOKEN } from "../util/accounts";
import { StringPublicKey } from "../util/token-metadata";

const initState = {
  balance: {
    sol: 0,
    shdw: 0,
  },
  loading: false,
};

const BalanceContext = createContext(initState);

export function BalanceProvider({ children }: { children: JSX.Element }) {
  const [state, dispatch] = useReducer(
    (
      state: typeof initState,
      action:
        | { type: "loading"; payload?: { loading: boolean } }
        | { type: "solBalance"; payload?: { solBalance: StringPublicKey } }
        | { type: "shdwBalance"; payload?: { shdwBalance: StringPublicKey } }
    ) => {
      switch (action.type) {
        case "loading":
          return { ...state, loading: action.payload.loading };
        case "solBalance":
          return { ...state, solBalance: action.payload.solBalance };
        case "shdwBalance":
          return { ...state, shdwBalance: action.payload.shdwBalance };
        default:
          throw new Error("unsupported action type given on SendNFTs reducer");
      }
    },
    initState
  );

  const { publicKey } = useWallet();
  const { connection } = useConnection();

  useEffect(() => {
    const fetchBalances = async () => {
      dispatch({
        type: "solBalance",
        payload: {
          solBalance: (
            (await connection.getBalance(publicKey)) / LAMPORTS_PER_SOL
          ).toFixed(6),
        },
      });
      dispatch({
        type: "shdwBalance",
        payload: {
          shdwBalance: (
            await connection.getTokenAccountBalance(
              await getAssociatedTokenAddress(SHDW_TOKEN, publicKey)
            )
          ).value.uiAmount.toFixed(2),
        },
      });
    };

    fetchBalances();

    const iv = setInterval(async () => {
      await fetchBalances();
    }, 10000);
    return () => clearInterval(iv);
  }, []);

  return (
    <BalanceContext.Provider
      value={{
        balance: {
          shdw: state.balance.shdw,
          sol: state.balance.sol,
        },
        loading: state.loading,
      }}
    >
      {children}
    </BalanceContext.Provider>
  );
}

export const useBalance = () => useContext(BalanceContext);
