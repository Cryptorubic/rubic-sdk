import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee';
import BigNumber from 'bignumber.js';

type CommonWayType<T = Number> = { from: T | null; to: T | null } | { total: T } | null;

export interface TradeInfo {
    estimatedGas: BigNumber | null; // in Eth units
    feeInfo: FeeInfo;
    priceImpact: CommonWayType<number>;
    slippage: CommonWayType<number>;
}
