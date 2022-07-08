import * as anchor from "@project-serum/anchor";
import { ShadowDriveResponse } from "../types";
/**
 *
 * @param {anchor.web3.PublicKey} key - Publickey of a Storage Account
 * @param {string} version - ShadowDrive version (v1 or v2)
 * @returns {ShadowDriveResponse} - Confirmed transaction ID
 */
export default function cancelDeleteStorageAccount(key: anchor.web3.PublicKey, version: string): Promise<ShadowDriveResponse>;
//# sourceMappingURL=cancel-storage-account.d.ts.map