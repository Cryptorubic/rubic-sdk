import BigNumber from 'bignumber.js';
import { PriceToken } from 'src/common/tokens';

/* AggregatorExtraFee */
export interface OnChainProviderFeeInfo {
    cryptoFee?: {
        amount: BigNumber;
        token: PriceToken;
    };

    platformFee?: {
        percent: number;
        token: PriceToken;
    };
}
