import * as anchor from "@project-serum/anchor";
import { ShadowFile, ShadowUploadResponse } from "../types";
/**
 *
 * @param {anchor.web3.PublicKey} key - Publickey of Storage Account
 * @param {string} url - URL of existing file
 * @param {File | ShadowFile} data - File or ShadowFile object, file extensions should be included in the name property of ShadowFiles.
 * @param {string} version - ShadowDrive version (v1 or v2)
 * @returns {ShadowUploadResponse} - File location and transaction signature
 */
export default function editFile(key: anchor.web3.PublicKey, url: string, data: File | ShadowFile, version: string): Promise<ShadowUploadResponse>;
//# sourceMappingURL=edit-file.d.ts.map