import assert from '../../utils/assert.mjs';
import { toMint } from '../tokenModule/Mint.mjs';
import { toTokenWithMint } from '../tokenModule/Token.mjs';
import { findMetadataPda } from '../../programs/tokenMetadata/pdas/findMetadataPda.mjs';
import { removeEmptyChars } from '../../utils/common.mjs';
import { amount } from '../../types/Amount.mjs';

const isMetadata = value => typeof value === 'object' && value.model === 'metadata';
const assertMetadata = value => assert(isMetadata(value), `Expected Metadata model`);
const toMetadata = (account, json) => {
  var _account$data$data$cr;

  return {
    model: 'metadata',
    address: findMetadataPda(account.data.mint),
    mintAddress: account.data.mint,
    updateAuthorityAddress: account.data.updateAuthority,
    json: json !== null && json !== void 0 ? json : null,
    jsonLoaded: json !== undefined,
    name: removeEmptyChars(account.data.data.name),
    symbol: removeEmptyChars(account.data.data.symbol),
    uri: removeEmptyChars(account.data.data.uri),
    isMutable: account.data.isMutable,
    primarySaleHappened: account.data.primarySaleHappened,
    sellerFeeBasisPoints: account.data.data.sellerFeeBasisPoints,
    editionNonce: account.data.editionNonce,
    creators: (_account$data$data$cr = account.data.data.creators) !== null && _account$data$data$cr !== void 0 ? _account$data$data$cr : [],
    tokenStandard: account.data.tokenStandard,
    collection: account.data.collection,
    uses: account.data.uses
  };
};
const isMintWithMetadata = value => typeof value === 'object' && value.model === 'mintWithMetadata';
const assertMintWithMetadata = value => assert(isMintWithMetadata(value), `Expected MintWithMetadata model`);
const toMintWithMetadata = (mintAccount, metadataModel) => {
  const mint = toMint(mintAccount);
  const currency = { ...mint.currency,
    symbol: metadataModel.symbol || 'Token'
  };
  return { ...mint,
    model: 'mintWithMetadata',
    metadata: metadataModel,
    currency,
    supply: amount(mint.supply.basisPoints, currency)
  };
};
const isTokenWithMetadata = value => typeof value === 'object' && value.model === 'tokenWithMetadata';
const assertTokenWithMetadata = value => assert(isTokenWithMetadata(value), `Expected TokenWithMetadata model`);
const toTokenWithMetadata = (tokenAccount, mintModel, metadataModel) => {
  const token = toTokenWithMint(tokenAccount, mintModel);
  const currency = { ...token.mint.currency,
    symbol: metadataModel.symbol || 'Token'
  };
  return { ...token,
    model: 'tokenWithMetadata',
    mint: { ...token.mint,
      currency,
      supply: amount(token.mint.supply.basisPoints, currency)
    },
    metadata: metadataModel,
    amount: amount(token.amount.basisPoints, currency),
    delegateAmount: amount(token.delegateAmount.basisPoints, currency)
  };
};

export { assertMetadata, assertMintWithMetadata, assertTokenWithMetadata, isMetadata, isMintWithMetadata, isTokenWithMetadata, toMetadata, toMintWithMetadata, toTokenWithMetadata };
//# sourceMappingURL=Metadata.mjs.map
