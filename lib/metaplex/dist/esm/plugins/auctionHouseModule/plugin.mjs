import { cusper } from '@metaplex-foundation/mpl-auction-house';
import { AuctionsClient } from './AuctionsClient.mjs';
import { AuctionHouseProgram } from './program.mjs';
import { createAuctionHouseOperation, createAuctionHouseOperationHandler } from './createAuctionHouse.mjs';
import { createListingOperation, createListingOperationHandler } from './createListing.mjs';
import { findAuctionHouseByAddressOperation, findAuctionHouseByAddressOperationHandler } from './findAuctionHouseByAddress.mjs';
import { updateAuctionHouseOperation, updateAuctionHouseOperationHandler } from './updateAuctionHouse.mjs';
import { loadListingOperation, loadListingOperationHandler } from './loadListing.mjs';
import { findListingByAddressOperation, findListingByAddressOperationHandler } from './findListingByAddress.mjs';

const auctionHouseModule = () => ({
  install(metaplex) {
    // Auction House Program.
    metaplex.programs().register({
      name: 'AuctionHouseProgram',
      address: AuctionHouseProgram.publicKey,
      errorResolver: error => cusper.errorFromProgramLogs(error.logs, false)
    });
    const op = metaplex.operations();
    op.register(createAuctionHouseOperation, createAuctionHouseOperationHandler);
    op.register(createListingOperation, createListingOperationHandler);
    op.register(findAuctionHouseByAddressOperation, findAuctionHouseByAddressOperationHandler);
    op.register(findListingByAddressOperation, findListingByAddressOperationHandler);
    op.register(loadListingOperation, loadListingOperationHandler);
    op.register(updateAuctionHouseOperation, updateAuctionHouseOperationHandler);

    metaplex.auctions = function () {
      return new AuctionsClient(this);
    };
  }

});

export { auctionHouseModule };
//# sourceMappingURL=plugin.mjs.map
