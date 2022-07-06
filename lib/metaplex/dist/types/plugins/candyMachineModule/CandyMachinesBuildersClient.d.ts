import type { Metaplex } from "../../Metaplex";
import { CreateCandyMachineBuilderParams } from './createCandyMachine';
import { InsertItemsToCandyMachineBuilderParams } from './insertItemsToCandyMachine';
import { UpdateCandyMachineBuilderParams } from './updateCandyMachine';
export declare class CandyMachinesBuildersClient {
    protected readonly metaplex: Metaplex;
    constructor(metaplex: Metaplex);
    create(input: CreateCandyMachineBuilderParams): Promise<import("../..").TransactionBuilder<import("./createCandyMachine").CreateCandyMachineBuilderContext>>;
    update(input: UpdateCandyMachineBuilderParams): import("../..").TransactionBuilder<object>;
    insertItems(input: InsertItemsToCandyMachineBuilderParams): import("../..").TransactionBuilder<object>;
}
