import { Commitment, PublicKey } from '@solana/web3.js';
import type { Metaplex } from "../../Metaplex";
import { Nft } from './Nft';
import { UploadMetadataInput, UploadMetadataOutput } from './uploadMetadata';
import { CreateNftInput, CreateNftOutput } from './createNft';
import { UpdateNftInput, UpdateNftOutput } from './updateNft';
import { PrintNewEditionOutput, PrintNewEditionSharedInput, PrintNewEditionViaInput } from './printNewEdition';
import { Option, Task } from "../../utils";
import { JsonMetadata } from './JsonMetadata';
export declare class NftClient {
    protected readonly metaplex: Metaplex;
    constructor(metaplex: Metaplex);
    findByMint(mint: PublicKey): Promise<Nft>;
    findAllByMintList(mints: PublicKey[]): Promise<(Nft | null)[]>;
    findAllByOwner(owner: PublicKey): Promise<Nft[]>;
    findAllByCreator(creator: PublicKey, position?: number): Promise<Nft[]>;
    findAllByCandyMachine(candyMachine: PublicKey, version?: 1 | 2): Promise<Nft[]>;
    findMintWithMetadataByAddress(address: PublicKey, options?: {
        loadJsonMetadata?: boolean;
        commitment?: Commitment;
    }): Task<Readonly<{
        model: "mint";
        address: PublicKey;
        mintAuthorityAddress: Option<PublicKey>;
        freezeAuthorityAddress: Option<PublicKey>;
        decimals: number;
        supply: import("../..").Amount;
        isWrappedSol: boolean;
        currency: import("../..").Currency;
    }> | import("./Metadata").MintWithMetadata, []>;
    findMintWithMetadataByMetadata(metadataAddress: PublicKey, options?: {
        loadJsonMetadata?: boolean;
        commitment?: Commitment;
    }): Task<import("./Metadata").MintWithMetadata, []>;
    findTokenWithMetadataByAddress(address: PublicKey, options?: {
        loadJsonMetadata?: boolean;
        commitment?: Commitment;
    }): Task<import("..").TokenWithMint | import("./Metadata").TokenWithMetadata, []>;
    findTokenWithMetadataByMetadata(metadataAddress: PublicKey, ownerAddress: PublicKey, options?: {
        loadJsonMetadata?: boolean;
        commitment?: Commitment;
    }): Task<import("./Metadata").TokenWithMetadata, []>;
    findTokenWithMetadataByMint(mintAddress: PublicKey, ownerAddress: PublicKey, options?: {
        loadJsonMetadata?: boolean;
        commitment?: Commitment;
    }): Task<import("..").TokenWithMint | import("./Metadata").TokenWithMetadata, []>;
    uploadMetadata(input: UploadMetadataInput): Promise<UploadMetadataOutput>;
    create(input: CreateNftInput): Promise<{
        nft: Nft;
    } & CreateNftOutput>;
    update(nft: Nft, input: Omit<UpdateNftInput, 'nft'>): Promise<{
        nft: Nft;
    } & UpdateNftOutput>;
    printNewEdition(originalMint: PublicKey, input?: Omit<PrintNewEditionSharedInput, 'originalMint'> & PrintNewEditionViaInput): Promise<{
        nft: Nft;
    } & PrintNewEditionOutput>;
    loadJsonMetadata<T extends {
        uri: string;
        json: Option<JsonMetadata>;
        jsonLoaded: boolean;
    }>(metadata: T): Task<T & {
        jsonLoaded: true;
    }>;
}
