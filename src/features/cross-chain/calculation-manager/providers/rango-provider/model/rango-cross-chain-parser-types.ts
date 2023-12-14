import BigNumber from 'bignumber.js';
import { PriceTokenAmount } from 'src/common/tokens';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { RangoSwapQueryParams } from 'src/features/common/providers/rango/models/rango-parser-types';

import { GasData } from '../../common/emv-cross-chain-trade/models/gas-data';
import { FeeInfo } from '../../common/models/fee-info';
import { RubicStep } from '../../common/models/rubicStep';
import { RangoCrossChainOptions } from './rango-cross-chain-api-types';

export interface RangoCrossChainTradeConstructorParams {
    crossChainTrade: {
        from: PriceTokenAmount<EvmBlockchainName>;
        to: PriceTokenAmount<EvmBlockchainName>;
        gasData: GasData | null;
        toTokenAmountMin: BigNumber;
        feeInfo: FeeInfo;
        priceImpact: number | null;
        slippage: number;
        swapQueryParams: RangoSwapQueryParams;
    };
    providerAddress: string;
    routePath: RubicStep[];
}

export interface GetCrossChainTradeConstructorParamsType {
    fromToken: PriceTokenAmount<EvmBlockchainName>;
    toToken: PriceTokenAmount<EvmBlockchainName>;
    options: RangoCrossChainOptions;
    routePath: RubicStep[];
    feeInfo: FeeInfo;
    toTokenAmountMin: BigNumber;
    swapQueryParams: RangoSwapQueryParams;
}

export type RangoGetGasDataParams = Omit<
    GetCrossChainTradeConstructorParamsType,
    'toTokenAmountMin' | 'options'
>;
