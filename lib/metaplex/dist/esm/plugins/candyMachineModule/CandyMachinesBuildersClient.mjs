import { createCandyMachineBuilder } from './createCandyMachine.mjs';
import { insertItemsToCandyMachineBuilder } from './insertItemsToCandyMachine.mjs';
import { updateCandyMachineBuilder } from './updateCandyMachine.mjs';

class CandyMachinesBuildersClient {
  constructor(metaplex) {
    this.metaplex = metaplex;
  }

  create(input) {
    return createCandyMachineBuilder(this.metaplex, input);
  }

  update(input) {
    return updateCandyMachineBuilder(this.metaplex, input);
  }

  insertItems(input) {
    return insertItemsToCandyMachineBuilder(input);
  }

}

export { CandyMachinesBuildersClient };
//# sourceMappingURL=CandyMachinesBuildersClient.mjs.map
