import { LAMPORTS_PER_SOL } from "@solana/web3.js";

export const getStuckSol = (key: string, url: string) => {
  return fetch(url, {
    body: `{
        "jsonrpc":"2.0", 
        "id":1, 
        "method":"getProgramAccounts", 
        "params":[
          "cndyAnrLdpjq1Ssp1z8xxDsB8dxe7u4HL5Nxi2K5WXZ",
          {
            "encoding": "jsonParsed",
            "filters": [
              {
                "memcmp": {
                  "offset": 8,
                  "bytes": "${key}"
                }
              }
            ]
          }
        ]}
    `,
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  })
    .then((res) => res.json())
    .then(
      (res) => ({
        total: res.result.reduce((acc, curr) => acc + curr.account.lamports, 0) /
        LAMPORTS_PER_SOL,
        accounts: res.result.length
      })
    );
};
