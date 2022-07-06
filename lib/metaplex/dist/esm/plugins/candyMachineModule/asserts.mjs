import { MAX_NAME_LENGTH, MAX_URI_LENGTH } from './constants.mjs';
import { CandyMachineIsFullError, CandyMachineCannotAddAmountError, CandyMachineAddItemConstraintsViolatedError } from './errors.mjs';
import assert from '../../utils/assert.mjs';
import { toBigNumber } from '../../types/BigNumber.mjs';

const assertName = name => {
  assert(name.length <= MAX_NAME_LENGTH, `Candy Machine name too long: ${name} (max ${MAX_NAME_LENGTH})`);
};
const assertUri = uri => {
  assert(uri.length <= MAX_URI_LENGTH, `Candy Machine URI too long: ${uri} (max ${MAX_URI_LENGTH})`);
};
const assertNotFull = (candyMachine, index) => {
  if (candyMachine.isFullyLoaded) {
    throw new CandyMachineIsFullError(index, candyMachine.itemsAvailable);
  }
};
const assertCanAdd = (candyMachine, index, amount) => {
  if (index.addn(amount).gt(candyMachine.itemsAvailable)) {
    throw new CandyMachineCannotAddAmountError(index, amount, candyMachine.itemsAvailable);
  }
};
const assertAllConfigLineConstraints = configLines => {
  for (let i = 0; i < configLines.length; i++) {
    try {
      assertName(configLines[i].name);
      assertUri(configLines[i].uri);
    } catch (err) {
      throw new CandyMachineAddItemConstraintsViolatedError(toBigNumber(i), configLines[i], err);
    }
  }
};

export { assertAllConfigLineConstraints, assertCanAdd, assertName, assertNotFull, assertUri };
//# sourceMappingURL=asserts.mjs.map
