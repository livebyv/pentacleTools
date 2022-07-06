import { WRAPPED_SOL_MINT } from './constants.mjs';
import assert from '../../utils/assert.mjs';
import { SOL, amount } from '../../types/Amount.mjs';

const isMint = value => typeof value === 'object' && value.model === 'mint';
const assertMint = value => assert(isMint(value), `Expected Mint model`);
const toMint = account => {
  const isWrappedSol = account.publicKey.equals(WRAPPED_SOL_MINT);
  const currency = isWrappedSol ? SOL : {
    symbol: 'Token',
    decimals: account.data.decimals,
    namespace: 'spl-token'
  };
  return {
    model: 'mint',
    address: account.publicKey,
    mintAuthorityAddress: account.data.mintAuthorityOption ? account.data.mintAuthority : null,
    freezeAuthorityAddress: account.data.freezeAuthorityOption ? account.data.freezeAuthority : null,
    decimals: account.data.decimals,
    supply: amount(account.data.supply.toString(), currency),
    isWrappedSol,
    currency
  };
};

export { assertMint, isMint, toMint };
//# sourceMappingURL=Mint.mjs.map
