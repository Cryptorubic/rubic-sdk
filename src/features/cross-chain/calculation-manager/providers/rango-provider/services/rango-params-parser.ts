import BigNumber from 'bignumber.js';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';

import { FeeInfo } from '../../common/models/fee-info';
import { RubicStep } from '../../common/models/rubicStep';
import {
    RangoBestRouteQueryParams,
    RangoCrossChainOptions,
    RangoCrossChainTradeConstructorParams,
    RangoSwapQueryParams
} from '../model/rango-types';
import { RangoCrossChainTrade } from '../rango-cross-chain-trade';
import { RangoUtils } from '../utils/rango-utils';
import { Injector } from 'src/core/injector/injector';

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
        const fromParam = RangoUtils.getFromToQueryParam(
            from.blockchain,
            from.symbol,
            from.address
        );
        const toParam = RangoUtils.getFromToQueryParam(
            toToken.blockchain,
            toToken.symbol,
            toToken.address
        );
        const amountParam = Web3Pure.toWei(from.tokenAmount);
        return {
            from: fromParam,
            to: toParam,
            amount: amountParam,
            ...(options.slippageTolerance && { slippage: options.slippageTolerance }),
            ...(options.swappers && { swappers: options.swappers }),
            ...(options.swappersExclude && { swappersExclude: options.swappersExclude })
        };
    }

    public static async getTradeConstructorParams(
        fromToken: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceTokenAmount<EvmBlockchainName>,
        options: RangoCrossChainOptions,
        routePath: RubicStep[],
        feeInfo: FeeInfo,
        toTokenAmountMin: BigNumber,
        swapQueryParams: RangoSwapQueryParams
    ): Promise<RangoCrossChainTradeConstructorParams> {
        const gasData =
            options.gasCalculation === 'enabled'
                ? await RangoCrossChainTrade.getGasData(fromToken, toToken, swapQueryParams)
                : null;
        const priceImpact = fromToken.calculatePriceImpactPercent(toToken);

        const crossChainTrade = {
            from: fromToken,
            to: toToken,
            gasData,
            toTokenAmountMin,
            priceImpact,
            slippage: options.slippageTolerance,
            feeInfo,
            swapQueryParams
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
        const from = RangoUtils.getFromToQueryParam(
            fromToken.blockchain,
            fromToken.symbol,
            fromToken.address
        );
        const to = RangoUtils.getFromToQueryParam(
            toToken.blockchain,
            toToken.symbol,
            toToken.address
        );
        const fromAddress = Injector.web3PrivateService.getWeb3PrivateByBlockchain(
            fromToken.blockchain
        ).address;
        return { amount, from, to, fromAddress, slippage: options.slippageTolerance };
    }
}
