import { AuctionHouse, ListingReceipt } from '@metaplex-foundation/mpl-auction-house';
import { getAccountParsingFunction, getAccountParsingAndAssertingFunction } from '../../types/Account.mjs';

const parseAuctionHouseAccount = getAccountParsingFunction(AuctionHouse);
const toAuctionHouseAccount = getAccountParsingAndAssertingFunction(AuctionHouse);
const parseListingReceiptAccount = getAccountParsingFunction(ListingReceipt);
const toListingReceiptAccount = getAccountParsingAndAssertingFunction(ListingReceipt);

export { parseAuctionHouseAccount, parseListingReceiptAccount, toAuctionHouseAccount, toListingReceiptAccount };
//# sourceMappingURL=accounts.mjs.map
