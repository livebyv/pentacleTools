import { cusper } from '@metaplex-foundation/mpl-token-metadata';
import { NftClient } from './NftClient.mjs';
import { createNftOperation, createNftOperationHandler } from './createNft.mjs';
import { findNftByMintOperation, findNftByMintOnChainOperationHandler } from './findNftByMint.mjs';
import { findNftsByCandyMachineOperation, findNftsByCandyMachineOnChainOperationHandler } from './findNftsByCandyMachine.mjs';
import { findNftsByCreatorOperation, findNftsByCreatorOnChainOperationHandler } from './findNftsByCreator.mjs';
import { findNftsByMintListOperation, findNftsByMintListOnChainOperationHandler } from './findNftsByMintList.mjs';
import { findNftsByOwnerOperation, findNftsByOwnerOnChainOperationHandler } from './findNftsByOwner.mjs';
import { printNewEditionOperation, printNewEditionOperationHandler } from './printNewEdition.mjs';
import { updateNftOperation, updateNftOperationHandler } from './updateNft.mjs';
import { uploadMetadataOperation, uploadMetadataOperationHandler } from './uploadMetadata.mjs';
import { findMintWithMetadataByAddressOperation, findMintWithMetadataByAddressOperationHandler } from './findMintWithMetadataByAddress.mjs';
import { findMintWithMetadataByMetadataOperation, findMintWithMetadataByMetadataOperationHandler } from './findMintWithMetadataByMetadata.mjs';
import { findTokenWithMetadataByAddressOperation, findTokenWithMetadataByAddressOperationHandler } from './findTokenWithMetadataByAddress.mjs';
import { findTokenWithMetadataByMetadataOperation, findTokenWithMetadataByMetadataOperationHandler } from './findTokenWithMetadataByMetadata.mjs';
import { findTokenWithMetadataByMintOperation, findTokenWithMetadataByMintOperationHandler } from './findTokenWithMetadataByMint.mjs';
import { TokenMetadataGpaBuilder } from '../../programs/tokenMetadata/gpaBuilders/TokenMetadataGpaBuilder.mjs';
import { TokenMetadataProgram } from '../../programs/tokenMetadata/TokenMetadataProgram.mjs';

const nftModule = () => ({
  install(metaplex) {
    // Token Metadata Program.
    metaplex.programs().register({
      name: 'TokenMetadataProgram',
      address: TokenMetadataProgram.publicKey,
      errorResolver: error => cusper.errorFromProgramLogs(error.logs, false),
      gpaResolver: metaplex => new TokenMetadataGpaBuilder(metaplex, TokenMetadataProgram.publicKey)
    }); // Operations.

    const op = metaplex.operations();
    op.register(createNftOperation, createNftOperationHandler);
    op.register(findMintWithMetadataByAddressOperation, findMintWithMetadataByAddressOperationHandler);
    op.register(findMintWithMetadataByMetadataOperation, findMintWithMetadataByMetadataOperationHandler);
    op.register(findNftByMintOperation, findNftByMintOnChainOperationHandler);
    op.register(findNftsByCandyMachineOperation, findNftsByCandyMachineOnChainOperationHandler);
    op.register(findNftsByCreatorOperation, findNftsByCreatorOnChainOperationHandler);
    op.register(findNftsByMintListOperation, findNftsByMintListOnChainOperationHandler);
    op.register(findNftsByOwnerOperation, findNftsByOwnerOnChainOperationHandler);
    op.register(findTokenWithMetadataByAddressOperation, findTokenWithMetadataByAddressOperationHandler);
    op.register(findTokenWithMetadataByMetadataOperation, findTokenWithMetadataByMetadataOperationHandler);
    op.register(findTokenWithMetadataByMintOperation, findTokenWithMetadataByMintOperationHandler);
    op.register(printNewEditionOperation, printNewEditionOperationHandler);
    op.register(updateNftOperation, updateNftOperationHandler);
    op.register(uploadMetadataOperation, uploadMetadataOperationHandler);

    metaplex.nfts = function () {
      return new NftClient(this);
    };
  }

});

export { nftModule };
//# sourceMappingURL=plugin.mjs.map
