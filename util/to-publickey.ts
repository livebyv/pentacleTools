import { PublicKey } from "@solana/web3.js";

const PubKeysInternedMap = new Map<string, PublicKey>();

export const toPublicKey = (key: string | PublicKey | Uint8Array): PublicKey => {
  if (key instanceof PublicKey) {
    return key;
  }

  if (typeof key === 'string') {
    let result = PubKeysInternedMap.get(key);
    if (!result) {
      result = new PublicKey(key);
      PubKeysInternedMap.set(key, result);
    }

    return result;
  }

  if (key instanceof Uint8Array) {
    const result = new PublicKey(key);
    PubKeysInternedMap.set(result.toBase58(), result);
    return result;
  }
};
