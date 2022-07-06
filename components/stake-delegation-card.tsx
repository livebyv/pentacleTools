import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useMemo } from "react";
import { shortenAddress } from "../util/shorten-address";
import { StakeAccountMeta } from "../util/stake-account";
import { ValidatorMeta } from "../util/validator-batcher";
import { InfoIcon } from "./icons";

export function StakeDelegationCard({
  account,
  isDelegating,
  delegatingStakeAccount,
  handleDelegationClick,
  handleDelegate,
  selectedValidatorName,
  selectedDelegate,
}: {
  account: StakeAccountMeta;
  isDelegating: boolean;
  delegatingStakeAccount: string;
  handleDelegationClick: any;
  selectedValidatorName: string;
  selectedDelegate: string;
  handleDelegate: any;
}) {
  const accountAddress = useMemo(
    () => account?.address?.toBase58(),
    [account?.address]
  );
  const delegationAddress = useMemo(
    () => account.stakeAccount.info.stake?.delegation?.voter.toBase58(),
    [account.stakeAccount.info.stake?.delegation?.voter]
  );
  const shortedAddress = useMemo(
    () => shortenAddress(accountAddress, 10),
    [accountAddress]
  );
  const delegation = account.stakeAccount.info?.stake?.delegation;

  return (
    <div
      key={accountAddress}
      className={`card ${
        delegatingStakeAccount === accountAddress ? "bg-primary" : "bg-neutral"
      } ${!!delegation ? "border border-primary" : ""}`}
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
        <div className="card-title">{shortedAddress}</div>
        <p>
          <span className="mr-3 badge badge-outline">Stake</span>
          {account.lamports / LAMPORTS_PER_SOL} SOL
        </p>
        {!!delegationAddress && (
          <span>
            <a
              href={`https://solscan.io/account/${delegationAddress}`}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex justify-center items-center cursor-pointer"
            >
              <span className="mr-3 badge badge-outline">Delegation</span>
            {delegationAddress}
            </a>
          </span>
        )}
        {/* {!delegation && (
          <div className="card-actions">
            <button
              onClick={handleDelegationClick}
              className={`btn ${isDelegating ? "":"btn-primary"} btn-sm`}
            >
              {isDelegating ? "Cancel" : "Delegate"}
            </button>
          </div>
        )} */}
        {delegatingStakeAccount === accountAddress &&
          !selectedDelegate &&
          isDelegating && (
            <div className="absolute right-6 bottom-6">
              <div className="shadow-lg alert">
                <div>
                  <InfoIcon width={48} height={48}></InfoIcon>
                  {<strong>Select a validator from the list!</strong>}
                </div>
              </div>{" "}
            </div>
          )}
        {delegatingStakeAccount === accountAddress &&
          selectedDelegate &&
          isDelegating && (
            <div className="absolute right-6 bottom-6">
              <button onClick={handleDelegate} className="btn">
                Delegate to {selectedValidatorName}
              </button>
            </div>
          )}
      </div>
    </div>
  );
}
