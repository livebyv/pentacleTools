import { createAuctionHouseBuilder } from './createAuctionHouse.mjs';
import { createListingBuilder } from './createListing.mjs';
import { updateAuctionHouseBuilder } from './updateAuctionHouse.mjs';

class AuctionsBuildersClient {
  constructor(metaplex) {
    this.metaplex = metaplex;
  }

  createAuctionHouse(input) {
    return createAuctionHouseBuilder(this.metaplex, input);
  }

  updateAuctionHouse(input) {
    return updateAuctionHouseBuilder(this.metaplex, input);
  }

  createListing(input) {
    return createListingBuilder(this.metaplex, input);
  }

}

export { AuctionsBuildersClient };
//# sourceMappingURL=AuctionsBuildersClient.mjs.map
