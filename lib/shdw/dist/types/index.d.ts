/// <reference types="node" />
import * as anchor from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";
export declare type CreateStorageResponse = {
    shdw_bucket: string;
    transaction_signature: string;
};
export declare type ShadowDriveResponse = {
    txid: string;
};
export declare type ShadowUploadResponse = {
    finalized_locations: Array<string>;
    message: string;
    upload_errors: Array<UploadError>;
};
export declare type UploadError = {
    file: string;
    storage_account: string;
    error: string;
};
export declare type ShadowBatchUploadResponse = {
    fileName: string;
    status: string;
    location: string;
};
export declare type ListObjectsResponse = {
    keys: string[];
};
export declare type StorageAccountResponse = {
    publicKey: anchor.web3.PublicKey;
    account: StorageAccount;
};
export declare type StorageAccountInfo = {
    storage_account: PublicKey;
    reserved_bytes: number;
    current_usage: number;
    immutable: boolean;
    to_be_deleted: boolean;
    delet_request_epoch: number;
    owner1: PublicKey;
    account_counter_seed: number;
    creation_time: number;
    creation_epoch: number;
    last_fee_epoch: number;
    identifier: string;
};
export declare type StorageAccount = {
    isStatic: boolean;
    initCounter: number;
    delCounter: number;
    immutable: boolean;
    toBeDeleted: boolean;
    deleteRequestEpoch: number;
    storage: number;
    storageAvailable: number;
    owner1: anchor.web3.PublicKey;
    owner2: anchor.web3.PublicKey;
    shdwPayer: anchor.web3.PublicKey;
    accountCounterSeed: number;
    totalCostOfCurrentStorage: number;
    totalFeesPaid: number;
    creationTime: number;
    creationEpoch: number;
    lastFeeEpoch: number;
    identifier: string;
};
export declare type ShadowFile = {
    name?: string;
    file: Buffer;
};
//# sourceMappingURL=index.d.ts.map