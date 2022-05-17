import { toPublicKey } from "./to-publickey";

export const getAddresses = (str: string): string[] => {
  try {
    return JSON.parse(str);
  } catch {
    if (str.includes(",")) {
      return str
        .split(",")
        .map((t) => t.trim())
        .filter((a) => a);
    }
    if (/\n/.exec(str)?.length) {
      return str
        .split("\n")
        .map((t) => t.trim())
        .filter((a) => a);
    }
    if (/\r/.exec(str)?.length) {
      return str
        .split("\r")
        .map((t) => t.trim())
        .filter((a) => a);
    }
    return [str];
  }
};

export const validateSolAddressArray = (str: string) => {
  let val;
  try {
    val = JSON.parse(str);
    val.forEach(k => toPublicKey(k));
    return true;
  } catch {
    try {
      if (str.includes(",")) {
        const split = str
          .split(",")
          .map((t) => t.trim())
          .filter((a) => a);
          split.forEach(k => toPublicKey(k));
          return true;
      }
      if (/\n/.exec(str)?.length) {
        const split = str
          .split("\n")
          .map((t) => t.trim())
          .filter((a) => a);
          split.forEach(k => toPublicKey(k));
          return true;
      }
      if (/\r/.exec(str)?.length) {
        const split = str
          .split("\r")
          .map((t) => t.trim())
          .filter((a) => a);
          split.forEach(k => toPublicKey(k));
          return true;
      }
      toPublicKey(str);
      return true;
    } catch {
      return 'Invalid format or keys, must be list of SOL base58 keys.';
    }
  }
}

export const SOL_ADDRESS_REGEXP = /[1-9A-HJ-NP-Za-km-z]{32,44}/;

export const solAddressValidator = () => ({
  validator(_, value) {
    const isValid = !!(value as string || '').match(SOL_ADDRESS_REGEXP)?.length;
    return isValid ? Promise.resolve() : Promise.reject(new Error('Invalid Address'));
  }
})