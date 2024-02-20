import {
    GetCrossChainTradeConstructorParamsType,
    RangoCrossChainTradeConstructorParams
} from '../model/rango-cross-chain-parser-types';
import { RangoCrossChainTrade } from '../rango-cross-chain-trade';

export class RangoCrossChainParser {
    public static async getTradeConstructorParams({
        feeInfo,
        fromToken,
        options,
        routePath,
        swapQueryParams,
        toToken,
        toTokenAmountMin,
        bridgeSubtype
    }: GetCrossChainTradeConstructorParamsType): Promise<RangoCrossChainTradeConstructorParams> {
        const gasData =
            options.gasCalculation === 'enabled'
                ? await RangoCrossChainTrade.getGasData({
                      fromToken,
                      toToken,
                      swapQueryParams,
                      feeInfo,
                      routePath,
                      bridgeSubtype
                  })
                : null;
        const priceImpact = fromToken.calculatePriceImpactPercent(toToken);
        const slippage = options.slippageTolerance;

        const crossChainTrade: RangoCrossChainTradeConstructorParams['crossChainTrade'] = {
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
            routePath
        };
    }
}
