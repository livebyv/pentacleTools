import { CandyMachine } from '@metaplex-foundation/mpl-candy-machine';
import { Account } from "../../types";
export declare type CandyMachineAccount = Account<CandyMachine>;
export declare const parseCandyMachineAccount: import("../../types").AccountParsingFunction<CandyMachine>;
export declare const toCandyMachineAccount: import("../../types").AccountParsingAndAssertingFunction<CandyMachine>;
