import { createListingOperation } from './createListing.mjs';
import { findListingByAddressOperation } from './findListingByAddress.mjs';
import { loadListingOperation } from './loadListing.mjs';
import { Task } from '../../utils/Task.mjs';
import { toDateTime } from '../../types/DateTime.mjs';

class AuctionHouseClient {
  constructor(metaplex, auctionHouse, auctioneerAuthority) {
    this.metaplex = metaplex;
    this.auctionHouse = auctionHouse;
    this.auctioneerAuthority = auctioneerAuthority;
  }

  list(input) {
    return new Task(async scope => {
      const output = await this.metaplex.operations().execute(createListingOperation(this.addAH(input)), scope);
      scope.throwIfCanceled();

      try {
        const listing = await this.findListingByAddress(output.sellerTradeState).run(scope);
        return {
          listing,
          ...output
        };
      } catch (error) {// Fallback to manually creating a listing from inputs and outputs.
      }

      scope.throwIfCanceled();
      const lazyListing = {
        model: 'listing',
        lazy: true,
        auctionHouse: this.auctionHouse,
        tradeStateAddress: output.sellerTradeState,
        bookkeeperAddress: input.printReceipt ? output.bookkeeper : null,
        sellerAddress: output.wallet,
        metadataAddress: output.metadata,
        receiptAddress: input.printReceipt ? output.receipt : null,
        purchaseReceiptAddress: null,
        price: output.price,
        tokens: output.tokens.basisPoints,
        createdAt: toDateTime(new Date()),
        canceledAt: null
      };
      return {
        listing: await this.loadListing(lazyListing).run(scope),
        ...output
      };
    });
  }

  findListingByAddress(address, options = {}) {
    return this.metaplex.operations().getTask(findListingByAddressOperation({
      address,
      auctionHouse: this.auctionHouse,
      ...options
    }));
  }

  loadListing(lazyListing, options = {}) {
    return this.metaplex.operations().getTask(loadListingOperation({
      lazyListing,
      ...options
    }));
  }

  addAH(input) {
    return {
      auctionHouse: this.auctionHouse,
      auctioneerAuthority: this.auctioneerAuthority,
      ...input
    };
  }

}

export { AuctionHouseClient };
//# sourceMappingURL=AuctionHouseClient.mjs.map
