import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, AccountInfo, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useEffect, useMemo, useState } from "react";
import { STAKE_PROGRAM_ID } from "../util/stake-account";

import React from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

function StakeView() {
    const [stakeAccounts, setStakeAccounts] = useState<
        | {
            pubkey: PublicKey;
            account: AccountInfo<Buffer>;
        }[]
        | null
    >(null);
    const [loading, setLoading] = useState(false);
    const { connection } = useConnection();
    const { publicKey } = useWallet();

    useEffect(() => {
        (async () => {
            if (publicKey) {
                setLoading(true);
                const fetchedAccounts = await connection.getProgramAccounts(
                    STAKE_PROGRAM_ID,
                    {
                        filters: [
                            { dataSize: 200 },
                            {
                                memcmp: { offset: 12, bytes: publicKey.toBase58() },
                            },
                        ],
                    }
                );
                setStakeAccounts(fetchedAccounts);
                setLoading(false);
            }
        })();
    }, [connection, publicKey]);

    return (
        <>
            <div className="w-full text-center">
                <WalletMultiButton />
            </div>
            <hr className="my-4 opacity-10" />
            <h2 className="text-2xl text-center">SOL Stake Accounts</h2>
            <hr className="my-4 opacity-10" />
            {loading && (
                <div className="w-full text-center">
                    <button className="mt-4 btn btn-ghost loading"></button>
                </div>
            )}
            {!loading && !stakeAccounts && (
                <div className="w-full text-center">
                    <span className="text-xl">You do not have any stake accounts</span>
                </div>
            )}
            {stakeAccounts?.length &&
                stakeAccounts.map((account) => (
                    <>
                        <div className="card bg-neutral">
                            <div className="card-body">
                                <div className="card-title">{account.pubkey.toBase58()}</div>
                                <p>Stake: {account.account.lamports / LAMPORTS_PER_SOL} SOL</p>
                            </div>
                        </div>
                    </>
                ))}
        </>
    );
}

// const Wrapped = () => (
//     <AccountsProvider>
//         <StakeView />
//     </AccountsProvider>
// );
export default StakeView;
