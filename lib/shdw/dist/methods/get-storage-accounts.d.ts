import { StorageAccountResponse } from "../types";
/**
 *
 * Get all storage accounts for the current user
 * @param {string} version - ShadowDrive version (v1 or v2)
 * @returns {StorageAccountResponse[]} - List of storage accounts
 *
 */
export default function getStorageAccs(version: string): Promise<StorageAccountResponse[]>;
//# sourceMappingURL=get-storage-accounts.d.ts.map