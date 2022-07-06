import type { PublicKey } from '@solana/web3.js';
import { Amount, Currency } from "../../types";
import { Option } from "../../utils";
import { MintAccount } from './accounts';
export declare type Mint = Readonly<{
    model: 'mint';
    address: PublicKey;
    mintAuthorityAddress: Option<PublicKey>;
    freezeAuthorityAddress: Option<PublicKey>;
    decimals: number;
    supply: Amount;
    isWrappedSol: boolean;
    currency: Currency;
}>;
export declare const isMint: (value: any) => value is Readonly<{
    model: 'mint';
    address: PublicKey;
    mintAuthorityAddress: Option<PublicKey>;
    freezeAuthorityAddress: Option<PublicKey>;
    decimals: number;
    supply: Amount;
    isWrappedSol: boolean;
    currency: Currency;
}>;
export declare const assertMint: (value: any) => asserts value is Readonly<{
    model: 'mint';
    address: PublicKey;
    mintAuthorityAddress: Option<PublicKey>;
    freezeAuthorityAddress: Option<PublicKey>;
    decimals: number;
    supply: Amount;
    isWrappedSol: boolean;
    currency: Currency;
}>;
export declare const toMint: (account: MintAccount) => Mint;
