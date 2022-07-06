import { Keypair, PublicKey } from '@solana/web3.js';
import { findMasterEditionV2Pda } from '../../programs/tokenMetadata/pdas/findMasterEditionV2Pda.mjs';
import { createCreateMetadataAccountV2InstructionWithSigners } from '../../programs/tokenMetadata/instructions/createCreateMetadataAccountV2InstructionWithSigners.mjs';
import { createCreateMasterEditionV3InstructionWithSigners } from '../../programs/tokenMetadata/instructions/createCreateMasterEditionV3InstructionWithSigners.mjs';
import { useOperation } from '../../types/Operation.mjs';
import { findMetadataPda } from '../../programs/tokenMetadata/pdas/findMetadataPda.mjs';
import { token } from '../../types/Amount.mjs';
import { TransactionBuilder } from '../../utils/TransactionBuilder.mjs';

// Operation
// -----------------

const Key = 'CreateNftOperation';
const createNftOperation = useOperation(Key);
// -----------------
// Handler
// -----------------
const createNftOperationHandler = {
  handle: async (operation, metaplex) => {
    const {
      uri,
      isMutable,
      maxSupply,
      mint = Keypair.generate(),
      payer = metaplex.identity(),
      mintAuthority = metaplex.identity(),
      updateAuthority = mintAuthority,
      owner = mintAuthority.publicKey,
      freezeAuthority,
      tokenProgram,
      associatedTokenProgram,
      confirmOptions
    } = operation.input;
    let metadata;

    try {
      metadata = await metaplex.storage().downloadJson(uri);
    } catch (e) {
      metadata = {};
    }

    const data = resolveData(operation.input, metadata, updateAuthority.publicKey);
    const metadataPda = findMetadataPda(mint.publicKey);
    const masterEditionPda = findMasterEditionV2Pda(mint.publicKey);
    const builder = await createNftBuilder(metaplex, {
      data,
      isMutable,
      maxSupply,
      mint,
      payer,
      mintAuthority,
      updateAuthority,
      owner,
      freezeAuthority,
      metadata: metadataPda,
      masterEdition: masterEditionPda,
      tokenProgram,
      associatedTokenProgram
    });
    const {
      tokenAddress
    } = builder.getContext();
    const {
      signature
    } = await metaplex.rpc().sendAndConfirmTransaction(builder, undefined, confirmOptions);
    return {
      mint,
      metadata: metadataPda,
      masterEdition: masterEditionPda,
      associatedToken: tokenAddress,
      transactionId: signature
    };
  }
};

const resolveData = (input, metadata, updateAuthority) => {
  var _metadata$properties, _metadata$properties$, _ref, _input$creators, _ref2, _input$name, _ref3, _input$symbol, _ref4, _input$sellerFeeBasis, _input$collection, _input$uses;

  const metadataCreators = (_metadata$properties = metadata.properties) === null || _metadata$properties === void 0 ? void 0 : (_metadata$properties$ = _metadata$properties.creators) === null || _metadata$properties$ === void 0 ? void 0 : _metadata$properties$.filter(creator => creator.address).map(creator => {
    var _creator$share;

    return {
      address: new PublicKey(creator.address),
      share: (_creator$share = creator.share) !== null && _creator$share !== void 0 ? _creator$share : 0,
      verified: false
    };
  });
  let creators = (_ref = (_input$creators = input.creators) !== null && _input$creators !== void 0 ? _input$creators : metadataCreators) !== null && _ref !== void 0 ? _ref : null;

  if (creators === null) {
    creators = [{
      address: updateAuthority,
      share: 100,
      verified: true
    }];
  } else {
    creators = creators.map(creator => {
      if (creator.address.toBase58() === updateAuthority.toBase58()) {
        return { ...creator,
          verified: true
        };
      } else {
        return creator;
      }
    });
  }

  return {
    name: (_ref2 = (_input$name = input.name) !== null && _input$name !== void 0 ? _input$name : metadata.name) !== null && _ref2 !== void 0 ? _ref2 : '',
    symbol: (_ref3 = (_input$symbol = input.symbol) !== null && _input$symbol !== void 0 ? _input$symbol : metadata.symbol) !== null && _ref3 !== void 0 ? _ref3 : '',
    uri: input.uri,
    sellerFeeBasisPoints: (_ref4 = (_input$sellerFeeBasis = input.sellerFeeBasisPoints) !== null && _input$sellerFeeBasis !== void 0 ? _input$sellerFeeBasis : metadata.seller_fee_basis_points) !== null && _ref4 !== void 0 ? _ref4 : 500,
    creators,
    collection: (_input$collection = input.collection) !== null && _input$collection !== void 0 ? _input$collection : null,
    uses: (_input$uses = input.uses) !== null && _input$uses !== void 0 ? _input$uses : null
  };
}; // -----------------
// Builder
// -----------------


const createNftBuilder = async (metaplex, params) => {
  var _params$createMetadat, _params$createMasterE;

  const {
    data,
    isMutable,
    maxSupply,
    mint,
    payer,
    mintAuthority,
    updateAuthority = mintAuthority,
    owner,
    freezeAuthority,
    metadata,
    masterEdition,
    tokenProgram,
    associatedTokenProgram
  } = params;
  const tokenWithMintBuilder = await metaplex.tokens().builders().createTokenWithMint({
    decimals: 0,
    initialSupply: token(1),
    mint,
    mintAuthority,
    freezeAuthority: freezeAuthority !== null && freezeAuthority !== void 0 ? freezeAuthority : null,
    owner,
    payer,
    tokenProgram,
    associatedTokenProgram,
    createMintAccountInstructionKey: params.createMintAccountInstructionKey,
    initializeMintInstructionKey: params.initializeMintInstructionKey,
    createAssociatedTokenAccountInstructionKey: params.createAssociatedTokenAccountInstructionKey,
    createTokenAccountInstructionKey: params.createTokenAccountInstructionKey,
    initializeTokenInstructionKey: params.initializeTokenInstructionKey,
    mintTokensInstructionKey: params.mintTokensInstructionKey
  });
  const {
    tokenAddress
  } = tokenWithMintBuilder.getContext();
  return TransactionBuilder.make().setFeePayer(payer).setContext({
    tokenAddress
  }) // Create the mint and token accounts before minting 1 token to the owner.
  .add(tokenWithMintBuilder) // Create metadata account.
  .add(createCreateMetadataAccountV2InstructionWithSigners({
    data,
    isMutable,
    mintAuthority,
    payer,
    mint: mint.publicKey,
    metadata,
    updateAuthority: updateAuthority.publicKey,
    instructionKey: (_params$createMetadat = params.createMetadataInstructionKey) !== null && _params$createMetadat !== void 0 ? _params$createMetadat : 'createMetadata'
  })) // Create master edition account (prevents further minting).
  .add(createCreateMasterEditionV3InstructionWithSigners({
    maxSupply,
    payer,
    mintAuthority,
    updateAuthority,
    mint: mint.publicKey,
    metadata,
    masterEdition,
    instructionKey: (_params$createMasterE = params.createMasterEditionInstructionKey) !== null && _params$createMasterE !== void 0 ? _params$createMasterE : 'createMasterEdition'
  }));
};

export { createNftBuilder, createNftOperation, createNftOperationHandler };
//# sourceMappingURL=createNft.mjs.map
