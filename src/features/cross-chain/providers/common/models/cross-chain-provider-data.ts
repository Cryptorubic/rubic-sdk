import { WrappedTradeOrNull } from 'src/features/cross-chain/providers/common/models/wrapped-trade-or-null';

/**
 * Cross chain providers data.
 */
export interface CrossChainProviderData {
    /**
     * Total amount of providers to calculate.
     */
    total: number;

    /**
     * Calculated amount of providers at current moment.
     */
    calculated: number;

    /**
     * Array of all calculated providers.
     */
    data: ReadonlyArray<WrappedTradeOrNull>;
}
