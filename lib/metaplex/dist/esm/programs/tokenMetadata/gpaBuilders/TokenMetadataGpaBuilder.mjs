import { PROGRAM_ID } from '@metaplex-foundation/mpl-token-metadata';
import { GpaBuilder } from '../../../utils/GpaBuilder.mjs';
import { toBigNumber } from '../../../types/BigNumber.mjs';

class TokenMetadataGpaBuilder extends GpaBuilder {
  constructor(metaplex, programId) {
    super(metaplex, programId !== null && programId !== void 0 ? programId : PROGRAM_ID);
  }

  whereKey(key) {
    return this.where(0, toBigNumber(key, 'le'));
  }

}

export { TokenMetadataGpaBuilder };
//# sourceMappingURL=TokenMetadataGpaBuilder.mjs.map
