import { Connection, ParsedAccountData } from "@solana/web3.js";
import { from, lastValueFrom } from "rxjs";
import { mergeMap } from "rxjs/operators";
import { toPublicKey } from "./to-publickey";

const CONCURRENCY = 1;

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
        await connection.getTokenLargestAccounts(toPublicKey(mint))
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
    }, CONCURRENCY),
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
    return all_owners;
  }
}
