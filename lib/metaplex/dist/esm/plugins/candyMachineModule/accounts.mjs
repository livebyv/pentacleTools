import { CandyMachine } from '@metaplex-foundation/mpl-candy-machine';
import { getAccountParsingFunction, getAccountParsingAndAssertingFunction } from '../../types/Account.mjs';

const parseCandyMachineAccount = getAccountParsingFunction(CandyMachine);
const toCandyMachineAccount = getAccountParsingAndAssertingFunction(CandyMachine);

export { parseCandyMachineAccount, toCandyMachineAccount };
//# sourceMappingURL=accounts.mjs.map
