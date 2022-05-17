import { ConfirmedSignatureInfo, Connection, PublicKey } from "@solana/web3.js";
import { from, mergeMap, toArray } from "rxjs";
import { download } from "./download";
import jsonFormat from "json-format";
import { sleep } from "@bundlr-network/client/build/common/utils";

export const getMints = async (
  creatorId: string,
  connection: Connection,
  setCounter: (nr: number) => void,
  wlToken
) => {
  let start = Date.now();
  let before;
  const allTxs = new Map();
  const txs = new Map();
  const mints = new Set();
  let done = false;
  let tries = 0;
  const maxtries = 30;
  let sameHashTries = 0;

  while (!done) {
    let resolvedTxs: ConfirmedSignatureInfo[];

    if (tries >= maxtries) {
      console.log("breaking..");
      break;
    }
    try {
      resolvedTxs = await connection.getSignaturesForAddress(
        new PublicKey(creatorId),
        { before: before, limit: 1000 }
      );
      console.log({ tries, resolvedTxs: resolvedTxs.length });
      resolvedTxs
        .filter((tx) => !tx?.err)
        .forEach((tx) => allTxs.set(tx.signature, tx));
      if (!resolvedTxs.length) {
        tries++;
        await sleep(500);
      } else {
        const newBefore = resolvedTxs[resolvedTxs.length - 1];
        tries = 0;
        console.log(`
        seconds since start: ${(Date.now() - start.valueOf()) / 1000}
        current blocktime: ${new Date(newBefore.blockTime * 1000)}
        `);
        console.log({ new: newBefore.signature, before });
        if (newBefore.signature === before) {
          sameHashTries++;
          if (sameHashTries >= maxtries) {
            done = true;
          }
          console.log(`retrying getSigs`, {
            newBefore: newBefore,
            after: before,
          });
        } else {
          before = newBefore.signature;
          sameHashTries = 0;
        }
      }
    } catch (e) {
      console.log(e);
    }
    done = false;
  }
  console.log(`
  
  
  DONEE!!!!!
  
  `);

  await new Promise((resolve) => {
    from([...allTxs.values()].filter((tx) => tx && !tx?.err))
      .pipe(
        mergeMap(async (tx) => {
          let txContent;
          while (!txContent) {
            try {
              txContent = await connection.getTransaction(tx.signature);
              // This doesnt work right
              const withBalanceChange = txContent?.meta.postTokenBalances
                .filter((b) => b.mint !== wlToken)
                .find((b) => b.uiTokenAmount.uiAmount);

              if (withBalanceChange) {
                if (!txs.has(withBalanceChange.mint)) {
                  mints.add(withBalanceChange.mint);
                  txs.set(tx.signature, tx);
                  setCounter(mints.size);
                }
              }
            } catch (e) {
              console.error(e);
            }
          }

          return txContent;
        }, 10),
        toArray()
      )
      .subscribe(async (res) => {
        download(
          `mints-creatorId-${creatorId}-${Date.now()}.json`,
          jsonFormat([...mints])
        );
        
        console.log(txs.size);
        resolve(undefined);
      });
  });
};
