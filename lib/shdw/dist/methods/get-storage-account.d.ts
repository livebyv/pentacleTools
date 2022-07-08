import { web3 } from "@project-serum/anchor";
import { StorageAccountInfo } from "../types";
/**
 * Get storage account details
 * @param {PublicKey} key - Publickey of a Storage Account
 * @returns {StorageAccountInfo} Storage Account
 *
 */
export default function getStorageAcc(key: web3.PublicKey): Promise<StorageAccountInfo>;
//# sourceMappingURL=get-storage-account.d.ts.map