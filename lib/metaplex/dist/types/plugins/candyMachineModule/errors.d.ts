import { MetaplexError, MetaplexErrorInputWithoutSource } from "../../errors";
import { CandyMachineItem } from './CandyMachine';
import { BigNumber } from "../../types";
export declare class CandyMachineError extends MetaplexError {
    constructor(input: MetaplexErrorInputWithoutSource);
}
export declare class CandyMachineIsFullError extends CandyMachineError {
    constructor(assetIndex: BigNumber, itemsAvailable: BigNumber, cause?: Error);
}
export declare class CandyMachineCannotAddAmountError extends CandyMachineError {
    constructor(index: BigNumber, amount: number, itemsAvailable: BigNumber, cause?: Error);
}
export declare class CandyMachineAddItemConstraintsViolatedError extends CandyMachineError {
    constructor(index: BigNumber, item: CandyMachineItem, cause?: Error);
}
