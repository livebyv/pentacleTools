import { toMetadata, toTokenWithMetadata } from './Metadata.mjs';
import { useOperation } from '../../types/Operation.mjs';
import { findMetadataPda } from '../../programs/tokenMetadata/pdas/findMetadataPda.mjs';
import { findAssociatedTokenAccountPda } from '../tokenModule/pdas.mjs';
import { toMintAccount, toTokenAccount } from '../tokenModule/accounts.mjs';
import { parseMetadataAccount } from '../../programs/tokenMetadata/accounts/MetadataAccount.mjs';
import { toMint } from '../tokenModule/Mint.mjs';
import { toTokenWithMint } from '../tokenModule/Token.mjs';

// -----------------
// Operation
// -----------------
const Key = 'FindTokenWithMetadataByMintOperation';
const findTokenWithMetadataByMintOperation = useOperation(Key);
// -----------------
// Handler
// -----------------
const findTokenWithMetadataByMintOperationHandler = {
  handle: async (operation, metaplex, scope) => {
    const {
      mintAddress,
      ownerAddress,
      commitment,
      loadJsonMetadata = true
    } = operation.input;
    const metadataAddress = findMetadataPda(mintAddress);
    const tokenAddress = findAssociatedTokenAccountPda(mintAddress, ownerAddress);
    const accounts = await metaplex.rpc().getMultipleAccounts([mintAddress, metadataAddress, tokenAddress], commitment);
    const mintAccount = toMintAccount(accounts[0]);
    const metadataAccount = parseMetadataAccount(accounts[1]);
    const tokenAccount = toTokenAccount(accounts[2]);
    const mintModel = toMint(mintAccount);

    if (!metadataAccount.exists) {
      return toTokenWithMint(tokenAccount, mintModel);
    }

    let metadataModel = toMetadata(metadataAccount);

    if (loadJsonMetadata) {
      metadataModel = await metaplex.nfts().loadJsonMetadata(metadataModel).run(scope);
    }

    return toTokenWithMetadata(tokenAccount, mintModel, metadataModel);
  }
};

export { findTokenWithMetadataByMintOperation, findTokenWithMetadataByMintOperationHandler };
//# sourceMappingURL=findTokenWithMetadataByMint.mjs.map
