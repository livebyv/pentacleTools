import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  PublicKey,
  AccountInfo,
  LAMPORTS_PER_SOL,
  ParsedAccountData,
  Authorized,
  StakeProgram,
  Connection,
  KeyedAccountInfo,
  Context,
  VoteAccountInfo,
  ValidatorInfo,
} from "@solana/web3.js";
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import {
  accountInfoToStakeAccount,
  findStakeAccountMetas,
  sortStakeAccountMetas,
  StakeAccountMeta,
  STAKE_PROGRAM_ID,
} from "../util/stake-account";
import React from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import {
  AccountsContext,
  AccountsProvider,
} from "../contexts/AccountsProvider";
import { sleep } from "../util/sleep";
import BN from "bignumber.js";
import { useForm } from "react-hook-form";
import { getBlockhashWithRetries } from "../util/get-blockhash-with-retries";
import { useAlert } from "../contexts/AlertProvider";
import { useAsyncAbortable } from "react-async-hook";
import { SearchIcon } from "../components/icons";
import { ValidatorMeta, validatorBatcher } from "../util/validator-batcher";
import { toPublicKey } from "../util/to-publickey";
import { StakeDelegationCard } from "../components/stake-delegation-card";
import { BalanceProvider, useBalance } from "../contexts/BalanceProvider";
import ValidatorCard from "../components/validator-card";
import { getStakeviewApys, ValidatorApy } from "../util/stakeviewApp";
import { getValidatorScores, ValidatorScore } from "../util/validatorsApp";
import Head from "next/head";

const CONFIG_PROGRAM_ID = new PublicKey(
  "Config1111111111111111111111111111111111111"
);

async function getValidatorInfos(connection: Connection) {
  const validatorInfoAccounts = await connection.getProgramAccounts(
    CONFIG_PROGRAM_ID
  );

  console.log(validatorInfoAccounts.length);
  return validatorInfoAccounts.flatMap((validatorInfoAccount) => {
    const validatorInfo = ValidatorInfo.fromConfigData(
      validatorInfoAccount.account.data
    );
    return validatorInfo ? [validatorInfo] : [];
  });
}

interface Validators {
  voteAccountInfos: VoteAccountInfo[];
  validatorInfos: ValidatorInfo[];
  validatorScores: ValidatorScore[];
  validatorApys: ValidatorApy[];
  totalActivatedStake: number;
}
export async function onStakeAccountChangeCallback(
  connection: Connection,
  keyedAccountInfo: KeyedAccountInfo,
  _context: Context,
  stakeAccounts: StakeAccountMeta[] | null,
  walletPublicKey: PublicKey
): Promise<StakeAccountMeta[] | undefined> {
  const { accountId, accountInfo } = keyedAccountInfo;
  console.log(`StakeAccount update for ${accountId.toBase58()}`);

  const index =
    stakeAccounts?.findIndex((extistingStakeAccountMeta) =>
      extistingStakeAccountMeta.address.equals(accountId)
    ) ?? -1;
  let updatedStakeAccounts = stakeAccounts ? [...stakeAccounts] : [];

  // Ideally we should just subscribe as jsonParsed, but that isn't available through web3.js
  const { value } = await connection.getParsedAccountInfo(accountId);
  const parsedAccountInfo = value;
  console.log(
    accountInfo.lamports,
    accountInfo.data,
    accountInfo.owner.toBase58()
  );
  if (!parsedAccountInfo) {
    // The account can no longer be found, it has been closed
    if (index > -1) {
      updatedStakeAccounts.splice(index, 1);
      return updatedStakeAccounts;
    }
    return;
  }
  const newStakeAccount = accountInfoToStakeAccount(parsedAccountInfo);
  if (!newStakeAccount) {
    console.log(`Could not find parsed data: ${accountId.toBase58()}`);
    return;
  }

  if (index === -1) {
    console.log(
      `Could not find existing stake account for address, adding: ${stakeAccounts?.length} ${newStakeAccount}`
    );
    const naturalStakeAccountSeedPubkeys = await Promise.all(
      Array.from(Array(20).keys()).map(async (i) => {
        const seed = `${i}`;
        return PublicKey.createWithSeed(
          walletPublicKey,
          seed,
          STAKE_PROGRAM_ID
        ).then((pubkey) => ({ seed, pubkey }));
      })
    );

    const seed =
      naturalStakeAccountSeedPubkeys.find((element) =>
        element.pubkey.equals(accountId)
      )?.seed ?? "N.A.";
    updatedStakeAccounts.push({
      address: accountId,
      seed,
      lamports: parsedAccountInfo.lamports,
      stakeAccount: newStakeAccount,
      inflationRewards: [], // In 99.999% of cases this should be correct
    });
  } else {
    updatedStakeAccounts[index].stakeAccount = newStakeAccount;
  }

  sortStakeAccountMetas(updatedStakeAccounts);
  return updatedStakeAccounts;
}

