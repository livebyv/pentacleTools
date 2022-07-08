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
Object.defineProperty(exports, "__esModule", { value: true });
const anchor = __importStar(require("@project-serum/anchor"));
const helpers_1 = require("../utils/helpers");
const common_1 = require("../utils/common");
const spl_token_1 = require("@solana/spl-token");
/**
 *
 * @param {anchor.web3.PublicKey} key - PublicKey of a Storage Account
 * @param {string} version - ShadowDrive version (v1 or v2)
 * @returns {ShadowDriveResponse} - Confirmed transaction ID
 */
function claimStake(key, version) {
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
        const [unstakeAccount] = yield anchor.web3.PublicKey.findProgramAddress([Buffer.from("unstake-account"), key.toBytes()], this.program.programId);
        const [unstakeInfo] = yield anchor.web3.PublicKey.findProgramAddress([Buffer.from("unstake-info"), key.toBytes()], this.program.programId);
        const ownerAta = yield (0, helpers_1.findAssociatedTokenAddress)(selectedAccount.owner1, common_1.tokenMint);
        let txn;
        try {
            switch (version.toLocaleLowerCase()) {
                case "v1":
                    txn = yield this.program.methods
                        .claimStake()
                        .accounts({
                        storageConfig: this.storageConfigPDA,
                        storageAccount: key,
                        unstakeInfo: unstakeInfo,
                        unstakeAccount: unstakeAccount,
                        owner: selectedAccount.owner1,
                        ownerAta,
                        tokenMint: common_1.tokenMint,
                        systemProgram: anchor.web3.SystemProgram.programId,
                        tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                    })
                        .transaction();
                    break;
                case "v2":
                    txn = yield this.program.methods
                        .claimStake2()
                        .accounts({
                        storageConfig: this.storageConfigPDA,
                        storageAccount: key,
                        unstakeInfo: unstakeInfo,
                        unstakeAccount: unstakeAccount,
                        owner: selectedAccount.owner1,
                        ownerAta,
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
            const res = yield (0, helpers_1.sendAndConfirm)(this.provider.connection, txn.serialize(), { skipPreflight: false }, "confirmed", 120000);
            return Promise.resolve(res);
        }
        catch (e) {
            return Promise.reject(new Error(e));
        }
    });
}
exports.default = claimStake;
//# sourceMappingURL=claim-stake.js.map