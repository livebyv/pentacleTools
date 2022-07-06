import { ConfirmOptions, PublicKey } from '@solana/web3.js';
import { Creator } from '@metaplex-foundation/mpl-candy-machine';
import { Metaplex } from "../../Metaplex";
import { Operation, Signer, OperationHandler } from "../../types";
import { RequiredKeys, TransactionBuilder } from "../../utils";
import { SendAndConfirmTransactionResponse } from '../rpcModule';
import { CandyMachineConfigs } from './CandyMachine';
declare const Key: "CreateCandyMachineOperation";
export declare const createCandyMachineOperation: import("../../types").OperationConstructor<CreateCandyMachineOperation, "CreateCandyMachineOperation", CreateCandyMachineInput, CreateCandyMachineOutput>;
export declare type CreateCandyMachineOperation = Operation<typeof Key, CreateCandyMachineInput, CreateCandyMachineOutput>;
export declare type CreateCandyMachineInputWithoutConfigs = {
    candyMachine?: Signer;
    payer?: Signer;
    authority?: PublicKey;
    confirmOptions?: ConfirmOptions;
};
export declare type CreateCandyMachineInput = CreateCandyMachineInputWithoutConfigs & RequiredKeys<Partial<CandyMachineConfigs>, 'price' | 'sellerFeeBasisPoints' | 'itemsAvailable'>;
export declare type CreateCandyMachineOutput = {
    response: SendAndConfirmTransactionResponse;
    candyMachineSigner: Signer;
    payer: Signer;
    wallet: PublicKey;
    authority: PublicKey;
    creators: Creator[];
};
export declare const createCandyMachineOperationHandler: OperationHandler<CreateCandyMachineOperation>;
export declare type CreateCandyMachineBuilderParams = Omit<CreateCandyMachineInput, 'confirmOptions'> & {
    createAccountInstructionKey?: string;
    initializeCandyMachineInstructionKey?: string;
};
export declare type CreateCandyMachineBuilderContext = Omit<CreateCandyMachineOutput, 'response'>;
export declare const createCandyMachineBuilder: (metaplex: Metaplex, params: CreateCandyMachineBuilderParams) => Promise<TransactionBuilder<CreateCandyMachineBuilderContext>>;
export {};
