"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const anchor = __importStar(require("@project-serum/anchor"));
const common_1 = require("../utils/common");
const cross_fetch_1 = __importDefault(require("cross-fetch"));
const bytes_1 = require("@project-serum/anchor/dist/cjs/utils/bytes");
const tweetnacl_1 = __importDefault(require("tweetnacl"));
/**
 *
 * @param {anchor.web3.PublicKey} key - Publickey of Storage Account
 * @param {string} url - Shadow Drive URL of the file you are requesting to delete.
 * @param {string} version - ShadowDrive version (v1 or v2)
 * @returns {ShadowDriveResponse} - Confirmed transaction ID
 */
function deleteFile(key, url, version) {
    return __awaiter(this, void 0, void 0, function* () {
        let selectedAccount;
        switch (version.toLocaleLowerCase()) {
            case "v1":
                selectedAccount = yield this.program.account.storageAccount.fetch(key);
                break;
            case "v2":
                selectedAccount = yield this.program.account.storageAccountV2.fetch(key);
                break;
        }
        const fileData = yield (0, cross_fetch_1.default)(`${common_1.SHDW_DRIVE_ENDPOINT}/get-object-data`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                location: url,
            }),
        });
        const fileDataResponse = yield fileData.json();
        const fileOwnerOnChain = new anchor.web3.PublicKey(fileDataResponse.file_data["owner-account-pubkey"]);
        if (!fileOwnerOnChain.equals(this.wallet.publicKey)) {
            return Promise.reject(new Error("Permission denied: Not file owner"));
        }
        try {
            let deleteFileResponse;
            const msg = Buffer.from(`Shadow Drive Signed Message:\nStorageAccount: ${key}\nFile to delete: ${url}`);
            let msgSig;
            if (!this.wallet.signMessage) {
                msgSig = tweetnacl_1.default.sign.detached(msg, this.wallet.payer.secretKey);
            }
            else {
                msgSig = yield this.wallet.signMessage(msg);
            }
            const encodedMsg = bytes_1.bs58.encode(msgSig);
            deleteFileResponse = yield (0, cross_fetch_1.default)(`${common_1.SHDW_DRIVE_ENDPOINT}/delete-file`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    signer: this.wallet.publicKey,
                    message: encodedMsg,
                    location: url,
                }),
            });
            if (!deleteFileResponse.ok) {
                return Promise.reject(new Error(`Server response status code: ${deleteFileResponse.status} \n 
					  Server response status message: ${(yield deleteFileResponse.json()).error}`));
            }
            const responseJson = yield deleteFileResponse.json();
            return Promise.resolve(responseJson);
        }
        catch (e) {
            return Promise.reject(new Error(e));
        }
    });
}
exports.default = deleteFile;
//# sourceMappingURL=delete-file.js.map