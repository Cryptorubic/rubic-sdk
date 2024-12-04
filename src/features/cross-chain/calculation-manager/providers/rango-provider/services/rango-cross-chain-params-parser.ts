import { BlockchainName } from 'src/core/blockchain/models/blockchain-name';

import { CROSS_CHAIN_TRADE_TYPE } from '../../../models/cross-chain-trade-type';
import { RangoEvmCrossChainTrade } from '../chains/rango-evm-cross-chain-trade';
import {
    GetCrossChainTradeConstructorParamsType,
    RangoCrossChainTradeConstructorParams
} from '../model/rango-cross-chain-parser-types';

export class RangoCrossChainParser {
    public static async getTradeConstructorParams({
        feeInfo,
        fromToken,
        options,
        routePath,
        swapQueryParams,
        toToken,
        toTokenAmountMin,
        bridgeSubtype,
        receiverAddress
    }: GetCrossChainTradeConstructorParamsType): Promise<
        RangoCrossChainTradeConstructorParams<BlockchainName>
    > {
        const useProxy = options.useProxy?.[CROSS_CHAIN_TRADE_TYPE.RANGO] ?? true;
        const gasData =
            options.gasCalculation === 'enabled'
                ? await RangoEvmCrossChainTrade.getGasData({
                      fromToken,
                      toToken,
                      swapQueryParams,
                      feeInfo,
                      routePath,
                      bridgeSubtype,
                      receiverAddress
                  })
                : null;
        const priceImpact = fromToken.calculatePriceImpactPercent(toToken);
        const slippage = options.slippageTolerance;

        const crossChainTrade: RangoCrossChainTradeConstructorParams<BlockchainName>['crossChainTrade'] =
            {
                from: fromToken,
                to: toToken,
                gasData,
                toTokenAmountMin,
                priceImpact,
                slippage,
                feeInfo,
                swapQueryParams,
                bridgeSubtype
            };

        const providerAddress = options.providerAddress;

        return {
            crossChainTrade,
            providerAddress,
            routePath,
            useProxy
        };
    }
}
