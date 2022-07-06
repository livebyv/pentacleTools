import { createCandyMachineOperation } from './createCandyMachine.mjs';
import { toCandyMachineConfigsFromJson } from './CandyMachineJsonConfigs.mjs';
import { findCandyMachineByAddressOperation } from './findCandyMachineByAddress.mjs';
import { findCandyMachinesByPublicKeyFieldOperation } from './findCandyMachinesByPublicKeyField.mjs';
import { updateCandyMachineOperation } from './updateCandyMachine.mjs';
import { insertItemsToCandyMachineOperation } from './insertItemsToCandyMachine.mjs';
import { CandyMachinesBuildersClient } from './CandyMachinesBuildersClient.mjs';
import { Task } from '../../utils/Task.mjs';

class CandyMachinesClient {
  constructor(metaplex) {
    this.metaplex = metaplex;
  }

  builders() {
    return new CandyMachinesBuildersClient(this.metaplex);
  }

  create(input) {
    return new Task(async scope => {
      const operation = createCandyMachineOperation(input);
      const output = await this.metaplex.operations().execute(operation, scope);
      scope.throwIfCanceled();
      const candyMachine = await this.findByAddress(output.candyMachineSigner.publicKey).run(scope);
      return { ...output,
        candyMachine
      };
    });
  }

  createFromJsonConfig(input) {
    const {
      json,
      ...otherInputs
    } = input;
    const configs = toCandyMachineConfigsFromJson(json);
    return this.create({ ...otherInputs,
      ...configs
    });
  }

  findAllByWallet(wallet, options) {
    return this.metaplex.operations().getTask(findCandyMachinesByPublicKeyFieldOperation({
      type: 'wallet',
      publicKey: wallet,
      ...options
    }));
  }

  findAllByAuthority(authority, options) {
    return this.metaplex.operations().getTask(findCandyMachinesByPublicKeyFieldOperation({
      type: 'authority',
      publicKey: authority,
      ...options
    }));
  }

  findByAddress(address, options) {
    return this.metaplex.operations().getTask(findCandyMachineByAddressOperation({
      address,
      ...options
    }));
  }

  insertItems(candyMachine, input) {
    return new Task(async scope => {
      const operation = insertItemsToCandyMachineOperation({
        candyMachine,
        ...input
      });
      const output = await this.metaplex.operations().execute(operation, scope);
      scope.throwIfCanceled();
      const updatedCandyMachine = await this.findByAddress(candyMachine.address).run();
      return {
        candyMachine: updatedCandyMachine,
        ...output
      };
    });
  }

  update(candyMachine, input) {
    return new Task(async scope => {
      const output = await this.metaplex.operations().execute(updateCandyMachineOperation({
        candyMachine,
        ...input
      }), scope);
      scope.throwIfCanceled();
      const updatedCandyMachine = await this.findByAddress(candyMachine.address).run();
      return {
        candyMachine: updatedCandyMachine,
        ...output
      };
    });
  }

  updateFromJsonConfig(candyMachine, input) {
    const {
      json,
      ...otherInputs
    } = input;
    const configs = toCandyMachineConfigsFromJson(json);
    return this.update(candyMachine, { ...otherInputs,
      ...configs
    });
  }

}

export { CandyMachinesClient };
//# sourceMappingURL=CandyMachinesClient.mjs.map
