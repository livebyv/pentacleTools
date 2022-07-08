import { web3 } from "@project-serum/anchor";
import { createStorageAccount, addStorage, claimStake, deleteFile, deleteStorageAccount, editFile, getStorageAcc, getStorageAccs, makeStorageImmutable, reduceStorage, cancelDeleteFile, cancelDeleteStorageAccount, uploadFile, uploadMultipleFiles, listObjects, redeemRent, migrate } from "./methods";
import { CreateStorageResponse, ShadowBatchUploadResponse, ShadowDriveResponse, ShadowFile, ShadowUploadResponse, StorageAccount, StorageAccountResponse, ListObjectsResponse, StorageAccountInfo } from "./types";
interface ShadowDrive {
    createStorageAccount(name: string, size: string, version: string, owner2: web3.PublicKey): Promise<CreateStorageResponse>;
    addStorage(key: web3.PublicKey, size: string, version: string): Promise<ShadowDriveResponse>;
    claimStake(key: web3.PublicKey, version: string): Promise<ShadowDriveResponse>;
    deleteFile(key: web3.PublicKey, url: string, version: string): Promise<ShadowDriveResponse>;
    editFile(key: web3.PublicKey, url: string, data: File | ShadowFile, version: string): Promise<ShadowUploadResponse>;
    getStorageAcc?(key: web3.PublicKey): Promise<StorageAccount>;
    getStorageAccs?(): Promise<StorageAccount[]>;
    listObjects(key: web3.PublicKey): Promise<ListObjectsResponse>;
    makeStorageImmutable(key: web3.PublicKey, version: string): Promise<ShadowDriveResponse>;
    getStorageAccount(key: web3.PublicKey): Promise<StorageAccountInfo>;
    getStorageAccounts(version: string): Promise<StorageAccountResponse[]>;
    reduceStorage(key: web3.PublicKey, size: string, version: string): Promise<ShadowDriveResponse>;
    cancelDeleteFile(key: web3.PublicKey, url: string): Promise<ShadowDriveResponse>;
    cancelDeleteStorageAccount(key: web3.PublicKey, version: string): Promise<ShadowDriveResponse>;
    uploadFile(key: web3.PublicKey, data: File | ShadowFile, version: string): Promise<ShadowUploadResponse>;
    uploadMultipleFiles(key: web3.PublicKey, data: FileList | ShadowFile[], concurrent?: number): Promise<ShadowBatchUploadResponse[]>;
    deleteStorageAccount(key: web3.PublicKey, version: string): Promise<ShadowDriveResponse>;
    redeemRent(key: web3.PublicKey, fileAccount: web3.PublicKey): Promise<ShadowDriveResponse>;
    migrate(key: web3.PublicKey): Promise<ShadowDriveResponse>;
}
export declare class ShdwDrive implements ShadowDrive {
    private connection;
    private wallet;
    private provider;
    private program;
    private storageConfigPDA;
    private userInfo;
    /**
     *
     * Todo - Typescript does not currently support splitting up class definition into multiple files. These methods
     * are therefore added as properties to the ShdwDrive class. Can move all method definitions into this file to resolve.
     *
     */
    createStorageAccount: typeof createStorageAccount;
    addStorage: typeof addStorage;
    claimStake: typeof claimStake;
    deleteFile: typeof deleteFile;
    deleteStorageAccount: typeof deleteStorageAccount;
    editFile: typeof editFile;
    getStorageAccount: typeof getStorageAcc;
    getStorageAccounts: typeof getStorageAccs;
    listObjects: typeof listObjects;
    makeStorageImmutable: typeof makeStorageImmutable;
    reduceStorage: typeof reduceStorage;
    /**
     * @deprecated The method should not be used as of Shadow Drive v1.5
     */
    cancelDeleteFile: typeof cancelDeleteFile;
    cancelDeleteStorageAccount: typeof cancelDeleteStorageAccount;
    uploadFile: typeof uploadFile;
    uploadMultipleFiles: typeof uploadMultipleFiles;
    redeemRent: typeof redeemRent;
    migrate: typeof migrate;
    constructor(connection: web3.Connection, wallet: any);
    init(): Promise<ShdwDrive>;
}
export { CreateStorageResponse, ShadowDriveResponse, ShadowUploadResponse, ShadowFile, StorageAccount, StorageAccountResponse, ShadowBatchUploadResponse, ListObjectsResponse, StorageAccountInfo, };
//# sourceMappingURL=index.d.ts.map