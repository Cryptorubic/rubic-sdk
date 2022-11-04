import { WrappedCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/common/models/wrapped-cross-chain-trade';

/**
 * Cross-chain providers data.
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
     * Sorted array of calculated trades.
     */
    trades: ReadonlyArray<WrappedCrossChainTrade>;
}
