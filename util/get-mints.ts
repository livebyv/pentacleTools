import { from } from "rxjs";
import { mergeMap, toArray, map } from "rxjs/operators";
import { Connection, ParsedInstruction, PublicKey } from "@solana/web3.js";
import { sliceIntoChunks } from "./slice-into-chunks";

let count = 0;
export async function getMints(
  candy_id: string,
  connection: Connection,
  setCounter
) {
  return new Promise(async (resolve) => {
    let all_signatures = [];
    let options = { before: undefined, limit: 1000 };
    let retries = 0;
    while (true) {
      const signatures = await connection.getSignaturesForAddress(
        new PublicKey(candy_id),
        options
      );
      if (signatures.length == 0) {
        // GBT errors can cause empty returns, we try a few times
        if (retries < 10) {
          retries++;
        } else {
          break;
        }
      } else {
        options.before = signatures[signatures.length - 1].signature;
        all_signatures.push(...signatures);
        retries = 0;
      }
    }
    // Slice into chunks to avoid hitting size limit;
    const chunks = sliceIntoChunks(all_signatures, 150);

    from(chunks)
      .pipe(
        mergeMap(async (chunk) => {
          let retries = 0;
          let parsedTxs = await connection.getParsedTransactions(
            chunk.map((tx) => tx.signature)
          );
          while (retries < 5) {
            if (!parsedTxs?.every((tx) => !!tx)) {
              retries++;
            }
          }
          return parsedTxs.filter(tx => !!tx);
        }, 4),
        map((chunk) => {
          return chunk
            .map((h) => {
              const mint = (
                h?.transaction?.message?.instructions as ParsedInstruction[]
              )?.find((ix) => ix?.parsed?.type === "mintTo")?.parsed?.info
                ?.mint;
              if (!h?.meta?.err && mint) {
                setCounter(count++);
                return mint;
              }
            })
            .filter((r) => !!r);
        }),
        toArray()
      )
      .subscribe((res) => {
        resolve(res.flat());
        count = 0;
      });
  });
}
