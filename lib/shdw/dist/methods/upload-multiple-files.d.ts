import * as anchor from "@project-serum/anchor";
import { ShadowBatchUploadResponse, ShadowFile } from "../types";
/**
 *
 * @param {anchor.web3.PublicKey} key - Storage account PublicKey to upload the files to.
 * @param {FileList | ShadowFile[]} data[] - Array of Files or ShadowFile objects to be uploaded
 * @returns {ShadowBatchUploadResponse[]} - File names, locations and transaction signatures for uploaded files.
 */
export default function uploadMultipleFiles(key: anchor.web3.PublicKey, data: FileList | ShadowFile[], concurrent?: number): Promise<ShadowBatchUploadResponse[]>;
//# sourceMappingURL=upload-multiple-files.d.ts.map