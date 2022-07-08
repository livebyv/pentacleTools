import * as anchor from "@project-serum/anchor";
import { CreateStorageResponse } from "../types";
/**
 *
 * @param {string} name - What you want your storage account to be named. (Does not have to be unique)
 * @param {string} size - Amount of storage you are requesting to create. Should be in a string like '1KB', '1MB', '1GB'. Only KB, MB, and GB storage delineations are supported currently.
 * @param {string} version - ShadowDrive version(v1 or v2)
 * @param {anchor.web3.PublicKey} owner2 - Optional secondary owner for the storage account.
 * @returns {CreateStorageResponse} Created bucket and transaction signature
 */
export default function createStorageAccount(name: string, size: string, version: string, owner2?: anchor.web3.PublicKey): Promise<CreateStorageResponse>;
//# sourceMappingURL=create-storage-account.d.ts.map