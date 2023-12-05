import { RangoSupportedBlockchain } from 'src/features/common/providers/rango/models/rango-supported-blockchains';

import { RequiredOnChainCalculationOptions } from '../../common/models/on-chain-calculation-options';

export type RangoOnChainOptions = RequiredOnChainCalculationOptions & {
    /**
     * List of all accepted swappers (e.g. providers), an empty list means no filter is required
     */
    swappers?: RangoSupportedBlockchain[];
    /**
     * Indicates include/exclude mode for the swappers param
     */
    swappersExclude?: boolean;
};
