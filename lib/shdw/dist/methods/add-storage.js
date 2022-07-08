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
const spl_token_1 = require("@solana/spl-token");
const node_fetch_1 = __importDefault(require("node-fetch"));
/**
 *
 * @param {anchor.web3.PublicKey} key - Public Key of the existing storage to increase size on
 * @param {string} size - Amount of storage you are requesting to add to your storage account. Should be in a string like '1KB', '1MB', '1GB'. Only KB, MB, and GB storage delineations are supported currently.
 * @param {string} version - ShadowDrive version (v1 or v2)
 * @returns {ShadowDriveResponse} Confirmed transaction ID
 */
function addStorage(key, size, version) {
    return __awaiter(this, void 0, void 0, function* () {
        let storageInputAsBytes = (0, helpers_1.humanSizeToBytes)(size);
        let selectedAccount;
        switch (version.toLocaleLowerCase()) {
            case "v1":
                selectedAccount = yield this.program.account.storageAccount.fetch(key);
                break;
            case "v2":
                selectedAccount = yield this.program.account.storageAccountV2.fetch(key);
                break;
        }
        if (storageInputAsBytes === false) {
            return Promise.reject(new Error(`${size} is not a valid input for size. Please use a string like '1KB', '1MB', '1GB'.`));
        }
        let userInfoAccount = yield this.connection.getAccountInfo(this.userInfo);
        let userInfoData;
        let accountSeed;
        if (userInfoAccount !== null) {
            userInfoData = yield this.program.account.userInfo.fetch(this.userInfo);
            accountSeed = new anchor.BN(userInfoData.accountCounter);
        }
        else {
            return Promise.reject(new Error("You have not created a storage account on Shadow Drive yet. Please see the 'create-storage-account' command to get started."));
        }
        const ownerAta = yield (0, helpers_1.findAssociatedTokenAddress)(selectedAccount.owner1, common_1.tokenMint);
        let stakeAccount = (yield (0, helpers_1.getStakeAccount)(this.program, key))[0];
        try {
            let txn;
            switch (version.toLocaleLowerCase()) {
                case "v1":
                    txn = yield this.program.methods
                        .increaseStorage(new anchor.BN(storageInputAsBytes.toString()))
                        .accounts({
                        storageConfig: this.storageConfigPDA,
                        storageAccount: key,
                        owner: selectedAccount.owner1,
                        ownerAta,
                        stakeAccount,
                        uploader: common_1.uploader,
                        tokenMint: common_1.tokenMint,
                        systemProgram: anchor.web3.SystemProgram.programId,
                        tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                    })
                        .transaction();
                    break;
                case "v2":
                    txn = yield this.program.methods
                        .increaseStorage2(new anchor.BN(storageInputAsBytes))
                        .accounts({
                        storageConfig: this.storageConfigPDA,
                        storageAccount: key,
                        owner: selectedAccount.owner1,
                        ownerAta,
                        stakeAccount,
                        uploader: common_1.uploader,
                        tokenMint: common_1.tokenMint,
                        systemProgram: anchor.web3.SystemProgram.programId,
                        tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                    })
                        .transaction();
                    break;
            }
            txn.recentBlockhash = (yield this.connection.getLatestBlockhash()).blockhash;
            txn.feePayer = this.wallet.publicKey;
            if (!common_1.isBrowser) {
                yield txn.partialSign(this.wallet.payer);
            }
            else {
                yield this.wallet.signTransaction(txn);
            }
            const serializedTxn = txn.serialize({ requireAllSignatures: false });
            const addStorageResponse = yield (0, node_fetch_1.default)(`${common_1.SHDW_DRIVE_ENDPOINT}/add-storage`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    transaction: Buffer.from(serializedTxn.toJSON().data).toString("base64"),
                    storage_account: key,
                    amount_to_add: storageInputAsBytes,
                }),
            });
            if (!addStorageResponse.ok) {
                return Promise.reject(new Error(`Server response status code: ${addStorageResponse.status} \n 
		  Server response status message: ${(yield addStorageResponse.json()).error}`));
            }
            const responseJson = yield addStorageResponse.json();
            return Promise.resolve(responseJson);
        }
        catch (e) {
            return Promise.reject(new Error(e));
        }
    });
}
exports.default = addStorage;
//# sourceMappingURL=add-storage.js.map