export async function findFirstAvailableSeed(
  userPublicKey: PublicKey,
  stakeAccountMetas: StakeAccountMeta[]
) {
  let seedIndex = 0;
  while (1) {
    const newStakeAccountPubkey = await PublicKey.createWithSeed(
      userPublicKey,
      seedIndex.toString(),
      STAKE_PROGRAM_ID
    );
    const matching = stakeAccountMetas.find((meta) =>
      newStakeAccountPubkey.equals(meta.address)
    );
    if (!matching) {
      break;
    }
    seedIndex++;
  }

  return seedIndex.toString();
}

const cluster = "mainnet-beta";

const initState: {
  loading: boolean;
  creatingStakeAccount: boolean;
  seed: string;
  stakeAccounts: StakeAccountMeta[] | null;
  selectedStakeAccount: string | null;
  validatorMetas: ValidatorMeta[] | null;
  filteredValidatorMetas: ValidatorMeta[] | null;
  selectedDelegate: string | null;
  voteAccountInfos: VoteAccountInfo[];
  validatorInfos: ValidatorInfo[];
  validatorScores: ValidatorScore[];
  validatorApys: ValidatorApy[];
  totalActivatedStake: number;
} = {
  loading: false,
  creatingStakeAccount: false,
  seed: "0",
  stakeAccounts: [],
  validatorMetas: [],
  filteredValidatorMetas: [],
  selectedStakeAccount: null,
  selectedDelegate: "",
  voteAccountInfos: [],
  validatorInfos: [],
  validatorScores: [],
  validatorApys: [],
  totalActivatedStake: 0,
};

type StakeViewAction =
  | { type: "loading"; payload?: { loading: boolean } }
  | {
      type: "creatingStakeAccount";
      payload?: { creatingStakeAccount: boolean };
    }
  | { type: "seed"; payload?: { seed: string } }
  | {
      type: "stakeAccounts";
      payload?: { stakeAccounts: StakeAccountMeta[] };
    }
  | {
      type: "selectedStakeAccount";
      payload?: { selectedStakeAccount: string | null };
    }
  | {
      type: "validatorMetas";
      payload?: { validatorMetas: ValidatorMeta[] };
    }
  | {
      type: "validatorInfos";
      payload?: { validatorInfos: ValidatorInfo[] };
    }
  | {
      type: "voteAccountInfos";
      payload?: { voteAccountInfos: VoteAccountInfo[] };
    }
  | {
      type: "validatorScores";
      payload?: { validatorScores: ValidatorScore[] };
    }
  | {
      type: "validatorApys";
      payload?: { validatorApys: ValidatorApy[] };
    }
  | {
      type: "totalActivatedStake";
      payload?: { totalActivatedStake: number };
    }
  | {
      type: "filteredValidatorMetas";
      payload?: { filteredValidatorMetas: ValidatorMeta[] };
    }
  | {
      type: "selectedDelegate";
      payload?: { selectedDelegate: string };
    };

const reducer = (state: typeof initState, action: StakeViewAction) => {
  const { payload, type } = action;
  switch (type) {
    case "loading":
      return { ...state, loading: payload.loading };
    case "seed":
      return { ...state, seed: payload.seed };
    case "stakeAccounts":
      return { ...state, stakeAccounts: payload.stakeAccounts };
    case "creatingStakeAccount":
      return { ...state, creatingStakeAccount: payload.creatingStakeAccount };
    case "selectedDelegate":
      return { ...state, selectedDelegate: payload.selectedDelegate };
    case "selectedStakeAccount":
      return { ...state, selectedStakeAccount: payload.selectedStakeAccount };
    case "totalActivatedStake":
      return { ...state, totalActivatedStake: payload.totalActivatedStake };
    case "validatorApys":
      return { ...state, validatorApys: payload.validatorApys };
    case "validatorScores":
      return { ...state, validatorScores: payload.validatorScores };
    case "validatorInfos":
      return { ...state, validatorInfos: payload.validatorInfos };
    case "voteAccountInfos":
      return { ...state, voteAccountInfos: payload.voteAccountInfos };
  case "validatorMetas":
      return { ...state, validatorMetas: payload.validatorMetas };
    case "filteredValidatorMetas":
      return {
        ...state,
        filteredValidatorMetas: payload.filteredValidatorMetas,
      };
    default:
      // console.log(action.type);
      throw new Error("unsupported action type given on StakeReducer reducer");
  }
};

