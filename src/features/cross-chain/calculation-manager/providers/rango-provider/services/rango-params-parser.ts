import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { Injector } from 'src/core/injector/injector';

import { RangoCrossChainOptions } from '../model/rango-api-common-types';
import {
    GetTradeConstructorParamsType,
    RangoBestRouteQueryParams,
    RangoCrossChainTradeConstructorParams,
    RangoSwapQueryParams,
    RangoTxStatusQueryParams
} from '../model/rango-parser-types';
import { RangoCrossChainProvider } from '../rango-cross-chain-provider';
import { RangoCrossChainTrade } from '../rango-cross-chain-trade';
import { RangoUtils } from '../utils/rango-utils';

export class RangoParamsParser {
    /**
     *@description Transform parameters to required view for rango-api
     *@returns Return object with params for `quote` method in rango-sdk to get best route in `calculate` method
     */
    public static getBestRouteQueryParams(
        from: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>,
        options: RangoCrossChainOptions
    ): RangoBestRouteQueryParams {
        const fromParam = RangoUtils.getFromToQueryParam(from);
        const toParam = RangoUtils.getFromToQueryParam(toToken);
        const amountParam = Web3Pure.toWei(from.tokenAmount);
        const apiKey = RangoCrossChainProvider.apiKey;

        return {
            apiKey,
            from: fromParam,
            to: toParam,
            amount: amountParam,
            ...(options.slippageTolerance && { slippage: options.slippageTolerance * 100 }),
            ...(options.swappers && { swappers: options.swappers }),
            ...(options.swappersExclude && { swappersExclude: options.swappersExclude })
        };
    }

    public static async getTradeConstructorParams({
        feeInfo,
        fromToken,
        options,
        routePath,
        swapQueryParams,
        toToken,
        toTokenAmountMin,
        rangoRequestId
    }: GetTradeConstructorParamsType): Promise<RangoCrossChainTradeConstructorParams> {
        const gasData =
            options.gasCalculation === 'enabled'
                ? await RangoCrossChainTrade.getGasData({
                      fromToken,
                      toToken,
                      swapQueryParams,
                      feeInfo,
                      routePath,
                      rangoRequestId
                  })
                : null;
        const priceImpact = fromToken.calculatePriceImpactPercent(toToken);
        const slippage = options.slippageTolerance * 100;

        const crossChainTrade = {
            from: fromToken,
            to: toToken,
            gasData,
            toTokenAmountMin,
            priceImpact,
            slippage,
            feeInfo,
            swapQueryParams,
            rangoRequestId
        };

        const providerAddress = options.providerAddress;

        return {
            crossChainTrade,
            providerAddress,
            routePath
        };
    }

    public static getSwapQueryParams(
        fromToken: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceTokenAmount<EvmBlockchainName>,
        options: RangoCrossChainOptions
    ): RangoSwapQueryParams {
        const amount = Web3Pure.toWei(fromToken.tokenAmount);

        const from = RangoUtils.getFromToQueryParam(fromToken);
        const to = RangoUtils.getFromToQueryParam(toToken);

        const walletAddress = Injector.web3PrivateService.getWeb3PrivateByBlockchain(
            fromToken.blockchain
        ).address;
        const fromAddress = options.fromAddress || walletAddress;
        const toAddress = options.receiverAddress || walletAddress;

        const slippage = options.slippageTolerance * 100;
        const apiKey = RangoCrossChainProvider.apiKey;

        return {
            apiKey,
            amount,
            from,
            to,
            fromAddress,
            slippage,
            toAddress,
            ...(options.swappers && { swappers: options.swappers }),
            ...(options.swappersExclude && { swappersExclude: options.swappersExclude })
        };
    }

    public static getTxStatusQueryParams(
        srcTxHash: string,
        requestId: string
    ): RangoTxStatusQueryParams {
        const apiKey = RangoCrossChainProvider.apiKey;

        return { apiKey, requestId, srcTxHash };
    }
}
