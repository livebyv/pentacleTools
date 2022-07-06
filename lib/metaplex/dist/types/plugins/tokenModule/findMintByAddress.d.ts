import type { Commitment, PublicKey } from '@solana/web3.js';
import { Operation, OperationHandler } from "../../types";
import { Mint } from './Mint';
declare const Key: "FindMintByAddressOperation";
export declare const findMintByAddressOperation: import("../../types").OperationConstructor<FindMintByAddressOperation, "FindMintByAddressOperation", FindMintByAddressInput, Readonly<{
    model: "mint";
    address: PublicKey;
    mintAuthorityAddress: import("../..").Option<PublicKey>;
    freezeAuthorityAddress: import("../..").Option<PublicKey>;
    decimals: number;
    supply: import("@/types").Amount;
    isWrappedSol: boolean;
    currency: import("@/types").Currency;
}>>;
export declare type FindMintByAddressOperation = Operation<typeof Key, FindMintByAddressInput, Mint>;
export declare type FindMintByAddressInput = {
    address: PublicKey;
    commitment?: Commitment;
};
export declare const findMintByAddressOperationHandler: OperationHandler<FindMintByAddressOperation>;
export {};
