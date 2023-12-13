import { RequiredCrossChainOptions } from '../../../models/cross-chain-options';

/**
 * @property {RangoSupportedBlockchain[]} swappers List of all accepted swappers (e.g. providers), an empty list means no filter is required
 * @property {boolean} [swappersGroupsExclude] - Defines the provided swappers' tags as the include/exclude list. Default is false (include)
 */
export type RangoCrossChainOptions = RequiredCrossChainOptions & {
    swappersGroupsExclude?: boolean;
};
