import * as anchor from "@project-serum/anchor";
import { ShadowFile, ShadowUploadResponse } from "../types";
/**
 *
 * @param {anchor.web3.PublicKey} key - Publickey of Storage Account.
 * @param {File | ShadowFile} data - File or ShadowFile object, file extensions should be included in the name property of ShadowFiles.
 * @param {string} version - ShadowDrive version (v1 or v2)
 * @returns {ShadowUploadResponse} File location and transaction signature.
 */
export default function uploadFile(key: anchor.web3.PublicKey, data: File | ShadowFile, version: string): Promise<ShadowUploadResponse>;
//# sourceMappingURL=upload-file.d.ts.map