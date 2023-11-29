import { RangoSupportedBlockchain } from 'src/features/common/providers/rango/models/rango-supported-blockchains';

import { RequiredCrossChainOptions } from '../../../models/cross-chain-options';

/**
 * @property {RangoSupportedBlockchain[]} swappers List of all accepted swappers (e.g. providers), an empty list means no filter is required
 * @property {boolean} [swappersExclude] - Indicates include/exclude mode for the swappers param
 */
export type RangoCrossChainOptions = RequiredCrossChainOptions & {
    swappers?: RangoSupportedBlockchain[];
    swappersExclude?: boolean;
};
