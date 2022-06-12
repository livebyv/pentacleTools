import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  PublicKey,
  AccountInfo,
  LAMPORTS_PER_SOL,
  Connection,
  KeyedAccountInfo,
  Context,
  ParsedAccountData,
  Authorized,
  StakeProgram,
  ValidatorInfo,
  VoteAccountInfo,
} from "@solana/web3.js";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
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
import {
  ValidatorsContext,
  ValidatorsProvider,
} from "../contexts/ValidatorsProvider";
import { ValidatorApy } from "../util/stakeviewApp";
import { useAsyncAbortable } from "react-async-hook";
import { ValidatorScore } from "../util/validatorsApp";
import { shortenAddress } from "../util/shorten-address";
import { useRouter } from "next/router";
import { LinkIcon, SearchIcon } from "../components/icons";
import { ExplorerLink } from "../components/explorer-link";

interface ValidatorMeta {
  voteAccountInfo: VoteAccountInfo;
  validatorInfo: ValidatorInfo | undefined;
  validatorScore: ValidatorScore | undefined;
  validatorApy: ValidatorApy | undefined;
}

const BATCH_SIZE = 100;

async function batchMatcher(
  voteAccountStatus: VoteAccountInfo[],
  validatorInfos: ValidatorInfo[],
  validatorScores: ValidatorScore[],
  validatorApys: ValidatorApy[],
  onValidatorMetas: (metas: ValidatorMeta[]) => void,
  abortSignal: AbortSignal
) {
  let validatorMetas: ValidatorMeta[] = [];
  let remainingVoteAccountInfos = [...voteAccountStatus];
  let remainingValidatorInfos = [...validatorInfos];
  let remainingValidatorApys = [...validatorApys];

  console.log("scores", validatorScores.length);

  for (let i = 0; i < validatorScores.length; i++) {
    const validatorScore = validatorScores[i];
    const voteAccountIndex = remainingVoteAccountInfos.findIndex(
      (info) => info.nodePubkey === validatorScore.account
    );
    if (voteAccountIndex < 0) {
      // If score does not match anything then it goes into the no score bucket
      continue;
    }
    const [voteAccountInfo] = remainingVoteAccountInfos.splice(
      voteAccountIndex,
      1
    );

    const validatorInfoIndex = remainingValidatorInfos.findIndex(
      (validatorInfo) =>
        validatorInfo.key.equals(new PublicKey(voteAccountInfo.nodePubkey))
    );
    let validatorInfo: ValidatorInfo | undefined;
    [validatorInfo] =
      validatorInfoIndex > -1
        ? remainingValidatorInfos.splice(validatorInfoIndex, 1)
        : [];

    const validatorApyIndex = remainingValidatorApys.findIndex(
      (validatorApy) => validatorApy.id === voteAccountInfo.nodePubkey
    );
    let validatorApy: ValidatorApy | undefined;
    [validatorApy] =
      validatorApyIndex > -1
        ? remainingValidatorApys.splice(validatorApyIndex, 1)
        : [];

    validatorMetas.push({
      voteAccountInfo,
      validatorInfo,
      validatorScore,
      validatorApy,
    });

    if (i % BATCH_SIZE === 0) {
      await sleep(1);
      console.log(`batch index: ${i}`);
      onValidatorMetas([...validatorMetas]);
    }

    if (abortSignal.aborted) {
      return;
    }
  }

  for (let i = 0; i < remainingVoteAccountInfos.length; i++) {
    const voteAccountInfo = remainingVoteAccountInfos[i];

    const validatorInfoIndex = remainingValidatorInfos.findIndex(
      (validatorInfo) =>
        validatorInfo.key.equals(new PublicKey(voteAccountInfo.nodePubkey))
    );
    let validatorInfo: ValidatorInfo | undefined;
    [validatorInfo] =
      validatorInfoIndex > -1
        ? remainingValidatorInfos.splice(validatorInfoIndex, 1)
        : [];

    const validatorApyIndex = remainingValidatorApys.findIndex(
      (validatorApy) => validatorApy.id === voteAccountInfo.nodePubkey
    );
    let validatorApy: ValidatorApy | undefined;
    [validatorApy] =
      validatorApyIndex > -1
        ? remainingValidatorApys.splice(validatorApyIndex, 1)
        : [];

    validatorMetas.push({
      voteAccountInfo,
      validatorInfo,
      validatorScore: undefined,
      validatorApy,
    });

    if (i % BATCH_SIZE === 0) {
      await sleep(1);
      console.log(`batch index: ${i}`);
      onValidatorMetas([...validatorMetas]);
    }

    if (abortSignal.aborted) {
      return;
    }
  }
  return validatorMetas;
}

