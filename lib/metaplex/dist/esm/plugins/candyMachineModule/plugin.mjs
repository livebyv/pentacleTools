import { createCandyMachineOperation, createCandyMachineOperationHandler } from './createCandyMachine.mjs';
import { findCandyMachineByAddressOperation, findCandyMachineByAddressOperationHandler } from './findCandyMachineByAddress.mjs';
import { findCandyMachinesByPublicKeyFieldOperation, findCandyMachinesByPublicKeyFieldOnChainOperationHandler } from './findCandyMachinesByPublicKeyField.mjs';
import { insertItemsToCandyMachineOperation, InsertItemsToCandyMachineOperationHandler } from './insertItemsToCandyMachine.mjs';
import { updateCandyMachineOperation, updateCandyMachineOperationHandler } from './updateCandyMachine.mjs';
import { CandyMachinesClient } from './CandyMachinesClient.mjs';

const candyMachineModule = () => ({
  install(metaplex) {
    const op = metaplex.operations();
    op.register(createCandyMachineOperation, createCandyMachineOperationHandler);
    op.register(findCandyMachineByAddressOperation, findCandyMachineByAddressOperationHandler);
    op.register(findCandyMachinesByPublicKeyFieldOperation, findCandyMachinesByPublicKeyFieldOnChainOperationHandler);
    op.register(insertItemsToCandyMachineOperation, InsertItemsToCandyMachineOperationHandler);
    op.register(updateCandyMachineOperation, updateCandyMachineOperationHandler);

    metaplex.candyMachines = function () {
      return new CandyMachinesClient(this);
    };
  }

});

export { candyMachineModule };
//# sourceMappingURL=plugin.mjs.map
