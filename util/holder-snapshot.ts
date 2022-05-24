import { Connection, ParsedAccountData, PublicKey } from "@solana/web3.js";
import { from, lastValueFrom } from "rxjs";
import { mergeMap } from "rxjs/operators";

export async function getOwners(
  mints: string[],
  connection: Connection,
  setCounter
) {
  let counter = 1;
  let all_owners = {};
  const mints_obs = from(mints).pipe(
    mergeMap(async (mint) => {
      const token_account = (
        await connection.getTokenLargestAccounts(new PublicKey(mint))
      )?.value[0]?.address;
      if (token_account) {
        const token_account_info = await connection.getParsedAccountInfo(
          token_account
        );
        return {
          owner: (token_account_info?.value?.data as ParsedAccountData)?.parsed
            ?.info?.owner,
          mint: mint,
        };
      }
    }, 10),
  );
  mints_obs.subscribe((res) => {
    if (res) {
      const { owner, mint } = res;
      if (!all_owners[owner]) {
        all_owners[owner] = {
          mints: [mint],
          amount: 1,
        };
      } else {
        all_owners[owner].mints.push(mint);
        all_owners[owner].amount++;
      }
      setCounter(counter++);
    }
  });
  if (await lastValueFrom(mints_obs)) {
    console.log(Object.keys(all_owners).length);
    return all_owners;
  }
}
