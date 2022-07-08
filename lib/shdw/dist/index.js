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
exports.ShdwDrive = void 0;
const helpers_1 = require("./utils/helpers");
const methods_1 = require("./methods");
class ShdwDrive {
    //Todo - check that the wallet passed in is able to sign messages
    constructor(connection, wallet) {
        this.connection = connection;
        this.wallet = wallet;
        /**
         *
         * Todo - Typescript does not currently support splitting up class definition into multiple files. These methods
         * are therefore added as properties to the ShdwDrive class. Can move all method definitions into this file to resolve.
         *
         */
        this.createStorageAccount = methods_1.createStorageAccount;
        this.addStorage = methods_1.addStorage;
        this.claimStake = methods_1.claimStake;
        this.deleteFile = methods_1.deleteFile;
        this.deleteStorageAccount = methods_1.deleteStorageAccount;
        this.editFile = methods_1.editFile;
        this.getStorageAccount = methods_1.getStorageAcc;
        this.getStorageAccounts = methods_1.getStorageAccs;
        this.listObjects = methods_1.listObjects;
        this.makeStorageImmutable = methods_1.makeStorageImmutable;
        this.reduceStorage = methods_1.reduceStorage;
        /**
         * @deprecated The method should not be used as of Shadow Drive v1.5
         */
        this.cancelDeleteFile = methods_1.cancelDeleteFile;
        this.cancelDeleteStorageAccount = methods_1.cancelDeleteStorageAccount;
        this.uploadFile = methods_1.uploadFile;
        this.uploadMultipleFiles = methods_1.uploadMultipleFiles;
        this.redeemRent = methods_1.redeemRent;
        this.migrate = methods_1.migrate;
        this.wallet = wallet;
        const [program, provider] = (0, helpers_1.getAnchorEnvironmet)(wallet, connection);
        this.connection = provider.connection;
        this.provider = provider;
        this.program = program;
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.wallet && !this.wallet.publicKey) {
                return;
            }
            this.storageConfigPDA = (yield (0, helpers_1.getStorageConfigPDA)(this.program))[0];
            this.userInfo = (yield (0, helpers_1.getUserInfo)(this.program, this.wallet.publicKey))[0];
            return this;
        });
    }
}
exports.ShdwDrive = ShdwDrive;
//# sourceMappingURL=index.js.map