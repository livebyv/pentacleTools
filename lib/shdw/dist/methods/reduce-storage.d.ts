import * as anchor from "@project-serum/anchor";
import { ShadowDriveResponse } from "../types";
/**
 *
 * @param {anchor.web3.PublicKey} key - Publickey of a Storage Account
 * @param {string} size - Amount of storage you are requesting to reduce from your storage account. Should be in a string like '1KB', '1MB', '1GB'. Only KB, MB, and GB storage delineations are supported currently.
 * @param {string} version - ShadowDrive version (v1 or v2)
 * @returns {ShadowDriveResponse} - Confirmed transaction ID
 */
export default function reduceStorage(key: anchor.web3.PublicKey, size: string, version: string): Promise<ShadowDriveResponse>;
//# sourceMappingURL=reduce-storage.d.ts.map