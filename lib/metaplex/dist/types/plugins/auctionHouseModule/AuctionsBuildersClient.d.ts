import type { Metaplex } from "../../Metaplex";
import { CreateAuctionHouseBuilderParams } from './createAuctionHouse';
import { CreateListingBuilderParams } from './createListing';
import { UpdateAuctionHouseBuilderParams } from './updateAuctionHouse';
export declare class AuctionsBuildersClient {
    protected readonly metaplex: Metaplex;
    constructor(metaplex: Metaplex);
    createAuctionHouse(input: CreateAuctionHouseBuilderParams): import("../..").TransactionBuilder<import("./createAuctionHouse").CreateAuctionHouseBuilderContext>;
    updateAuctionHouse(input: UpdateAuctionHouseBuilderParams): import("../..").TransactionBuilder<object>;
    createListing(input: CreateListingBuilderParams): import("../..").TransactionBuilder<import("./createListing").CreateListingBuilderContext>;
}
