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
/**
 *
 * @param {anchor.web3.PublicKey} key - PublicKey of a Storage Account
 * @returns {ShadowDriveResponse} - Confirmed transaction ID
 */
function migrate(key) {
    return __awaiter(this, void 0, void 0, function* () {
        const selectedAccount = yield this.program.account.storageAccount.fetch(key);
        let [migration, migrationBump] = yield anchor.web3.PublicKey.findProgramAddress([Buffer.from("migration-helper"), key.toBytes()], this.program.programId);
        try {
            let tx = yield this.program.methods
                .migrateStep1()
                .accounts({
                storageAccount: key,
                migration: migration,
                owner: selectedAccount.owner1.publicKey,
            })
                .transaction();
            tx.recentBlockhash = (yield this.connection.getLatestBlockhash()).blockhash;
            tx.feePayer = this.wallet.publicKey;
            if (!common_1.isBrowser) {
                yield tx.partialSign(this.wallet.payer);
            }
            else {
                yield this.wallet.signTransaction(tx);
            }
            yield (0, helpers_1.sendAndConfirm)(this.provider.connection, tx.serialize(), { skipPreflight: false }, "confirmed", 120000);
        }
        catch (err) {
            return Promise.reject(new Error(err));
        }
        let res;
        try {
            let tx2 = yield this.program.methods
                .migrateStep2()
                .accounts({
                storageAccount: key,
                migration: migration,
                owner: selectedAccount.owner1.publicKey,
            })
                .transaction();
            tx2.recentBlockhash = (yield this.connection.getLatestBlockhash()).blockhash;
            tx2.feePayer = this.wallet.publicKey;
            if (!common_1.isBrowser) {
                yield tx2.partialSign(this.wallet.payer);
            }
            else {
                yield this.wallet.signTransaction(tx2);
            }
            res = yield (0, helpers_1.sendAndConfirm)(this.provider.connection, tx2.serialize(), { skipPreflight: false }, "confirmed", 120000);
        }
        catch (err) {
            return Promise.reject(new Error(err));
        }
        return Promise.resolve(res);
    });
}
exports.default = migrate;
//# sourceMappingURL=migrate.js.map