import { RubicTypeForRango } from 'src/features/common/providers/rango/models/rango-api-trade-types';

import { RequiredOnChainCalculationOptions } from '../../common/models/on-chain-calculation-options';

export type RangoOnChainOptions = RequiredOnChainCalculationOptions & {
    /**
     * List of all accepted swappers (e.g. providers), an empty list means no filter is required
     */
    swapperGroups?: RubicTypeForRango[];
    /**
     * Indicates include/exclude mode for the swappers param
     */
    swappersGroupsExclude?: boolean;
};