async function findFirstAvailableSeed(
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

async function onStakeAccountChangeCallback(
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

const ValidatorList = () => {
  const { register, watch, handleSubmit } = useForm();
  const [validatorMetas, setValidatorMetas] = useState<ValidatorMeta[]>([]);
  const [filteredValidatorMetas, setFilteredValidatorMetas] = useState<
    ValidatorMeta[]
  >([]);

  const maxComission = watch("maxCommission", "");
  const searchCriteria = watch("searchCriteria", "");

  const {
    voteAccountInfos,
    validatorInfos,
    validatorScores,
    validatorApys,
    totalActivatedStake,
  } = useContext(ValidatorsContext);

  // Batched validator meta building
  // Order is VoteAccountInfo[] order, until validatorScores is available
  // VoteAccountInfo with no available score go at the bottom of the list
  useAsyncAbortable(
    async (abortSignal) => {
      const validatorMetas = await batchMatcher(
        voteAccountInfos,
        validatorInfos,
        validatorScores,
        validatorApys,
        (validatorMetas) => setValidatorMetas(validatorMetas),
        abortSignal
      );
      if (validatorMetas) {
        setValidatorMetas(validatorMetas);
      }
    },
    [voteAccountInfos, validatorInfos, validatorScores]
  );
  useEffect(() => {
    setFilteredValidatorMetas(
      validatorMetas
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
            meta.voteAccountInfo.commission <= +maxComission &&
            (votePubkeyMatches || nameMatches)
          );
        })
        .filter((meta) => !!meta?.validatorInfo?.key)
    );
  }, [validatorMetas, maxComission, searchCriteria]);

  const [selectedValidator, setSelectedValidator] = useState<
    PublicKey | undefined
  >();

  const firstHundred = useMemo(() => {
    return filteredValidatorMetas.slice(0, 100).map((meta) => (
      <div
        key={meta?.voteAccountInfo?.votePubkey}
        className="border border-gray-600 card"
      >
        <div
          className="card-body"
          onClick={() => setSelectedValidator(meta.validatorInfo.key)}
        >
          <h3 className="text-2xl">{meta?.validatorInfo?.info?.name}</h3>
          <hr className="opacity-10" />

          <h3 className="text-lg">
            <span className="badge">
              {" "}
              Identity{" "}
              <a
                href={`https://solscan.io/account/${meta.validatorInfo?.key.toBase58()}`}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex justify-center items-center ml-2 cursor-pointer"
              >
                <LinkIcon width={16} height={16} />
              </a>
            </span>
            {meta.validatorInfo?.key.toBase58()}
          </h3>
          <hr className="opacity-10" />

          <h3 className="text-lg">
            <span className="badge">
              Vote Account
              <a
                href={`https://solscan.io/account/${meta?.voteAccountInfo?.votePubkey}`}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex justify-center items-center ml-2 cursor-pointer"
              >
                <LinkIcon width={16} height={16} />
              </a>
            </span>

            {meta?.voteAccountInfo?.votePubkey}
          </h3>
        </div>
      </div>
    ));
  }, [filteredValidatorMetas, searchCriteria]);

  return (
    <>
      <h2 className="relative mt-6 mb-3 text-2xl text-center">Validators</h2>
      <div className="text-center">
        Total: {filteredValidatorMetas.length} active Validators with this
        search criteria
      </div>
      <br />
      <form className="" onSubmit={handleSubmit((res) => {})}>
        <div className="grid grid-cols-2 gap-6 my-6 w-full">
          <div className="flex gap-3 items-center">
            <SearchIcon width={32} height={32} />
            <input
              {...register("searchCriteria")}
              type="text"
              className="flex-1 input"
            />
          </div>
          <div className="flex flex-col gap-3 items-center">
            <label>Max Commission: {maxComission}% </label>
            <input
              type="range"
              min="0"
              max="100"
              defaultValue={7}
              className="range range-sm"
              {...register("maxCommission")}
              step="1"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">{firstHundred}</div>
      </form>
    </>
  );
};

