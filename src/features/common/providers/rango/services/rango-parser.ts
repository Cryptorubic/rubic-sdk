import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { Injector } from 'src/core/injector/injector';

import { RANGO_API_KEY } from '../constants/rango-api-common';
import { RangoBestRouteRequestOptions } from '../models/rango-api-best-route-types';
import { RangoSwapRequestOptions } from '../models/rango-api-swap-types';
import {
    RangoBestRouteQueryParams,
    RangoSwapQueryParams,
    RangoTxStatusQueryParams
} from '../models/rango-parser-types';
import { RangoUtils } from '../utils/rango-utils';

export class RangoCommonParser {
    /**
     *@description Transform parameters to required view for rango-api
     */
    public static async getBestRouteQueryParams(
        from: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>,
        options: RangoBestRouteRequestOptions
    ): Promise<RangoBestRouteQueryParams> {
        const fromParam = await RangoUtils.getFromToQueryParam(from);
        const toParam = await RangoUtils.getFromToQueryParam(toToken);

        const amountParam = Web3Pure.toWei(from.tokenAmount, from.decimals);

        const apiKey = RANGO_API_KEY;

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

    public static async getSwapQueryParams(
        fromToken: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>,
        options: RangoSwapRequestOptions
    ): Promise<RangoSwapQueryParams> {
        const amount = Web3Pure.toWei(fromToken.tokenAmount, fromToken.decimals);

        const from = await RangoUtils.getFromToQueryParam(fromToken);
        const to = await RangoUtils.getFromToQueryParam(toToken);

        const walletAddress = Injector.web3PrivateService.getWeb3PrivateByBlockchain(
            fromToken.blockchain
        ).address;
        const fromAddress = options.fromAddress || walletAddress;
        const toAddress = options.receiverAddress || walletAddress;

        const slippage = options.slippageTolerance * 100;
        const apiKey = RANGO_API_KEY;

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
        const apiKey = RANGO_API_KEY;

        return { apiKey, requestId, srcTxHash };
    }
}
