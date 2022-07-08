import * as anchor from "@project-serum/anchor";
import { ShadowDriveResponse } from "../types";
/**
 *
 * @param {anchor.web3.PublicKey} key - Publickey of Storage Account
 * @param {string} url - Shadow Drive URL of the file you are requesting to undelete.
 * @returns {ShadowDriveResponse} - Confirmed transaction ID
 */
export default function cancelDeleteFile(key: anchor.web3.PublicKey, url: string): Promise<ShadowDriveResponse>;
//# sourceMappingURL=cancel-delete-file.d.ts.map