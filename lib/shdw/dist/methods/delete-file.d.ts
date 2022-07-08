import * as anchor from "@project-serum/anchor";
import { ShadowDriveResponse } from "../types";
/**
 *
 * @param {anchor.web3.PublicKey} key - Publickey of Storage Account
 * @param {string} url - Shadow Drive URL of the file you are requesting to delete.
 * @param {string} version - ShadowDrive version (v1 or v2)
 * @returns {ShadowDriveResponse} - Confirmed transaction ID
 */
export default function deleteFile(key: anchor.web3.PublicKey, url: string, version: string): Promise<ShadowDriveResponse>;
//# sourceMappingURL=delete-file.d.ts.map