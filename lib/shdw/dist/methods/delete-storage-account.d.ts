import * as anchor from "@project-serum/anchor";
import { ShadowDriveResponse } from "../types";
/**
 *
 * @param {anchor.web3.PublicKey} key - PublicKey of a StorageAccount
 *	@param {string} version - ShadowDrive (v1 or v2)
 * @returns {ShadowDriveResponse} - Confirmed transaction ID
 */
export default function deleteStorageAccount(key: anchor.web3.PublicKey, version: string): Promise<ShadowDriveResponse>;
//# sourceMappingURL=delete-storage-account.d.ts.map