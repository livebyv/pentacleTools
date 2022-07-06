import isEqual from 'lodash.isequal';
import { createUpdateCandyMachineInstruction, createUpdateAuthorityInstruction } from '@metaplex-foundation/mpl-candy-machine';
import { toCandyMachineConfigs, toCandyMachineInstructionData } from './CandyMachine.mjs';
import { useOperation } from '../../types/Operation.mjs';
import { NoInstructionsToSendError } from '../../errors/SdkError.mjs';
import { assertSameCurrencies, SOL } from '../../types/Amount.mjs';
import { TransactionBuilder } from '../../utils/TransactionBuilder.mjs';

// Operation
// -----------------

const Key = 'UpdateCandyMachineOperation';
const updateCandyMachineOperation = useOperation(Key);
// -----------------
// Handler
// -----------------
const updateCandyMachineOperationHandler = {
  async handle(operation, metaplex) {
    const builder = updateCandyMachineBuilder(metaplex, operation.input);

    if (builder.isEmpty()) {
      throw new NoInstructionsToSendError(Key);
    }

    return builder.sendAndConfirm(metaplex, operation.input.confirmOptions);
  }

}; // -----------------
// Builder
// -----------------

const updateCandyMachineBuilder = (metaplex, params) => {
  const {
    candyMachine,
    authority = metaplex.identity(),
    newAuthority,
    updateInstructionKey,
    updateAuthorityInstructionKey,
    ...updatableFields
  } = params;
  const currentConfigs = toCandyMachineConfigs(candyMachine);
  const instructionDataWithoutChanges = toCandyMachineInstructionData(candyMachine.address, currentConfigs);
  const instructionData = toCandyMachineInstructionData(candyMachine.address, { ...currentConfigs,
    ...updatableFields
  });
  const {
    data,
    wallet,
    tokenMint
  } = instructionData;
  const shouldSendUpdateInstruction = !isEqual(instructionData, instructionDataWithoutChanges);
  const shouldSendUpdateAuthorityInstruction = !!newAuthority && !newAuthority.equals(authority.publicKey);
  const updateInstruction = createUpdateCandyMachineInstruction({
    candyMachine: candyMachine.address,
    authority: authority.publicKey,
    wallet
  }, {
    data
  });

  if (tokenMint) {
    updateInstruction.keys.push({
      pubkey: tokenMint,
      isWritable: false,
      isSigner: false
    });
  } else if (params.price) {
    assertSameCurrencies(params.price, SOL);
  }

  return TransactionBuilder.make() // Update data.
  .when(shouldSendUpdateInstruction, builder => builder.add({
    instruction: updateInstruction,
    signers: [authority],
    key: updateInstructionKey !== null && updateInstructionKey !== void 0 ? updateInstructionKey : 'update'
  })) // Update authority.
  .when(shouldSendUpdateAuthorityInstruction, builder => builder.add({
    instruction: createUpdateAuthorityInstruction({
      candyMachine: candyMachine.address,
      authority: authority.publicKey,
      wallet: candyMachine.walletAddress
    }, {
      newAuthority: newAuthority
    }),
    signers: [authority],
    key: updateAuthorityInstructionKey !== null && updateAuthorityInstructionKey !== void 0 ? updateAuthorityInstructionKey : 'updateAuthority'
  }));
};

export { updateCandyMachineBuilder, updateCandyMachineOperation, updateCandyMachineOperationHandler };
//# sourceMappingURL=updateCandyMachine.mjs.map
