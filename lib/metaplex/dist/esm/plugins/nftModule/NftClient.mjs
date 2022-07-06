import { findNftByMintOperation } from './findNftByMint.mjs';
import { findNftsByMintListOperation } from './findNftsByMintList.mjs';
import { findNftsByOwnerOperation } from './findNftsByOwner.mjs';
import { findNftsByCreatorOperation } from './findNftsByCreator.mjs';
import { findNftsByCandyMachineOperation } from './findNftsByCandyMachine.mjs';
import { uploadMetadataOperation } from './uploadMetadata.mjs';
import { createNftOperation } from './createNft.mjs';
import { updateNftOperation } from './updateNft.mjs';
import { printNewEditionOperation } from './printNewEdition.mjs';
import { findMintWithMetadataByAddressOperation } from './findMintWithMetadataByAddress.mjs';
import { findMintWithMetadataByMetadataOperation } from './findMintWithMetadataByMetadata.mjs';
import { findTokenWithMetadataByAddressOperation } from './findTokenWithMetadataByAddress.mjs';
import { findTokenWithMetadataByMetadataOperation } from './findTokenWithMetadataByMetadata.mjs';
import { findTokenWithMetadataByMintOperation } from './findTokenWithMetadataByMint.mjs';
import { Task } from '../../utils/Task.mjs';
import { removeEmptyChars } from '../../utils/common.mjs';

class NftClient {
  constructor(metaplex) {
    this.metaplex = metaplex;
  }

  findByMint(mint) {
    return this.metaplex.operations().execute(findNftByMintOperation(mint));
  }

  findAllByMintList(mints) {
    return this.metaplex.operations().execute(findNftsByMintListOperation(mints));
  }

  findAllByOwner(owner) {
    return this.metaplex.operations().execute(findNftsByOwnerOperation(owner));
  }

  findAllByCreator(creator, position = 1) {
    return this.metaplex.operations().execute(findNftsByCreatorOperation({
      creator,
      position
    }));
  }

  findAllByCandyMachine(candyMachine, version) {
    return this.metaplex.operations().execute(findNftsByCandyMachineOperation({
      candyMachine,
      version
    }));
  }

  findMintWithMetadataByAddress(address, options = {}) {
    return this.metaplex.operations().getTask(findMintWithMetadataByAddressOperation({
      address,
      ...options
    }));
  }

  findMintWithMetadataByMetadata(metadataAddress, options = {}) {
    return this.metaplex.operations().getTask(findMintWithMetadataByMetadataOperation({
      metadataAddress,
      ...options
    }));
  }

  findTokenWithMetadataByAddress(address, options = {}) {
    return this.metaplex.operations().getTask(findTokenWithMetadataByAddressOperation({
      address,
      ...options
    }));
  }

  findTokenWithMetadataByMetadata(metadataAddress, ownerAddress, options = {}) {
    return this.metaplex.operations().getTask(findTokenWithMetadataByMetadataOperation({
      metadataAddress,
      ownerAddress,
      ...options
    }));
  }

  findTokenWithMetadataByMint(mintAddress, ownerAddress, options = {}) {
    return this.metaplex.operations().getTask(findTokenWithMetadataByMintOperation({
      mintAddress,
      ownerAddress,
      ...options
    }));
  }

  uploadMetadata(input) {
    return this.metaplex.operations().execute(uploadMetadataOperation(input));
  }

  async create(input) {
    const operation = createNftOperation(input);
    const createNftOutput = await this.metaplex.operations().execute(operation);
    const nft = await this.findByMint(createNftOutput.mint.publicKey);
    return { ...createNftOutput,
      nft
    };
  }

  async update(nft, input) {
    const operation = updateNftOperation({ ...input,
      nft
    });
    const updateNftOutput = await this.metaplex.operations().execute(operation);
    const updatedNft = await this.findByMint(nft.mint);
    return { ...updateNftOutput,
      nft: updatedNft
    };
  }

  async printNewEdition(originalMint, input = {}) {
    const operation = printNewEditionOperation({
      originalMint,
      ...input
    });
    const printNewEditionOutput = await this.metaplex.operations().execute(operation);
    const nft = await this.findByMint(printNewEditionOutput.mint.publicKey);
    return { ...printNewEditionOutput,
      nft
    };
  }

  loadJsonMetadata(metadata) {
    return new Task(async ({
      signal
    }) => {
      const json = await this.metaplex.storage().downloadJson(removeEmptyChars(metadata.uri), {
        signal
      });
      return { ...metadata,
        json,
        jsonLoaded: true
      };
    });
  }

}

export { NftClient };
//# sourceMappingURL=NftClient.mjs.map
