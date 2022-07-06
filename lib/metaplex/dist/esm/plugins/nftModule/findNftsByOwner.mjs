import { findNftsByMintListOperation } from './findNftsByMintList.mjs';
import { TokenProgram } from '../tokenModule/program.mjs';
import { useOperation } from '../../types/Operation.mjs';

// -----------------
// Operation
// -----------------
const Key = 'FindNftsByOwnerOperation';
const findNftsByOwnerOperation = useOperation(Key);
// -----------------
// Handler
// -----------------
const findNftsByOwnerOnChainOperationHandler = {
  handle: async (operation, metaplex) => {
    const owner = operation.input;
    const mints = await TokenProgram.tokenAccounts(metaplex).selectMint().whereOwner(owner).whereAmount(1).getDataAsPublicKeys();
    const nfts = await metaplex.operations().execute(findNftsByMintListOperation(mints));
    return nfts.filter(nft => nft !== null);
  }
};

export { findNftsByOwnerOnChainOperationHandler, findNftsByOwnerOperation };
//# sourceMappingURL=findNftsByOwner.mjs.map
