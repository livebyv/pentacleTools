import { Buffer } from 'buffer';
import { TokenMetadataProgram } from '../TokenMetadataProgram.mjs';
import { Pda } from '../../../types/Pda.mjs';
import { toBigNumber } from '../../../types/BigNumber.mjs';

const findEditionMarkerPda = (mint, edition, programId = TokenMetadataProgram.publicKey) => {
  return Pda.find(programId, [Buffer.from('metadata', 'utf8'), programId.toBuffer(), mint.toBuffer(), Buffer.from('edition', 'utf8'), Buffer.from(edition.div(toBigNumber(248)).toString())]);
};

export { findEditionMarkerPda };
//# sourceMappingURL=findEditionMarkerPda.mjs.map
