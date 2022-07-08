import * as anchor from "@project-serum/anchor";
import { ShadowDriveResponse } from "../types";
/**
 *
 * @param {anchor.web3.PublicKey} key - PublicKey of a Storage Account
 * @param {string} version - ShadowDrive version (v1 or v2)
 * @returns {ShadowDriveResponse} - Confirmed transaction ID
 */
export default function claimStake(key: anchor.web3.PublicKey, version: string): Promise<ShadowDriveResponse>;
//# sourceMappingURL=claim-stake.d.ts.map