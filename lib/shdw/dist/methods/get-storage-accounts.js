"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 *
 * Get all storage accounts for the current user
 * @param {string} version - ShadowDrive version (v1 or v2)
 * @returns {StorageAccountResponse[]} - List of storage accounts
 *
 */
function getStorageAccs(version) {
    return __awaiter(this, void 0, void 0, function* () {
        let storageAccounts;
        try {
            switch (version.toLocaleLowerCase()) {
                case "v1":
                    storageAccounts = yield this.program.account.storageAccount.all([
                        {
                            memcmp: {
                                bytes: this.wallet.publicKey,
                                offset: 39,
                            },
                        },
                    ]);
                    break;
                case "v2":
                    storageAccounts = yield this.program.account.storageAccountV2.all([
                        {
                            memcmp: {
                                bytes: this.wallet.publicKey,
                                offset: 22,
                            },
                        },
                    ]);
                    break;
            }
            return Promise.resolve(storageAccounts);
        }
        catch (e) {
            return Promise.reject(new Error(e));
        }
    });
}
exports.default = getStorageAccs;
//# sourceMappingURL=get-storage-accounts.js.map