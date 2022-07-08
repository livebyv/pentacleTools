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
/**
 *
 * @param {anchor.web3.PublicKey} key - Public Key of the existing storage to increase size on
 * @param {string} version - ShadowDrive version (v1 or v2)
 * @returns {ShadowDriveResponse} - Confirmed transaction ID
 */
function getFiles(key, version) {
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
        const fileKeys = [];
        if (version.toLocaleLowerCase() == "v1") {
            for (let i = 0; i < selectedAccount.initCounter; i++) {
                let [file, fileBump] = yield anchor.web3.PublicKey.findProgramAddress([
                    key.toBytes(),
                    ,
                    new anchor.BN(i).toTwos(64).toArrayLike(Buffer, "le", 4),
                ], this.program.programId);
                fileKeys.push(file);
            }
        }
        else {
            //Do somethin to retrieve v2 files
        }
        return;
    });
}
exports.default = getFiles;
//# sourceMappingURL=get-files.js.map