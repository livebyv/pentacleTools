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
 * @param {anchor.web3.PublicKey} key - Publickey of a Storage Account
 * @param {string} version - ShadowDrive version (v1 or v2)
 * @returns {ShadowDriveResponse} - Confirmed transaction ID
 */
function makeStorageImmutable(key, version) {
    return __awaiter(this, void 0, void 0, function* () {
        let selectedAccount;
        try {
            switch (version.toLocaleLowerCase()) {
                case "v1":
                    selectedAccount = yield this.program.account.storageAccount.fetch(key);
                    break;
                case "v2":
                    selectedAccount = yield this.program.account.storageAccountV2.fetch(key);
                    break;
            }
            const ownerAta = yield (0, helpers_1.findAssociatedTokenAddress)(selectedAccount.owner1, common_1.tokenMint);
            const emissionsAta = yield (0, helpers_1.findAssociatedTokenAddress)(common_1.emissions, common_1.tokenMint);
            let stakeAccount = (yield (0, helpers_1.getStakeAccount)(this.program, key))[0];
            let txn;
            switch (version.toLocaleLowerCase()) {
                case "v1":
                    txn = yield this.program.methods
                        .makeAccountImmutable()
                        .accounts({
                        storageConfig: this.storageConfigPDA,
                        storageAccount: key,
                        stakeAccount,
                        emissionsWallet: emissionsAta,
                        owner: selectedAccount.owner1,
                        uploader: common_1.uploader,
                        ownerAta,
                        tokenMint: common_1.tokenMint,
                        systemProgram: anchor.web3.SystemProgram.programId,
                        tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                        associatedTokenProgram: spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID,
                        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
                    })
                        .transaction();
                case "v2":
                    txn = yield this.program.methods
                        .makeAccountImmutable2()
                        .accounts({
                        storageConfig: this.storageConfigPDA,
                        storageAccount: key,
                        owner: selectedAccount.owner1,
                        ownerAta,
                        stakeAccount,
                        uploader: common_1.uploader,
                        emissionsWallet: emissionsAta,
                        tokenMint: common_1.tokenMint,
                        systemProgram: anchor.web3.SystemProgram.programId,
                        tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                        associatedTokenProgram: spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID,
                        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
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
            const makeImmutableResponse = yield (0, node_fetch_1.default)(`${common_1.SHDW_DRIVE_ENDPOINT}/make-immutable`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    transaction: Buffer.from(serializedTxn.toJSON().data).toString("base64"),
                }),
            });
            if (!makeImmutableResponse.ok) {
                return Promise.reject(new Error(`Server response status code: ${makeImmutableResponse.status} \n 
			Server response status message: ${(yield makeImmutableResponse.json()).error}`));
            }
            const responseJson = yield makeImmutableResponse.json();
            return Promise.resolve(responseJson);
        }
        catch (e) {
            return Promise.reject(new Error(e));
        }
    });
}
exports.default = makeStorageImmutable;
//# sourceMappingURL=make-storage-immutable.js.map