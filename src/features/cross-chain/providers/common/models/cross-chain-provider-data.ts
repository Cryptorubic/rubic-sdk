import { WrappedCrossChainTrade } from 'src/features/cross-chain/providers/common/models/wrapped-cross-chain-trade';

/**
 * Cross chain providers data.
 */
export interface CrossChainProviderData {
    /**
     * Best cross chain provider wrapped trade or null in case of strong error.
     */
    bestProvider: WrappedCrossChainTrade | null;

    /**
     * Total amount of providers to calculate.
     */
    totalProviders: number;

    /**
     * Calculated amount of providers at current moment.
     */
    calculatedProviders: number;

    /**
     * Array of all calculated providers.
     */
    allProviders: ReadonlyArray<WrappedCrossChainTrade>;
}
