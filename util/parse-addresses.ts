export const parseAddresses = (ids: string): string[] => {
  try {
    return JSON.parse(ids);
  } catch {
    if (ids.includes(",")) {
      return ids
        .split(",")
        .map((t) => t.trim())
        .filter((a) => a);
    }
    if (/\n/.exec(ids)?.length) {
      return ids
        .split("\n")
        .map((t) => t.trim())
        .filter((a) => a);
    }
    if (/\r/.exec(ids)?.length) {
      return ids
        .split("\r")
        .map((t) => t.trim())
        .filter((a) => a);
    }
    return [ids];
  }
};
