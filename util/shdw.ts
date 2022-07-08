import { ShdwDrive } from "../lib/shdw/dist";

export const getAccounts = async (shdw: ShdwDrive) =>
  await Promise.all(
    ["v1", "v2"].map(async (version) =>
      (
        await shdw.getStorageAccounts(version)
      ).map((acc) => ({
        ...acc,
        version,
      }))
    )
  )
    .then((res) => res.flat().sort(sortStorageAccounts))
    .then(async (res) => {
      return await Promise.all(
        res.map(async (r) => {
          const fd = new FormData();
          fd.append("storage_account", r.publicKey.toBase58());
          return {
            ...r,
            ...(await fetch(
              `https://shadow-storage.genesysgo.net/storage-account-info?storage_account=${r.publicKey.toBase58()}`,
              {
                method: "post",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  storage_account: r.publicKey.toBase58(),
                }),
              }
            ).then((res) => res.json())),
          };
        })
      );
    });

export const sortStorageAccounts = (a, b) =>
  b.account.creationTime - a.account.creationTime;

export const isValidUnit = (str: string) => {
  const num = parseFloat(str);
  if (isNaN(num)) {
    return false;
  }
  const unit = str.split(`${num}`)[1].toUpperCase();
  if (!["MB", "KB", "GB"].includes(unit)) {
    return false;
  }
  return true;
};