function StakeView() {
  const { register, handleSubmit, watch } = useForm();
  const [stakeAccounts, setStakeAccounts] = useState<StakeAccountMeta[] | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const { connection } = useConnection();
  const { publicKey, connected } = useWallet();
  const [seed, setSeed] = useState("0");
  const { manualPublicKey } = useContext(AccountsContext);
  const [isAdding, setIsAdding] = useState(false);
  const [userBalance, setUserBalance] = useState<string | undefined>();
  const [createLoading, setCreateLoading] = useState(false);
  const { setAlertState } = useAlert();
  const [validatorMetas, setValidatorMetas] = useState<ValidatorMeta[]>([]);
  const [filteredValidatorMetas, setFilteredValidatorMetas] = useState<
    ValidatorMeta[]
  >([]);
  const [selectedIndex, setSelectedIndex] = useState<number>();
  const router = useRouter();
  const {
    query: { validator },
  } = router;
  const stakeAmount = watch("stakeAmount", 0);

  useEffect(() => {
    if (
      selectedIndex !== undefined &&
      selectedIndex >= filteredValidatorMetas.length
    ) {
      setSelectedIndex(undefined);
    }
  }, [filteredValidatorMetas, selectedIndex]);

  // Yield first seed sequentially from unused seeds
  useEffect(() => {
    if (!stakeAccounts || !publicKey) {
      return;
    }

    findFirstAvailableSeed(publicKey, stakeAccounts).then(setSeed);
  }, [publicKey, stakeAccounts]);
  useEffect(() => {
    setStakeAccounts(null);
    const newPublicKey = connected ? publicKey : manualPublicKey;
    if (newPublicKey) {
      setLoading(true);
      Promise.all([
        connection
          .getBalance(publicKey)
          .then((res) => setUserBalance((res / LAMPORTS_PER_SOL).toFixed(4))),
        findStakeAccountMetas(connection, newPublicKey).then(setStakeAccounts),
      ]).then((res) => setLoading(false));
    }
  }, [connection, connected, publicKey, manualPublicKey]);

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
      setCreateLoading(true);
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
          seed,
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
        addStakeAccount(newStakeAccountPubkey, seed);

        // const transaction = StakeProgram.delegate({
        //   stakePubkey,
        //   authorizedPubkey: publicKey,
        //   votePubkey: new PublicKey(
        //     filteredValidatorMetas[selectedIndex].voteAccountInfo.votePubkey
        //   ),
        // });

        setAlertState({
          duration: 3000,
          message: "Stake account added!",
          severity: "success",
        });
      } catch (e) {
        setCreateLoading(false);
        setAlertState({
          duration: 10000,
          message: "An Error occured",
          severity: "error",
        });
      }
    },
    [publicKey, seed, connection]
  );

  useEffect(() => {
    (async () => {
      const subscriptionId = connection.onProgramAccountChange(
        STAKE_PROGRAM_ID,
        async (keyedAccountInfo, context) => {
          const updatedStakeAccounts = await onStakeAccountChangeCallback(
            connection,
            keyedAccountInfo,
            context,
            stakeAccounts,
            publicKey
          );
          if (updatedStakeAccounts) {
            setStakeAccounts(updatedStakeAccounts);
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
      if (!stakeAccounts) {
        return;
      }
      let newStakeAccounts = [...stakeAccounts];

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
      setStakeAccounts(newStakeAccounts);
    },
    [publicKey]
  );

  useEffect(() => {
    if (validator) {
      //   setSearchCriteria(validator as string);
      setSelectedIndex(0);
    }
  }, [validator]);

  return (
    <>
      <hr className="my-4 opacity-10" />
      <h2 className="relative text-2xl text-center">
        SOL Validator Staking{" "}
        {/* <button
          className="absolute right-0 z-50 btn btn-xs btn-primary"
          onClick={() => setIsAdding(!isAdding)}
        >
          Add Stake Account
        </button>{" "} */}
        {isAdding && (
          <form
            onSubmit={handleSubmit(({ stakeAmount }) => {
              createStakeAccount(+stakeAmount);
            })}
            className="flex absolute right-0 top-8 z-40 flex-col px-4 py-2 rounded border shadow border-slate-800 bg-neutral"
          >
            <input
              {...register("stakeAmount")}
              className="input"
              type="number"
              min={0}
              step={1 / LAMPORTS_PER_SOL}
              max={+userBalance - 0.003}
            />
            <span className="mt-3">SOL</span>
            <button
              className="btn btn-primary btn-sm"
              disabled={!stakeAmount}
              onClick={createStakeAccount}
            >
              Create
            </button>
          </form>
        )}
      </h2>
      <hr className="my-4 opacity-10" />
      {loading && (
        <div className="w-full text-center">
          <button className="mt-4 btn btn-ghost loading"></button>
        </div>
      )}
      <div className="w-full text-center">
        <WalletMultiButton />
      </div>
      {!loading && !stakeAccounts && connected && (
        <div className="w-full text-center">
          <span className="text-xl">You do not have any stake accounts</span>
        </div>
      )}
      {stakeAccounts?.length && (
        <div className="grid gap-3 lg:grid-cols-2">
          {stakeAccounts.map((account) => {
            const delegation = account.stakeAccount.info?.stake?.delegation;
            return (
              <>
                <div
                  key={account.address.toBase58()}
                  className={`card bg-neutral ${
                    !!delegation ? "border border-primary" : ""}`}
                >
                  <div className="relative card-body">
                    {!!delegation && (
                      <span className="absolute top-4 right-4 badge badge-primary">
                        Active
                      </span>
                    )}
                    {!delegation && (
                      <span className="absolute top-4 right-4 badge badge-outline">
                        Inactive
                      </span>
                    )}
                    <div className="card-title">
                      {shortenAddress(account.address.toBase58(), 6)}
                    </div>
                    <p>Stake: {account.lamports / LAMPORTS_PER_SOL} SOL</p>
                    {account.stakeAccount.info.stake?.delegation?.voter.toBase58()}
                  </div>
                </div>
              </>
            );
          })}
        </div>
      )}
      <hr className="my-4 opacity-10" />
      {connected && <ValidatorList />}
    </>
  );
}

const Wrapped = () => (
  <ValidatorsProvider>
    <AccountsProvider>
      <StakeView />
    </AccountsProvider>
  </ValidatorsProvider>
);
export default Wrapped;
