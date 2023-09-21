import BigNumber from 'bignumber.js';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { RubicStep } from 'src/features/cross-chain/calculation-manager/providers/common/models/rubicStep';

export interface TradeInfo {
    estimatedGas: BigNumber | null;
    feeInfo: FeeInfo;
    priceImpact: number | null;
    slippage: number;
    routePath: RubicStep[];
}
