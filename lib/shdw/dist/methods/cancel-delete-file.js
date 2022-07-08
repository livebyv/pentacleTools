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
const helpers_1 = require("../utils/helpers");
const common_1 = require("../utils/common");
const cross_fetch_1 = __importDefault(require("cross-fetch"));
/**
 *
 * @param {anchor.web3.PublicKey} key - Publickey of Storage Account
 * @param {string} url - Shadow Drive URL of the file you are requesting to undelete.
 * @returns {ShadowDriveResponse} - Confirmed transaction ID
 */
function cancelDeleteFile(key, url) {
    return __awaiter(this, void 0, void 0, function* () {
        const selectedAccount = yield this.program.account.storageAccount.fetch(key);
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
        const fileAccount = new anchor.web3.PublicKey(fileDataResponse.file_data["file-account-pubkey"]);
        let stakeAccount = (yield (0, helpers_1.getStakeAccount)(this.program, key))[0];
        try {
            const txn = yield this.program.methods
                .unmarkDeleteFile()
                .accounts({
                storageConfig: this.storageConfigPDA,
                storageAccount: key,
                file: fileAccount,
                stakeAccount,
                owner: selectedAccount.owner1,
                tokenMint: common_1.tokenMint,
                systemProgram: anchor.web3.SystemProgram.programId,
            })
                .transaction();
            txn.recentBlockhash = (yield this.connection.getLatestBlockhash()).blockhash;
            txn.feePayer = this.wallet.publicKey;
            if (!common_1.isBrowser) {
                yield txn.partialSign(this.wallet.payer);
            }
            else {
                yield this.wallet.signTransaction(txn);
            }
            const res = yield (0, helpers_1.sendAndConfirm)(this.provider.connection, txn.serialize(), { skipPreflight: false }, "confirmed", 120000);
            return Promise.resolve(res);
        }
        catch (e) {
            return Promise.reject(e);
        }
    });
}
exports.default = cancelDeleteFile;
//# sourceMappingURL=cancel-delete-file.js.map