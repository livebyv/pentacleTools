import { toCandyMachine } from './CandyMachine.mjs';
import { parseCandyMachineAccount } from './accounts.mjs';
import { CandyMachineProgram } from './program.mjs';
import { UnreachableCaseError } from '../../errors/SdkError.mjs';
import { useOperation } from '../../types/Operation.mjs';

// -----------------
// Operation
// -----------------
const Key = 'FindCandyMachinesByPublicKeyOperation';
const findCandyMachinesByPublicKeyFieldOperation = useOperation(Key);
// -----------------
// Handler
// -----------------
const findCandyMachinesByPublicKeyFieldOnChainOperationHandler = {
  handle: async (operation, metaplex) => {
    const {
      type,
      publicKey,
      commitment
    } = operation.input;
    const accounts = CandyMachineProgram.accounts(metaplex).mergeConfig({
      commitment
    });
    let candyMachineQuery;

    switch (type) {
      case 'authority':
        candyMachineQuery = accounts.candyMachineAccountsForAuthority(publicKey);
        break;

      case 'wallet':
        candyMachineQuery = accounts.candyMachineAccountsForWallet(publicKey);
        break;

      default:
        throw new UnreachableCaseError(type);
    }

    const unparsedAccounts = await candyMachineQuery.get();
    return unparsedAccounts.map(unparsedAccount => {
      const account = parseCandyMachineAccount(unparsedAccount);
      return toCandyMachine(account, unparsedAccount);
    });
  }
};

export { findCandyMachinesByPublicKeyFieldOnChainOperationHandler, findCandyMachinesByPublicKeyFieldOperation };
//# sourceMappingURL=findCandyMachinesByPublicKeyField.mjs.map
