import { MetaplexError } from '../../errors/MetaplexError.mjs';

class CandyMachineError extends MetaplexError {
  constructor(input) {
    super({ ...input,
      key: `plugin.candy_machine.${input.key}`,
      title: `Candy Machine > ${input.title}`,
      source: 'plugin',
      sourceDetails: 'Candy Machine'
    });
  }

}
class CandyMachineIsFullError extends CandyMachineError {
  constructor(assetIndex, itemsAvailable, cause) {
    super({
      cause,
      key: 'candy_machine_is_full',
      title: 'Candy Machine Is Full',
      problem: `Trying to add asset number ${assetIndex.addn(1)}, but ` + `candy machine only can hold ${itemsAvailable} assets.`,
      solution: 'Limit number of assets you are adding or create a new Candy Machine that can hold more.'
    });
  }

}
class CandyMachineCannotAddAmountError extends CandyMachineError {
  constructor(index, amount, itemsAvailable, cause) {
    super({
      cause,
      key: 'candy_machine_cannot_add_amount',
      title: 'Candy Machine Cannot Add Amount',
      problem: `Trying to add ${amount} assets to candy machine that already has ${index} assets and can only hold ${itemsAvailable} assets.`,
      solution: 'Limit number of assets you are adding or create a new Candy Machine that can hold more.'
    });
  }

}
class CandyMachineAddItemConstraintsViolatedError extends CandyMachineError {
  constructor(index, item, cause) {
    super({
      cause,
      key: 'candy_machine_add_item_constraints_violated',
      title: 'Candy Machine Add Item Constraints Violated',
      problem: `Trying to add an asset with name "${item.name}" and uri: "${item.uri}" to candy machine at index ${index} that violates constraints.`,
      solution: 'Fix the name or URI of this asset and try again.'
    });
  }

}

export { CandyMachineAddItemConstraintsViolatedError, CandyMachineCannotAddAmountError, CandyMachineError, CandyMachineIsFullError };
//# sourceMappingURL=errors.mjs.map
