import { ConfirmOptions } from '@solana/web3.js';
import type { Metaplex } from "../../Metaplex";
import { Operation, OperationHandler } from "../../types";
import { TransactionBuilder } from "../../utils";
import { SendAndConfirmTransactionResponse } from '../rpcModule';
declare const Key: "CreateBidOperation";
export declare const createBidOperation: import("../../types").OperationConstructor<CreateBidOperation, "CreateBidOperation", CreateBidInput, CreateBidOutput>;
export declare type CreateBidOperation = Operation<typeof Key, CreateBidInput, CreateBidOutput>;
export declare type CreateBidInput = {
    confirmOptions?: ConfirmOptions;
};
export declare type CreateBidOutput = {
    response: SendAndConfirmTransactionResponse;
};
export declare const createBidOperationHandler: OperationHandler<CreateBidOperation>;
export declare type CreateBidBuilderParams = Omit<CreateBidInput, 'confirmOptions'> & {
    instructionKey?: string;
};
export declare const createBidBuilder: (metaplex: Metaplex, params: CreateBidBuilderParams) => TransactionBuilder;
export {};
