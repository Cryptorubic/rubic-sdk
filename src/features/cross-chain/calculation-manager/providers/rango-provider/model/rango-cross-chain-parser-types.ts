import BigNumber from 'bignumber.js';
import { PriceTokenAmount } from 'src/common/tokens';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { RangoSwapQueryParams } from 'src/features/common/providers/rango/models/rango-parser-types';
import { BridgeType } from 'src/features/cross-chain/calculation-manager/providers/common/models/bridge-type';

import { GasData } from '../../common/evm-cross-chain-trade/models/gas-data';
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
        bridgeSubtype: BridgeType;
    };
    providerAddress: string;
    routePath: RubicStep[];
    useProxy: boolean;
}

export interface GetCrossChainTradeConstructorParamsType {
    fromToken: PriceTokenAmount<EvmBlockchainName>;
    toToken: PriceTokenAmount<EvmBlockchainName>;
    options: RangoCrossChainOptions;
    routePath: RubicStep[];
    feeInfo: FeeInfo;
    toTokenAmountMin: BigNumber;
    swapQueryParams: RangoSwapQueryParams;
    bridgeSubtype: BridgeType;
    receiverAddress: string;
}

export type RangoGetGasDataParams = Omit<
    GetCrossChainTradeConstructorParamsType,
    'toTokenAmountMin' | 'options'
>;
