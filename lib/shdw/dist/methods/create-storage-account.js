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
const cross_fetch_1 = __importDefault(require("cross-fetch"));
/**
 *
 * @param {string} name - What you want your storage account to be named. (Does not have to be unique)
 * @param {string} size - Amount of storage you are requesting to create. Should be in a string like '1KB', '1MB', '1GB'. Only KB, MB, and GB storage delineations are supported currently.
 * @param {string} version - ShadowDrive version(v1 or v2)
 * @param {anchor.web3.PublicKey} owner2 - Optional secondary owner for the storage account.
 * @returns {CreateStorageResponse} Created bucket and transaction signature
 */
function createStorageAccount(name, size, version, owner2) {
    return __awaiter(this, void 0, void 0, function* () {
        let storageInputAsBytes = (0, helpers_1.humanSizeToBytes)(size);
        if (storageInputAsBytes === false) {
            return Promise.reject(new Error(`${size} is not a valid input for size. Please use a string like '1KB', '1MB', '1GB'.`));
        }
        let [userInfo, userInfoBump] = yield anchor.web3.PublicKey.findProgramAddress([Buffer.from("user-info"), this.wallet.publicKey.toBytes()], this.program.programId);
        // If userInfo hasn't been initialized, default to 0 for account seed
        let userInfoAccount = yield this.connection.getAccountInfo(this.userInfo);
        let accountSeed = new anchor.BN(0);
        if (userInfoAccount !== null) {
            let userInfoData = yield this.program.account.userInfo.fetch(this.userInfo);
            accountSeed = new anchor.BN(userInfoData.accountCounter);
        }
        else {
            this.userInfo = userInfo;
        }
        let storageRequested = new anchor.BN(storageInputAsBytes.toString()); // 2^30 B <==> 1GB
        // Retreive storageAccount
        let storageAccount = (yield (0, helpers_1.getStorageAccount)(this.program, this.wallet.publicKey, accountSeed))[0];
        // Retrieve stakeAccount
        let stakeAccount = (yield (0, helpers_1.getStakeAccount)(this.program, storageAccount))[0];
        let ownerAta = yield (0, helpers_1.findAssociatedTokenAddress)(this.wallet.publicKey, common_1.tokenMint);
        let txn;
        switch (version.toLocaleLowerCase()) {
            case "v1":
                txn = yield this.program.methods
                    .initializeAccount(name, storageRequested, owner2 ? owner2 : null)
                    .accounts({
                    storageConfig: this.storageConfigPDA,
                    userInfo: this.userInfo,
                    storageAccount,
                    stakeAccount,
                    tokenMint: common_1.tokenMint,
                    owner1: this.wallet.publicKey,
                    uploader: common_1.uploader,
                    owner1TokenAccount: ownerAta,
                    systemProgram: anchor.web3.SystemProgram.programId,
                    tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                    rent: anchor.web3.SYSVAR_RENT_PUBKEY,
                })
                    .transaction();
                break;
            case "v2":
                txn = yield this.program.methods
                    .initializeAccount2(name, storageRequested)
                    .accounts({
                    storageConfig: this.storageConfigPDA,
                    userInfo: this.userInfo,
                    storageAccount,
                    stakeAccount,
                    tokenMint: common_1.tokenMint,
                    owner1: this.wallet.publicKey,
                    uploader: common_1.uploader,
                    owner1TokenAccount: ownerAta,
                    systemProgram: anchor.web3.SystemProgram.programId,
                    tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                    rent: anchor.web3.SYSVAR_RENT_PUBKEY,
                })
                    .transaction();
                break;
        }
        try {
            txn.recentBlockhash = (yield this.connection.getLatestBlockhash()).blockhash;
            txn.feePayer = this.wallet.publicKey;
            if (!common_1.isBrowser) {
                yield txn.partialSign(this.wallet.payer);
            }
            else {
                yield this.wallet.signTransaction(txn);
            }
            const serializedTxn = txn.serialize({ requireAllSignatures: false });
            const createStorageResponse = yield (0, cross_fetch_1.default)(`${common_1.SHDW_DRIVE_ENDPOINT}/storage-account`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    transaction: Buffer.from(serializedTxn.toJSON().data).toString("base64"),
                }),
            });
            if (!createStorageResponse.ok) {
                return Promise.reject(new Error(`Server response status code: ${createStorageResponse.status} \n 
		Server response status message: ${(yield createStorageResponse.json()).error}`));
            }
            const responseJson = (yield createStorageResponse.json());
            return Promise.resolve(responseJson);
        }
        catch (e) {
            console.log(`Error from fileserver ${e}`);
            return Promise.reject(new Error(e));
        }
    });
}
exports.default = createStorageAccount;
//# sourceMappingURL=create-storage-account.js.map