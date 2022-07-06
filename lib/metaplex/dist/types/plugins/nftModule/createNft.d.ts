import { ConfirmOptions, PublicKey } from '@solana/web3.js';
import { bignum } from '@metaplex-foundation/beet';
import { Creator, Collection, Uses, DataV2 } from '@metaplex-foundation/mpl-token-metadata';
import { Metaplex } from "../../Metaplex";
import { Operation, Signer, OperationHandler } from "../../types";
import { TransactionBuilder } from "../../utils";
declare const Key: "CreateNftOperation";
export declare const createNftOperation: import("../../types").OperationConstructor<CreateNftOperation, "CreateNftOperation", CreateNftInput, CreateNftOutput>;
export declare type CreateNftOperation = Operation<typeof Key, CreateNftInput, CreateNftOutput>;
export interface CreateNftInput {
    uri: string;
    name?: string;
    symbol?: string;
    sellerFeeBasisPoints?: number;
    creators?: Creator[];
    collection?: Collection;
    uses?: Uses;
    isMutable?: boolean;
    maxSupply?: bignum;
    mint?: Signer;
    payer?: Signer;
    mintAuthority?: Signer;
    updateAuthority?: Signer;
    owner?: PublicKey;
    freezeAuthority?: PublicKey;
    tokenProgram?: PublicKey;
    associatedTokenProgram?: PublicKey;
    confirmOptions?: ConfirmOptions;
}
export interface CreateNftOutput {
    mint: Signer;
    metadata: PublicKey;
    masterEdition: PublicKey;
    associatedToken: PublicKey;
    transactionId: string;
}
export declare const createNftOperationHandler: OperationHandler<CreateNftOperation>;
export declare type CreateNftBuilderParams = {
    data: DataV2;
    isMutable?: boolean;
    maxSupply?: bignum;
    mint: Signer;
    payer: Signer;
    mintAuthority: Signer;
    updateAuthority?: Signer;
    owner: PublicKey;
    freezeAuthority?: PublicKey;
    metadata: PublicKey;
    masterEdition: PublicKey;
    tokenProgram?: PublicKey;
    associatedTokenProgram?: PublicKey;
    createMintAccountInstructionKey?: string;
    initializeMintInstructionKey?: string;
    createAssociatedTokenAccountInstructionKey?: string;
    createTokenAccountInstructionKey?: string;
    initializeTokenInstructionKey?: string;
    mintTokensInstructionKey?: string;
    createMetadataInstructionKey?: string;
    createMasterEditionInstructionKey?: string;
};
export declare type CreateNftBuilderContext = {
    tokenAddress: PublicKey;
};
export declare const createNftBuilder: (metaplex: Metaplex, params: CreateNftBuilderParams) => Promise<TransactionBuilder<CreateNftBuilderContext>>;
export {};
