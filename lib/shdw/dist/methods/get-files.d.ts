import * as anchor from "@project-serum/anchor";
import { ShadowDriveResponse } from "../types";
/**
 *
 * @param {anchor.web3.PublicKey} key - Public Key of the existing storage to increase size on
 * @param {string} version - ShadowDrive version (v1 or v2)
 * @returns {ShadowDriveResponse} - Confirmed transaction ID
 */
export default function getFiles(key: anchor.web3.PublicKey, version: string): Promise<ShadowDriveResponse>;
//# sourceMappingURL=get-files.d.ts.map