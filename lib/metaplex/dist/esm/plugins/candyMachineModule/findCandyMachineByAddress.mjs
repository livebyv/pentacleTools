import { toCandyMachine } from './CandyMachine.mjs';
import { toCandyMachineAccount } from './accounts.mjs';
import { assertAccountExists } from '../../types/Account.mjs';
import { useOperation } from '../../types/Operation.mjs';

// Operation
// -----------------

const Key = 'FindCandyMachineByAddressOperation';
const findCandyMachineByAddressOperation = useOperation(Key);
// -----------------
// Handler
// -----------------
const findCandyMachineByAddressOperationHandler = {
  handle: async (operation, metaplex) => {
    const {
      address,
      commitment
    } = operation.input;
    const unparsedAccount = await metaplex.rpc().getAccount(address, commitment);
    assertAccountExists(unparsedAccount);
    const account = toCandyMachineAccount(unparsedAccount);
    return toCandyMachine(account, unparsedAccount);
  }
};

export { findCandyMachineByAddressOperation, findCandyMachineByAddressOperationHandler };
//# sourceMappingURL=findCandyMachineByAddress.mjs.map
