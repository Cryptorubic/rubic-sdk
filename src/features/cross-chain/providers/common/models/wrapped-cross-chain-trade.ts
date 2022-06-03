import BigNumber from 'bignumber.js';
import { CrossChainTrade } from 'src/features';

export interface WrappedCrossChainTrade {
    trade: CrossChainTrade | null;
    minAmountError?: BigNumber;
    maxAmountError?: BigNumber;
}
