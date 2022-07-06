import { toMetadata, toMintWithMetadata } from './Metadata.mjs';
import { toMintAccount } from '../tokenModule/accounts.mjs';
import { parseMetadataAccount } from '../../programs/tokenMetadata/accounts/MetadataAccount.mjs';
import { useOperation } from '../../types/Operation.mjs';
import { findMetadataPda } from '../../programs/tokenMetadata/pdas/findMetadataPda.mjs';
import { toMint } from '../tokenModule/Mint.mjs';

// -----------------
// Operation
// -----------------
const Key = 'FindMintWithMetadataByAddressOperation';
const findMintWithMetadataByAddressOperation = useOperation(Key);
// -----------------
// Handler
// -----------------
const findMintWithMetadataByAddressOperationHandler = {
  handle: async (operation, metaplex, scope) => {
    const {
      address: mintAddress,
      commitment,
      loadJsonMetadata = true
    } = operation.input;
    const metadataAddress = findMetadataPda(mintAddress);
    const accounts = await metaplex.rpc().getMultipleAccounts([mintAddress, metadataAddress], commitment);
    const mintAccount = toMintAccount(accounts[0]);

    if (!accounts[1].exists) {
      return toMint(mintAccount);
    }

    const metadataAccount = parseMetadataAccount(accounts[1]);
    let metadataModel = toMetadata(metadataAccount);

    if (loadJsonMetadata) {
      metadataModel = await metaplex.nfts().loadJsonMetadata(metadataModel).run(scope);
    }

    return toMintWithMetadata(mintAccount, metadataModel);
  }
};

export { findMintWithMetadataByAddressOperation, findMintWithMetadataByAddressOperationHandler };
//# sourceMappingURL=findMintWithMetadataByAddress.mjs.map
