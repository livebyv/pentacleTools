import * as anchor from "@project-serum/anchor";
import { ShadowDriveResponse } from "../types";
/**
 *
 * @param {anchor.web3.PublicKey} key - PublicKey of a Storage Account
 * @param {anchor.web3.PublicKey} fileAccount - PublicKey of the file account to close
 * @returns {ShadowDriveResponse} - Confirmed transaction ID
 */
export default function redeemRent(key: anchor.web3.PublicKey, fileAccount: anchor.web3.PublicKey): Promise<ShadowDriveResponse>;
//# sourceMappingURL=redeem-rent.d.ts.map