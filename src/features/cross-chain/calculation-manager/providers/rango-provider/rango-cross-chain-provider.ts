import { NotSupportedBlockchain, RubicSdkError } from 'src/common/errors';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';

import { CROSS_CHAIN_TRADE_TYPE, CrossChainTradeType } from '../../models/cross-chain-trade-type';
import { CrossChainProvider } from '../common/cross-chain-provider';
import { CalculationResult } from '../common/models/calculation-result';
import { FeeInfo } from '../common/models/fee-info';
import { RubicStep } from '../common/models/rubicStep';
import { ProxyCrossChainEvmTrade } from '../common/proxy-cross-chain-evm-facade/proxy-cross-chain-evm-trade';
import {
    RangoCrossChainSupportedBlockchain,
    rangoCrossChainSupportedBlockchains
} from './model/rango-cross-chain-supported-blockchains';
import {
    RangoBestTradeQueryParams,
    RangoBestTradeResponse,
    RangoCrossChainOptions,
    RangoCrossChainTradeConstructorParams
} from './model/rango-types';
import { RangoCrossChainTrade } from './rango-cross-chain-trade';

export class RangoCrossChainProvider extends CrossChainProvider {
    public type: CrossChainTradeType = CROSS_CHAIN_TRADE_TYPE.RANGO;

    private readonly API_KEY = 'a24ca428-a18e-4e84-b57f-edb3e2a5bf13';

    private readonly API_BASE_URL = 'https://api.rango.exchange/basic';

    private rangoSupportedBlockchains = rangoCrossChainSupportedBlockchains;

    constructor() {
        super();
    }

    public isSupportedBlockchain(blockchain: EvmBlockchainName): boolean {
        return this.rangoSupportedBlockchains.some(
            supportedBlockchain => supportedBlockchain === blockchain
        );
    }

    public async calculate(
        from: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>,
        options: RangoCrossChainOptions
    ): Promise<CalculationResult> {
        if (!this.areSupportedBlockchains(from.blockchain, toToken.blockchain)) {
            return {
                error: new NotSupportedBlockchain(),
                trade: null,
                tradeType: this.type
            };
        }

        const bestRoute = await this.getBestRoute(from, toToken, options);
        console.log(bestRoute);
        const tradeConstructorParams = this.getTradeConstructorParams();
        const trade = new RangoCrossChainTrade(tradeConstructorParams);
        const tradeType = this.type;
        return { trade, tradeType };
    }

    private async getBestRoute(
        from: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>,
        options: RangoCrossChainOptions
    ): Promise<unknown> {
        const params = this.getBestRouteQueryParams(from, toToken, options) as any;
        try {
            const { route } = await this.httpClient.get<RangoBestTradeResponse>(
                `${this.API_BASE_URL}/quote`,
                {
                    params
                }
            );
            if (!route) throw new RubicSdkError('No available routes in rango.');
        } catch (err) {
            throw new RubicSdkError(err);
        }
    }

    /**
     *@description Transform parameters to required view for rango-api
     *@returns Return object with params for `quote` method in rango-sdk to get best route in `calculate` method
     */
    private getBestRouteQueryParams(
        from: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>,
        options: RangoCrossChainOptions
    ): RangoBestTradeQueryParams {
        const fromParam = `${from.blockchain}.${from.symbol}--${from.address}`;
        const toParam = `${toToken.blockchain}.${toToken.symbol}--${toToken.address}`;
        const amountParam = from.tokenAmount.toString();
        return {
            from: fromParam,
            to: toParam,
            amount: amountParam,
            ...(options.slippageTolerance && { slippage: options.slippageTolerance }),
            ...(options.swappers && { swappers: options.swappers }),
            ...(options.swappersExclude && { swappersExclude: options.swappersExclude })
        };
    }

    private getTradeConstructorParams(): RangoCrossChainTradeConstructorParams {
        return {} as RangoCrossChainTradeConstructorParams;
    }

    protected getRoutePath(...options: unknown[]): Promise<RubicStep[]> {
        console.log(options);
        return [] as unknown as Promise<RubicStep[]>;
    }

    protected async getFeeInfo(
        fromBlockchain: RangoCrossChainSupportedBlockchain,
        providerAddress: string,
        percentFeeToken: PriceTokenAmount,
        useProxy: boolean
    ): Promise<FeeInfo> {
        return ProxyCrossChainEvmTrade.getFeeInfo(
            fromBlockchain,
            providerAddress,
            percentFeeToken,
            useProxy
        );
    }
}
