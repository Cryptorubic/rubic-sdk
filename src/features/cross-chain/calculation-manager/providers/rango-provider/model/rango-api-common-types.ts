import { RequiredCrossChainOptions } from '../../../models/cross-chain-options';
import { RangoCrossChainSupportedBlockchain } from './rango-cross-chain-supported-blockchains';

/**
 * @property {RangoCrossChainSupportedBlockchain[]} swappers List of all accepted swappers (e.g. providers), an empty list means no filter is required
 * @property {boolean} [swappersExclude] - Indicates include/exclude mode for the swappers param
 */
export type RangoCrossChainOptions = RequiredCrossChainOptions & {
    swappers?: RangoCrossChainSupportedBlockchain[];
    swappersExclude?: boolean;
};

export const RangoRoutingResult = {
    OK: 'OK',
    HIGH_IMPACT: 'HIGH_IMPACT',
    NO_ROUTE: 'NO_ROUTE',
    INPUT_LIMIT_ISSUE: 'INPUT_LIMIT_ISSUE'
} as const;

export interface HttpClientParams {
    [param: string]: string | number | boolean | readonly (string | number | boolean)[];
}

export type SwapperType = 'BRIDGE' | 'DEX' | 'AGGREGATOR';

export type ExpenseType = 'FROM_SOURCE_WALLET' | 'DECREASE_FROM_OUTPUT' | 'FROM_DESTINATION_WALLET';

export type AmountRestrictionType = 'INCLUSIVE' | 'EXCLUSIVE';

export type RoutingResultType = (typeof RangoRoutingResult)[keyof typeof RangoRoutingResult];
