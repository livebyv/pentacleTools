import { Metadata } from '@metaplex-foundation/mpl-token-metadata';
import { getAccountParsingFunction, getAccountParsingAndAssertingFunction } from '../../../types/Account.mjs';

const parseMetadataAccount = getAccountParsingFunction(Metadata);
const toMetadataAccount = getAccountParsingAndAssertingFunction(Metadata);

export { parseMetadataAccount, toMetadataAccount };
//# sourceMappingURL=MetadataAccount.mjs.map
