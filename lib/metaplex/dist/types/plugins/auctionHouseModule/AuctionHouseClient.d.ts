import { Metaplex } from "../../Metaplex";
import { Signer } from "../../types";
import { Task } from "../../utils";
import { Commitment, PublicKey } from '@solana/web3.js';
import { AuctionHouse } from './AuctionHouse';
import { CreateListingInput, CreateListingOutput } from './createListing';
import { LazyListing, Listing } from './Listing';
declare type WithoutAH<T> = Omit<T, 'auctionHouse' | 'auctioneerAuthority'>;
export declare class AuctionHouseClient {
    protected readonly metaplex: Metaplex;
    protected readonly auctionHouse: AuctionHouse;
    protected readonly auctioneerAuthority?: Signer | undefined;
    constructor(metaplex: Metaplex, auctionHouse: AuctionHouse, auctioneerAuthority?: Signer | undefined);
    list(input: WithoutAH<CreateListingInput>): Task<CreateListingOutput & {
        listing: Listing;
    }>;
    findListingByAddress(address: PublicKey, options?: {
        commitment?: Commitment;
        loadJsonMetadata?: boolean;
    }): Task<Readonly<{
        model: "listing";
        lazy: false;
        auctionHouse: Readonly<{
            model: "auctionHouse";
            address: import("../../types").Pda;
            creatorAddress: PublicKey;
            authorityAddress: PublicKey;
            treasuryMint: Readonly<{
                model: "mint";
                address: PublicKey;
                mintAuthorityAddress: import("../../utils").Option<PublicKey>;
                freezeAuthorityAddress: import("../../utils").Option<PublicKey>;
                decimals: number;
                supply: import("../../types").Amount;
                isWrappedSol: boolean;
                currency: import("../../types").Currency;
            }> | import("..").MintWithMetadata;
            feeAccountAddress: import("../../types").Pda;
            treasuryAccountAddress: import("../../types").Pda;
            feeWithdrawalDestinationAddress: PublicKey;
            treasuryWithdrawalDestinationAddress: PublicKey;
            sellerFeeBasisPoints: number;
            requiresSignOff: boolean;
            canChangeSalePrice: boolean;
            isNative: boolean;
        }>;
        token: import("..").TokenWithMetadata;
        tradeStateAddress: import("../../types").Pda;
        sellerAddress: PublicKey;
        bookkeeperAddress: import("../../utils").Option<PublicKey>;
        receiptAddress: import("../../utils").Option<import("@/types").Pda>;
        purchaseReceiptAddress: import("../../utils").Option<PublicKey>;
        price: import("../../types").Amount;
        tokens: import("../../types").Amount;
        createdAt: import("../../types").DateTime;
        canceledAt: import("../../utils").Option<import("@/types").DateTime>;
    }>, []>;
    loadListing(lazyListing: LazyListing, options?: {
        commitment?: Commitment;
        loadJsonMetadata?: boolean;
    }): Task<Listing>;
    protected addAH<T>(input: WithoutAH<T>): T;
}
export {};
