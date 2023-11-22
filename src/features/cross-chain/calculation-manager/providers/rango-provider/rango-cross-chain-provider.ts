import { NotSupportedBlockchain } from 'src/common/errors';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';

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
import { RangoCrossChainOptions, RangoSwapQueryParams } from './model/rango-types';
import { RangoCrossChainTrade } from './rango-cross-chain-trade';
import { RangoCrossChainApiService } from './services/rango-cross-chain-api-service';
import { RangoParamsParser } from './services/rango-params-parser';

export class RangoCrossChainProvider extends CrossChainProvider {
    public type: CrossChainTradeType = CROSS_CHAIN_TRADE_TYPE.RANGO;

    public static readonly apiKey = 'a24ca428-a18e-4e84-b57f-edb3e2a5bf13';

    public static readonly apiEndpoint = 'https://api.rango.exchange/basic';

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

        const { fee, outputAmount, outputAmountMin, outputAmountUsd, swapper } =
            await RangoCrossChainApiService.getBestRoute(from, toToken, options);

        console.log(fee, outputAmountMin, outputAmountUsd, swapper); //DELETE

        const toTokenExtended = new PriceTokenAmount({
            ...toToken.asStruct,
            tokenAmount: Web3Pure.fromWei(outputAmount, toToken.decimals)
        });

        const fromBlockchain = from.blockchain as RangoCrossChainSupportedBlockchain;
        const useProxy = options?.useProxy?.[this.type] ?? true;

        const feeInfo = await this.getFeeInfo(
            fromBlockchain,
            options.providerAddress,
            from,
            useProxy
        );

        const routePath = await this.getRoutePath(from, toTokenExtended);

        const swapQueryParams = RangoParamsParser.getSwapQueryParams();

        const tradeParams = await RangoParamsParser.getTradeConstructorParams(
            from,
            toTokenExtended,
            options,
            routePath,
            feeInfo,
            Web3Pure.fromWei(outputAmountMin, toToken.decimals),
            swapQueryParams
        );
        const trade = new RangoCrossChainTrade(tradeParams);
        const tradeType = this.type;
        return { trade, tradeType };
    }

    protected async getRoutePath(
        fromToken: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceTokenAmount<EvmBlockchainName>
    ): Promise<RubicStep[]> {
        return [{ type: 'cross-chain', provider: this.type, path: [fromToken, toToken] }];
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
