import { WrappedOnChainTradeOrNull } from 'src/features/on-chain/calculation-manager/models/wrapped-on-chain-trade-or-null';

/**
 * On-chain providers data.
 */
export interface OnChainReactivelyCalculatedTradeData {
    /**
     * Total amount of providers to calculate.
     */
    total: number;

    /**
     * Calculated amount of providers at current moment.
     */
    calculated: number;

    /**
     * Last calculated trade.
     */
    wrappedTrade: WrappedOnChainTradeOrNull;
}
