import { from } from "rxjs";
import { mergeMap, toArray, map, tap } from "rxjs/operators";
import { TOKEN_PROGRAM_ID } from "./accounts";
let holders = {};
let i = 0;
const getTokenHolder = (url, key, setCounter, token) => {

  return fetch(url, {
    body: `{
        "jsonrpc":"2.0", 
        "id":1, 
        "method":"getProgramAccounts", 
        "params":[
          "${TOKEN_PROGRAM_ID}",
          {
            "encoding": "jsonParsed",
            "filters": [
              {
                "dataSize": 165
              },
              {
                "memcmp": {
                  "offset": 0,
                  "bytes": "${key}"
                }
              }
            ]
          }
        ]}
    `,
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    method: "POST",
  })
    .then((res) => res.json())
    .then(async (res) => {
      i++;
      setCounter(i + 1);
      res.result.forEach((r, i) => {
        if (r.account.data.parsed.info.tokenAmount.uiAmount > 0) {
          if (!holders[r.account.data.parsed.info.owner]) {
            holders[r.account.data.parsed.info.owner] = {
              amount: +r.account.data.parsed.info.tokenAmount.uiAmount,
              mints: [key],
            };
          } else {
            holders[r.account.data.parsed.info.owner].amount += +r.account.data.parsed.info.tokenAmount.uiAmount;
            holders[r.account.data.parsed.info.owner].mints.push(key);
          }
        }
      });
    });
};

export const getHolders = (mintIds: string[], setCounter, url, token) => {
  return from(mintIds).pipe(
    mergeMap((id) => getTokenHolder(url, id, setCounter, token), 10),
    toArray(),
    map(() => ({ ...holders })),
    tap(() => {
      holders = {};
      i = 0;
    })
  );
};
