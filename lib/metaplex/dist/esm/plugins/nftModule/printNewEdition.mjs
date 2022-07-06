import { Keypair } from '@solana/web3.js';
import BN from 'bn.js';
import { toOriginalEditionAccount } from '../../programs/tokenMetadata/accounts/EditionAccounts.mjs';
import { findEditionMarkerPda } from '../../programs/tokenMetadata/pdas/findEditionMarkerPda.mjs';
import { findEditionPda } from '../../programs/tokenMetadata/pdas/findEditionPda.mjs';
import { createMintNewEditionFromMasterEditionViaVaultProxyInstructionWithSigners } from '../../programs/tokenMetadata/instructions/createMintNewEditionFromMasterEditionViaVaultProxyInstructionWithSigners.mjs';
import { createMintNewEditionFromMasterEditionViaTokenInstructionWithSigners } from '../../programs/tokenMetadata/instructions/createMintNewEditionFromMasterEditionViaTokenInstructionWithSigners.mjs';
import { useOperation } from '../../types/Operation.mjs';
import { findMetadataPda } from '../../programs/tokenMetadata/pdas/findMetadataPda.mjs';
import { findMasterEditionV2Pda } from '../../programs/tokenMetadata/pdas/findMasterEditionV2Pda.mjs';
import { toBigNumber } from '../../types/BigNumber.mjs';
import { findAssociatedTokenAccountPda } from '../tokenModule/pdas.mjs';
import { token } from '../../types/Amount.mjs';
import { TransactionBuilder } from '../../utils/TransactionBuilder.mjs';

// Operation
// -----------------

const Key = 'PrintNewEditionOperation';
const printNewEditionOperation = useOperation(Key);
// -----------------
// Handler
// -----------------
const printNewEditionOperationHandler = {
  handle: async (operation, metaplex) => {
    const {
      originalMint,
      newMint = Keypair.generate(),
      newMintAuthority = metaplex.identity(),
      newUpdateAuthority = newMintAuthority.publicKey,
      newOwner = newMintAuthority.publicKey,
      newFreezeAuthority,
      payer = metaplex.identity(),
      tokenProgram,
      associatedTokenProgram,
      confirmOptions
    } = operation.input; // Original NFT.

    const originalMetadata = findMetadataPda(originalMint);
    const originalEdition = findMasterEditionV2Pda(originalMint);
    const originalEditionAccount = toOriginalEditionAccount(await metaplex.rpc().getAccount(originalEdition), `Ensure the provided mint address for the original NFT [${originalMint.toBase58()}] ` + `is correct and that it has an associated OriginalEdition PDA.`);
    const edition = new BN(originalEditionAccount.data.supply, 'le').add(new BN(1));
    const originalEditionMarkPda = findEditionMarkerPda(originalMint, toBigNumber(edition)); // New NFT.

    const newMetadata = findMetadataPda(newMint.publicKey);
    const newEdition = findEditionPda(newMint.publicKey);
    const sharedInput = {
      edition,
      newMint,
      newMetadata,
      newEdition,
      newMintAuthority,
      newUpdateAuthority,
      newOwner,
      newFreezeAuthority,
      payer,
      originalMetadata,
      originalEdition,
      originalEditionMarkPda,
      tokenProgram,
      associatedTokenProgram
    };
    let transactionBuilder;

    if (operation.input.via === 'vault') {
      transactionBuilder = await printNewEditionBuilder(metaplex, {
        via: 'vault',
        vaultAuthority: operation.input.vaultAuthority,
        safetyDepositStore: operation.input.safetyDepositStore,
        safetyDepositBox: operation.input.safetyDepositBox,
        vault: operation.input.vault,
        tokenVaultProgram: operation.input.tokenVaultProgram,
        ...sharedInput
      });
    } else {
      var _operation$input$orig, _operation$input$orig2;

      const originalTokenAccountOwner = (_operation$input$orig = operation.input.originalTokenAccountOwner) !== null && _operation$input$orig !== void 0 ? _operation$input$orig : metaplex.identity();
      const originalTokenAccount = (_operation$input$orig2 = operation.input.originalTokenAccount) !== null && _operation$input$orig2 !== void 0 ? _operation$input$orig2 : findAssociatedTokenAccountPda(originalMint, originalTokenAccountOwner.publicKey, tokenProgram, associatedTokenProgram);
      transactionBuilder = await printNewEditionBuilder(metaplex, {
        via: 'token',
        originalTokenAccountOwner,
        originalTokenAccount,
        ...sharedInput
      });
    }

    const {
      tokenAddress
    } = transactionBuilder.getContext();
    const {
      signature
    } = await metaplex.rpc().sendAndConfirmTransaction(transactionBuilder, undefined, confirmOptions);
    return {
      mint: newMint,
      metadata: newMetadata,
      edition: newEdition,
      associatedToken: tokenAddress,
      transactionId: signature
    };
  }
}; // -----------------
// Builder
// -----------------

const printNewEditionBuilder = async (metaplex, params) => {
  const {
    // Data.
    edition,
    // New NFT.
    newMint,
    newMetadata,
    newEdition,
    newMintAuthority,
    newUpdateAuthority,
    newOwner,
    newFreezeAuthority,
    payer,
    // Master NFT.
    originalMetadata,
    originalEdition,
    originalEditionMarkPda,
    // Programs.
    tokenProgram,
    associatedTokenProgram,
    // Instruction keys.
    printNewEditionInstructionKey = 'printNewEdition'
  } = params;
  const tokenWithMintBuilder = await metaplex.tokens().builders().createTokenWithMint({
    decimals: 0,
    initialSupply: token(1),
    mint: newMint,
    mintAuthority: newMintAuthority,
    freezeAuthority: newFreezeAuthority !== null && newFreezeAuthority !== void 0 ? newFreezeAuthority : null,
    owner: newOwner,
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
  let printNewEditionInstructionWithSigners;

  if (params.via === 'vault') {
    printNewEditionInstructionWithSigners = createMintNewEditionFromMasterEditionViaVaultProxyInstructionWithSigners({
      edition,
      newMetadata,
      newEdition,
      masterEdition: originalEdition,
      newMint,
      editionMarkPda: originalEditionMarkPda,
      newMintAuthority,
      payer,
      vaultAuthority: params.vaultAuthority,
      safetyDepositStore: params.safetyDepositStore,
      safetyDepositBox: params.safetyDepositBox,
      vault: params.vault,
      newMetadataUpdateAuthority: newUpdateAuthority,
      metadata: originalMetadata,
      tokenVaultProgram: params.tokenVaultProgram,
      instructionKey: printNewEditionInstructionKey
    });
  } else {
    printNewEditionInstructionWithSigners = createMintNewEditionFromMasterEditionViaTokenInstructionWithSigners({
      edition,
      newMetadata,
      newEdition,
      masterEdition: originalEdition,
      newMint,
      editionMarkPda: originalEditionMarkPda,
      newMintAuthority,
      payer,
      tokenAccountOwner: params.originalTokenAccountOwner,
      tokenAccount: params.originalTokenAccount,
      newMetadataUpdateAuthority: newUpdateAuthority,
      metadata: originalMetadata,
      instructionKey: printNewEditionInstructionKey
    });
  }

  return TransactionBuilder.make().setFeePayer(payer).setContext({
    tokenAddress
  }) // Create the mint and token accounts before minting 1 token to the owner.
  .add(tokenWithMintBuilder) // Mint new edition.
  .add(printNewEditionInstructionWithSigners);
};

export { printNewEditionBuilder, printNewEditionOperation, printNewEditionOperationHandler };
//# sourceMappingURL=printNewEdition.mjs.map