function StakeView() {
  const [selectedValidator, setSelectedValidator] = useState<
    string | undefined
  >();
  const { register, watch } = useForm();
  const { connection } = useConnection();
  const { publicKey, connected } = useWallet();
  const { setAlertState } = useAlert();
  const { manualPublicKey } = useContext(AccountsContext);
  const [isAdding, setIsAdding] = useState(false);
  const [isDelegating, setIsDelegating] = useState<boolean>(false);
  const { solBalance } = useBalance();
  const stakeAmount = watch("stakeAmount", 0);
  const maxCommission = watch("maxCommission", "");
  const searchCriteria = watch("searchCriteria", "");
  const [state, dispatch] = useReducer(reducer, initState);
  const {
    voteAccountInfos,
    validatorInfos,
    validatorScores,
    validatorApys,
    totalActivatedStake,
  } = state;

  const handleDelegate = useCallback(async () => {
    const selectedDelegate = state.validatorMetas.find(
      (m) => m.validatorInfo.key.toBase58() === state.selectedDelegate
    );
    const transaction = StakeProgram.delegate({
      stakePubkey: toPublicKey(state.selectedStakeAccount),
      authorizedPubkey: publicKey,
      votePubkey: toPublicKey(selectedDelegate?.voteAccountInfo?.votePubkey),
    });
    transaction.feePayer = publicKey;
    transaction.recentBlockhash = (
      await getBlockhashWithRetries(connection)
    ).blockhash;
    await connection.sendRawTransaction(transaction.serialize());
  }, [connection, state.selectedDelegate, state.selectedStakeAccount]);

  useEffect(() => {
    if (!connected) {
      return;
    }
    getValidatorInfos(connection).then((validatorInfos) => {
      console.log(`validatorInfos.length: ${validatorInfos.length}`);
      dispatch({
        type: "validatorInfos",
        payload: { validatorInfos },
      });
    });
  }, [connection, connected]);

  useEffect(() => {
    if (!connected) {
      return;
    }
    getValidatorScores(cluster).then((validatorScores) =>
      dispatch({ type: "validatorScores", payload: { validatorScores } })
    );
  }, [connected, cluster]);

  useEffect(() => {
    if (cluster !== "mainnet-beta") {
      dispatch({ type: "validatorApys", payload: { validatorApys: [] } });
      return;
    }
    getStakeviewApys().then((validatorApys) =>
      dispatch({ type: "validatorApys", payload: { validatorApys } })
    );
  }, [cluster]);

  const createStakeAccount = useCallback(
    async (amount) => {
      if (!publicKey) {
        return;
      }
      setAlertState({
        message: (
          <>
            <button className="btn btn-ghost loading">
              {" "}
              Creating stake account...
            </button>
          </>
        ),
      });
      dispatch({
        type: "creatingStakeAccount",
        payload: { creatingStakeAccount: true },
      });
      try {
        const stakePubkey = await PublicKey.createWithSeed(
          publicKey,
          state.seed,
          StakeProgram.programId
        );

        const lamports = new BN(amount)
          .multipliedBy(LAMPORTS_PER_SOL)
          .toNumber();
        const transaction = StakeProgram.createAccountWithSeed({
          fromPubkey: publicKey,
          stakePubkey,
          basePubkey: publicKey,
          seed: state.seed,
          authorized: new Authorized(publicKey, publicKey),
          lamports,
        });

        const newStakeAccountPubkey = await PublicKey.createWithSeed(
          publicKey,
          state.seed,
          STAKE_PROGRAM_ID
        );
        transaction.feePayer = publicKey;
        transaction.recentBlockhash = (
          await getBlockhashWithRetries(connection)
        ).blockhash;
        await connection.sendRawTransaction(transaction.serialize());
        addStakeAccount(newStakeAccountPubkey, state.seed);
        setAlertState({
          duration: 3000,
          message: "Stake account added!",
          severity: "success",
        });
      } catch (e) {
        dispatch({
          type: "creatingStakeAccount",
          payload: { creatingStakeAccount: false },
        });
        setAlertState({
          duration: 10000,
          message: "An Error occured",
          severity: "error",
        });
      }
    },
    [publicKey, state.seed, connection]
  );

  useEffect(() => {
    if (!connected) {
      return;
    }
    connection.getVoteAccounts().then((voteAccountStatus) => {
      const activatedStake = voteAccountStatus.current
        .concat(voteAccountStatus.delinquent)
        .reduce((sum, current) => sum + current.activatedStake, 0);
      console.log("totalActivatedStake", activatedStake);
      dispatch({
        type: "totalActivatedStake",
        payload: { totalActivatedStake: activatedStake },
      });
      dispatch({
        type: "voteAccountInfos",
        payload: { voteAccountInfos: voteAccountStatus.current },
      });
    });
  }, [connection, connected]);

  // Yield first seed sequentially from unused seeds
  useEffect(() => {
    if (!state.stakeAccounts || !publicKey) {
      return;
    }

    findFirstAvailableSeed(publicKey, state.stakeAccounts).then((seed) =>
      dispatch({ type: "seed", payload: { seed } })
    );
  }, [publicKey, state.stakeAccounts]);

  useEffect(() => {
    dispatch({ type: "stakeAccounts", payload: { stakeAccounts: null } });
    const newPublicKey = connected ? publicKey : manualPublicKey;
    if (newPublicKey) {
      dispatch({ type: "loading", payload: { loading: true } });

      findStakeAccountMetas(connection, newPublicKey)
        .then((stakeAccounts) =>
          dispatch({ type: "stakeAccounts", payload: { stakeAccounts } })
        )
        .then((res) =>
          dispatch({ type: "loading", payload: { loading: false } })
        );
    }
  }, [connection, connected, publicKey, manualPublicKey]);

  useEffect(() => {
    (async () => {
      const subscriptionId = connection.onProgramAccountChange(
        STAKE_PROGRAM_ID,
        async (keyedAccountInfo, context) => {
          const updatedStakeAccounts = await onStakeAccountChangeCallback(
            connection,
            keyedAccountInfo,
            context,
            state.stakeAccounts,
            publicKey
          );
          if (updatedStakeAccounts) {
            dispatch({
              type: "stakeAccounts",
              payload: { stakeAccounts: updatedStakeAccounts },
            });
          }
        },
        connection.commitment,
        [
          {
            memcmp: {
              offset: 12,
              bytes: publicKey?.toBase58(),
            },
          },
        ]
      );

      return () => {
        console.log("removeProgramAccountChangeListener");
        connection.removeProgramAccountChangeListener(subscriptionId);
      };
    })();
  }, [connection, publicKey]);

  const addStakeAccount = useCallback(
    async (stakeAccountPublicKey: PublicKey, seed: string) => {
      if (!state.stakeAccounts) {
        return;
      }
      let newStakeAccounts = [...state.stakeAccounts];

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
    },
    [publicKey]
  );

  // Batched validator meta building
  // Order is VoteAccountInfo[] order, until validatorScores is available
  // VoteAccountInfo with no available score go at the bottom of the list
  useAsyncAbortable(
    async (abortSignal) => {
      const validatorMetas = await validatorBatcher(
        voteAccountInfos,
        validatorInfos,
        validatorScores,
        validatorApys,
        (validatorMetas) =>
          dispatch({ type: "validatorMetas", payload: { validatorMetas } }),
        abortSignal
      );
      if (validatorMetas) {
        dispatch({ type: "validatorMetas", payload: { validatorMetas } });
      }
    },
    [voteAccountInfos, validatorInfos, validatorScores]
  );
  useEffect(() => {
    const filteredValidatorMetas = state.validatorMetas
      .filter((meta) => {
        const votePubkeyMatches = searchCriteria
          ? meta.voteAccountInfo.votePubkey.includes(searchCriteria)
          : true;
        const nameMatches = searchCriteria
          ? meta.validatorInfo?.info.name
              .toLowerCase()
              .includes(searchCriteria.toLowerCase())
          : true;

        return (
          meta.voteAccountInfo.commission <= +maxCommission &&
          (votePubkeyMatches || nameMatches)
        );
      })
      .filter((meta) => !!meta?.validatorInfo?.key);
    dispatch({
      type: "filteredValidatorMetas",
      payload: { filteredValidatorMetas },
    });
  }, [state.validatorMetas, maxCommission, searchCriteria]);

  const selectedValidatorName = useMemo(() => {
    return state.validatorMetas.find(
      (meta) =>
        !!state.selectedDelegate &&
        !!meta.validatorInfo?.key &&
        toPublicKey(meta.validatorInfo?.key).equals(
          toPublicKey(state.selectedDelegate)
        )
    )?.validatorInfo?.info?.name;
  }, [state.validatorMetas, state.selectedDelegate]);

  const handleCardSelect = ({ validatorKey, meta }) => {
    setSelectedValidator(validatorKey);
    dispatch({
      type: "selectedDelegate",
      payload: { selectedDelegate: meta },
    });
  };

  const firstHundred = useMemo(() => {
    return state.filteredValidatorMetas.slice(0, 100).map((meta) => {
      const validatorKey = meta.validatorInfo.key.toBase58();
      return (
        <ValidatorCard
          key={meta?.voteAccountInfo?.votePubkey}
          {...{
            handleCardSelect,
            meta,
            isDelegating,
            selectedValidator,
            validatorKey,
          }}
        />
      );
    });
  }, [
    state.filteredValidatorMetas,
    searchCriteria,
    selectedValidator,
    setSelectedValidator,
    isDelegating,
  ]);

  const handleDelegationClick = useCallback(
    (accountAddress: string) => {
      if (isDelegating) {
        setIsDelegating(false);
        dispatch({
          type: "selectedStakeAccount",
          payload: { selectedStakeAccount: null },
        });
        return;
      }
      setIsDelegating(true);
      dispatch({
        type: "selectedStakeAccount",
        payload: { selectedStakeAccount: accountAddress },
      });
    },
    [isDelegating]
  );

  return (
    <>
      <Head>
        <title>🛠️ Pentacle Tools - 🪙 Validator Staking</title>
      </Head>
      <h2 className="text-3xl text-center text-white">
        SOL Validator Staking
        {/* {connected && (
          <button
            className="absolute top-0 right-0 btn btn-sm"
            onClick={() => setIsAdding(!isAdding)}
          >
            Add Stake account
          </button>
        )} */}
        {isAdding && (
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
        )}
      </h2>
      <hr className="my-4 opacity-10" />
      {state.loading && (
        <div className="w-full text-center">
          <button className="mt-4 btn btn-ghost loading"></button>
        </div>
      )}
      <div className="mb-6 w-full text-center">
        <span className="inline-block mx-auto">
          <WalletMultiButton />
        </span>
      </div>
      {!state.loading && !state.stakeAccounts?.length && connected && (
        <div className="w-full text-center">
          <span className="text-xl">You do not have any stake accounts</span>
        </div>
      )}
      {state.stakeAccounts?.length && (
        <div className="grid gap-3 lg:grid-cols-2">
          {state.stakeAccounts?.map((account) => (
            <StakeDelegationCard
              key={account.address.toBase58()}
              {...{
                account,
                isDelegating,
                delegatingStakeAccount: state?.selectedStakeAccount,
                handleDelegate,
                handleDelegationClick,
                selectedDelegate: state.selectedDelegate,
                selectedValidatorName,
              }}
            />
          ))}
        </div>
      )}

      <hr className="my-4 opacity-10" />
      {connected && (
        <>
          <h2 className="relative mt-6 mb-3 text-2xl text-center">
            Validators
          </h2>
          <div className="text-center">
            Total: {state.validatorMetas.length} active Validators and{" "}
            {Math.round(
              state.totalActivatedStake / LAMPORTS_PER_SOL / 1_000_000
            )}
            M SOL staked <br />
            {state.filteredValidatorMetas.length} with this search criteria
            <br />
            Showing first 100
          </div>
          <br />
          <div>
            <div className="grid gap-6 my-6 w-full md:grid-cols-2">
              <div className="flex gap-3 items-center">
                <SearchIcon width={32} height={32} />
                <input
                  {...register("searchCriteria")}
                  type="text"
                  className="flex-1 input"
                />
              </div>
              <div className="flex flex-col gap-3 items-center">
                <label>Max Commission: {maxCommission}% </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  defaultValue={100}
                  className="range range-sm"
                  {...register("maxCommission")}
                  step="1"
                />
              </div>
            </div>

            <div className="grid gap-2 lg:grid-cols-2">{firstHundred}</div>
          </div>
        </>
      )}
    </>
  );
}

const Wrapped = () => (
  <BalanceProvider>
    <AccountsProvider>
      <StakeView />
    </AccountsProvider>
  </BalanceProvider>
);
export default Wrapped;
