import { Injector } from 'src/core/injector/injector';

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
        const fakeAddress = '0xe388Ed184958062a2ea29B7fD049ca21244AE02e';
        const receiverAddress =
            options?.receiverAddress ||
            Injector.web3PrivateService.getWeb3PrivateByBlockchain(fromToken.blockchain).address ||
            fakeAddress;

        const gasData =
            options.gasCalculation === 'enabled'
                ? await RangoCrossChainTrade.getGasData({
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
