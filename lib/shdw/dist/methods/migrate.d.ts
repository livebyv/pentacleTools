import * as anchor from "@project-serum/anchor";
import { ShadowDriveResponse } from "../types";
/**
 *
 * @param {anchor.web3.PublicKey} key - PublicKey of a Storage Account
 * @returns {ShadowDriveResponse} - Confirmed transaction ID
 */
export default function migrate(key: anchor.web3.PublicKey): Promise<ShadowDriveResponse>;
//# sourceMappingURL=migrate.d.ts.map