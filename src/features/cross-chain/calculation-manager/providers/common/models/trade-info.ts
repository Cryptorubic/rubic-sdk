import BigNumber from 'bignumber.js';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';

type CommonWayType<T = Number> = { from: T | null; to: T | null } | { total: T } | null;

export interface TradeInfo {
    estimatedGas: BigNumber | null; // in Eth units
    feeInfo: FeeInfo;
    priceImpact: CommonWayType<number>;
    slippage: CommonWayType<number>;
}
