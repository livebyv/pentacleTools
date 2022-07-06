import { toMetadata, toMintWithMetadata } from './Metadata.mjs';
import { toMetadataAccount } from '../../programs/tokenMetadata/accounts/MetadataAccount.mjs';
import { useOperation } from '../../types/Operation.mjs';
import { toMintAccount } from '../tokenModule/accounts.mjs';

// -----------------
// Operation
// -----------------
const Key = 'FindMintWithMetadataByMetadataOperation';
const findMintWithMetadataByMetadataOperation = useOperation(Key);
// -----------------
// Handler
// -----------------
const findMintWithMetadataByMetadataOperationHandler = {
  handle: async (operation, metaplex, scope) => {
    const {
      metadataAddress,
      commitment,
      loadJsonMetadata = true
    } = operation.input;
    const metadataAccount = toMetadataAccount(await metaplex.rpc().getAccount(metadataAddress, commitment));
    const mintAccount = toMintAccount(await metaplex.rpc().getAccount(metadataAccount.data.mint, commitment));
    let metadataModel = toMetadata(metadataAccount);

    if (loadJsonMetadata) {
      metadataModel = await metaplex.nfts().loadJsonMetadata(metadataModel).run(scope);
    }

    return toMintWithMetadata(mintAccount, metadataModel);
  }
};

export { findMintWithMetadataByMetadataOperation, findMintWithMetadataByMetadataOperationHandler };
//# sourceMappingURL=findMintWithMetadataByMetadata.mjs.map
