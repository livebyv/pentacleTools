import { Connection, ParsedAccountData, PublicKey } from "@solana/web3.js";
import { from, lastValueFrom } from "rxjs";
import { mergeMap, retry } from "rxjs/operators";

export async function getOwners(
  mints: string[],
  connection: Connection,
  setCounter
) {
  let all_owners = [];
  const mints_obs = from(mints).pipe(
    mergeMap(async (mint) => {
      const token_account = (
        await connection.getTokenLargestAccounts(new PublicKey(mint))
      ).value[0].address;
      const token_account_info = await connection.getParsedAccountInfo(
        token_account
      );
      return (token_account_info?.value?.data as ParsedAccountData)?.parsed?.info?.owner;
    }, 10),
    retry(5)
  );
  mints_obs.subscribe((e) => {
    if (!(e in all_owners)) {
      all_owners.push(e);
      setCounter(all_owners.length);
    }
  });
  if (await lastValueFrom(mints_obs)) {
    console.log(all_owners.length);
    return all_owners;
  }
}
