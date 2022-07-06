import { PublicKey } from '@solana/web3.js';
import { BigNumber, Pda } from "../../../types";
export declare const findEditionMarkerPda: (mint: PublicKey, edition: BigNumber, programId?: PublicKey) => Pda;
