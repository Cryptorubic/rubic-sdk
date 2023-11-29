import BigNumber from 'bignumber.js';
import { NotSupportedBlockchain } from 'src/common/errors';
import { PriceToken, PriceTokenAmount, TokenAmount } from 'src/common/tokens';
import { Any } from 'src/common/utils/types';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { getFromWithoutFee } from 'src/features/common/utils/get-from-without-fee';

import { CROSS_CHAIN_TRADE_TYPE, CrossChainTradeType } from '../../models/cross-chain-trade-type';
import { CrossChainProvider } from '../common/cross-chain-provider';
import { CalculationResult } from '../common/models/calculation-result';
import { FeeInfo } from '../common/models/fee-info';
import { RubicStep } from '../common/models/rubicStep';
import { ProxyCrossChainEvmTrade } from '../common/proxy-cross-chain-evm-facade/proxy-cross-chain-evm-trade';
import { RangoBestRouteSimulationResult, RangoQuotePath } from './model/rango-api-best-route-types';
import { RangoCrossChainOptions } from './model/rango-api-common-types';
import {
    RangoCrossChainSupportedBlockchain,
    rangoCrossChainSupportedBlockchains
} from './model/rango-cross-chain-supported-blockchains';
import { RangoCrossChainTrade } from './rango-cross-chain-trade';
import { RangoApiService } from './services/rango-cross-chain-api-service';
import { RangoParamsParser } from './services/rango-params-parser';
import { RangoUtils } from './utils/rango-utils';

export class RangoCrossChainProvider extends CrossChainProvider {
    public type: CrossChainTradeType = CROSS_CHAIN_TRADE_TYPE.RANGO;

    public static readonly apiKey = 'a24ca428-a18e-4e84-b57f-edb3e2a5bf13';

    public static readonly apiEndpoint = 'https://api.rango.exchange/basic';

    private rangoSupportedBlockchains = rangoCrossChainSupportedBlockchains;

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
        const fromBlockchain = from.blockchain as RangoCrossChainSupportedBlockchain;
        const toBlockchain = toToken.blockchain as RangoCrossChainSupportedBlockchain;
        const useProxy = options?.useProxy?.[this.type] ?? true;

        if (!this.areSupportedBlockchains(fromBlockchain, toBlockchain)) {
            return {
                error: new NotSupportedBlockchain(),
                trade: null,
                tradeType: this.type
            };
        }

        try {
            const feeInfo = await this.getFeeInfo(
                fromBlockchain,
                options.providerAddress,
                from,
                useProxy
            );

            const fromWithoutFee = getFromWithoutFee(
                from,
                feeInfo.rubicProxy?.platformFee?.percent
            );

            const bestRouteParams = RangoParamsParser.getBestRouteQueryParams(
                fromWithoutFee,
                toToken,
                options
            );

            const { route, requestId: rangoRequestId } = await RangoApiService.getBestRoute(
                bestRouteParams
            );
            const { outputAmountMin, outputAmount, path } = route as RangoBestRouteSimulationResult;

            const swapQueryParams = RangoParamsParser.getSwapQueryParams(
                fromWithoutFee,
                toToken,
                options
            );

            const toTokenAmountMin = Web3Pure.fromWei(outputAmountMin, toToken.decimals);
            const to = new PriceTokenAmount({
                ...toToken.asStruct,
                tokenAmount: Web3Pure.fromWei(outputAmount, toToken.decimals)
            });
            const routePath = await this.getRoutePath(from, to, path);

            const tradeParams = await RangoParamsParser.getTradeConstructorParams({
                fromToken: from,
                toToken: to,
                options,
                routePath,
                feeInfo,
                toTokenAmountMin,
                swapQueryParams,
                rangoRequestId
            });

            const trade = new RangoCrossChainTrade(tradeParams);
            const tradeType = this.type;

            return { trade, tradeType };
        } catch (err) {
            const rubicSdkError = CrossChainProvider.parseError(err);

            return {
                trade: null,
                error: rubicSdkError,
                tradeType: this.type
            };
        }
    }

    protected async getRoutePath(
        fromToken: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceTokenAmount<EvmBlockchainName>,
        path: RangoQuotePath[] | null
    ): Promise<RubicStep[]> {
        if (!path) {
            return [{ type: 'cross-chain', provider: this.type, path: [fromToken, toToken] }];
        }

        const routePath: RubicStep[] = [];

        path.forEach(async step => {
            const type = step.swapperType === 'DEX' ? 'on-chain' : 'cross-chain';
            const fromBlockchain = RangoUtils.getRubicBlockchainByRangoBlockchain(
                step.from.blockchain
            );
            const toBlockchain = RangoUtils.getRubicBlockchainByRangoBlockchain(step.to.blockchain);

            const fromTokenAmount = await TokenAmount.createToken({
                address: step.from.address!,
                blockchain: fromBlockchain,
                weiAmount: new BigNumber(step.inputAmount)
            });

            const toTokenAmount = await TokenAmount.createToken({
                address: step.to.address!,
                blockchain: toBlockchain,
                weiAmount: new BigNumber(step.expectedOutput)
            });

            routePath.push({
                provider: this.type,
                type: type as Any,
                path: [fromTokenAmount, toTokenAmount]
            });
        });

        return routePath;
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
