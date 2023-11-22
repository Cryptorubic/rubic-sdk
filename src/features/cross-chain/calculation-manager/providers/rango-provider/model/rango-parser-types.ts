import BigNumber from 'bignumber.js';
import { PriceTokenAmount } from 'src/common/tokens';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';

import { FeeInfo } from '../../common/models/fee-info';
import { RubicStep } from '../../common/models/rubicStep';
import { RangoCrossChainOptions, RangoSwapQueryParams } from './rango-types';

export interface GetTradeConstructorParamsType {
    fromToken: PriceTokenAmount<EvmBlockchainName>;
    toToken: PriceTokenAmount<EvmBlockchainName>;
    options: RangoCrossChainOptions;
    routePath: RubicStep[];
    feeInfo: FeeInfo;
    toTokenAmountMin: BigNumber;
    swapQueryParams: RangoSwapQueryParams;
}
