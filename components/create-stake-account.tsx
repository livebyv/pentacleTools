import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  AccountInfo,
  Authorized,
  LAMPORTS_PER_SOL,
  ParsedAccountData,
  PublicKey,
  StakeProgram,
} from "@solana/web3.js";
import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { useAlert } from "../contexts/AlertProvider";
import { useBalance } from "../contexts/BalanceProvider";
import { getBlockhashWithRetries } from "../util/get-blockhash-with-retries";
import {
  accountInfoToStakeAccount,
  sortStakeAccountMetas,
  StakeAccountMeta,
  STAKE_PROGRAM_ID,
} from "../util/stake-account";
import BN from "bignumber.js";
import { sleep } from "../util/sleep";

function CreateStakeAccount({ callback, seed, stakeAccounts, dispatch }) {
  const { register, watch, handleSubmit } = useForm();
  const { connection } = useConnection();
  const { solBalance } = useBalance();
  const { setAlertState } = useAlert();
  const { publicKey } = useWallet();
  const stakeAmount = watch("stakeAmount", 0);
  const addStakeAccount = async (
    stakeAccountPublicKey: PublicKey,
    seed: string,
    _stakeAccounts: StakeAccountMeta[]
  ) => {
    if (!_stakeAccounts) {
      return;
    }
    let newStakeAccounts = [..._stakeAccounts];

    // Try a few times with standoff
    let parsedAccountInfo: AccountInfo<Buffer | ParsedAccountData> | null =
      null;
    for (let i = 0; i < 5; i++) {
      parsedAccountInfo = (
        await connection.getParsedAccountInfo(stakeAccountPublicKey)
      ).value;
      if (parsedAccountInfo) {
        break;
      } else {
        await sleep(600);
      }
    }
    if (!parsedAccountInfo) {
      console.log("Did not find new account after retries");
      return;
    }
    const stakeAccount = accountInfoToStakeAccount(parsedAccountInfo);
    if (!stakeAccount) {
      return;
    }
    newStakeAccounts.push({
      address: publicKey,
      seed,
      lamports: parsedAccountInfo.lamports,
      stakeAccount,
      inflationRewards: [],
    });
    sortStakeAccountMetas(newStakeAccounts);
    dispatch({
      type: "stakeAccounts",
      payload: { stakeAccounts: newStakeAccounts },
    });
  };

  const createStakeAccount = useCallback(
    async (amount) => {
      if (!publicKey) {
        return;
      }
      debugger
      // setAlertState({
      //   message: (
      //     <>
      //       <button className="btn btn-ghost loading">
      //         {" "}
      //         Creating stake account...
      //       </button>
      //     </>
      //   ),
      // });
      try {
        const stakePubkey = await PublicKey.createWithSeed(
          publicKey,
          seed,
          StakeProgram.programId
        );

        const lamports = new BN(amount)
          .multipliedBy(LAMPORTS_PER_SOL)
          .toNumber();
        const transaction = StakeProgram.createAccountWithSeed({
          fromPubkey: publicKey,
          stakePubkey,
          basePubkey: publicKey,
          seed: seed,
          authorized: new Authorized(publicKey, publicKey),
          lamports,
        });

        const newStakeAccountPubkey = await PublicKey.createWithSeed(
          publicKey,
          seed,
          STAKE_PROGRAM_ID
        );
        transaction.feePayer = publicKey;
        transaction.recentBlockhash = (
          await getBlockhashWithRetries(connection)
        ).blockhash;
        await connection.sendRawTransaction(transaction.serialize());
        addStakeAccount(newStakeAccountPubkey, seed, stakeAccounts);
        setAlertState({
          duration: 3000,
          message: "Stake account added!",
          severity: "success",
        });
      } catch (e) {
        setAlertState({
          duration: 10000,
          message: "An Error occured",
          severity: "error",
        });
      }
    },
    [publicKey, seed, connection]
  );

  const handleCallback = (event: any) => {
    event.preventDefault();
    callback(event);
  };

  return (
    <form
      onSubmit={handleSubmit(({ stakeAmount }) => console.log({ stakeAmount }))}
    >
      <div className="flex absolute right-0 top-8 z-40 flex-col px-4 py-2 rounded border shadow border-slate-800 bg-neutral">
        <input
          {...register("stakeAmount")}
          className="input"
          type="number"
          min={0}
          step={1 / LAMPORTS_PER_SOL}
          max={+solBalance - 0.003}
        />
        <span className="mt-3">SOL</span>
        <button
          className="btn btn-primary btn-sm"
          disabled={!stakeAmount}
          onClick={(e) => {
            e.preventDefault();
            createStakeAccount(+stakeAmount);
          }}
        >
          Create
        </button>
      </div>
    </form>
  );
}

export default CreateStakeAccount;
