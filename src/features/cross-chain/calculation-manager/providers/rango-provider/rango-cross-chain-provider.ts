import BigNumber from 'bignumber.js';
import { PriceToken, PriceTokenAmount, TokenAmount } from 'src/common/tokens';
import { nativeTokensList } from 'src/common/tokens/constants/native-tokens';
import { Any } from 'src/common/utils/types';
import { BlockchainName, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { CHAIN_TYPE } from 'src/core/blockchain/models/chain-type';
import { BlockchainsInfo } from 'src/core/blockchain/utils/blockchains-info/blockchains-info';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import {
    FAKE_BITCOIN_ADDRESS,
    FAKE_WALLET_ADDRESS
} from 'src/features/common/constants/fake-wallet-address';
import {
    RANGO_API_ENDPOINT,
    RANGO_API_KEY
} from 'src/features/common/providers/rango/constants/rango-api-common';
import {
    RangoBestRouteSimulationResult,
    RangoQuotePath,
    RangoSwapFee
} from 'src/features/common/providers/rango/models/rango-api-best-route-types';
import { RangoTradeType } from 'src/features/common/providers/rango/models/rango-api-trade-types';
import {
    RangoSupportedBlockchain,
    rangoSupportedBlockchains
} from 'src/features/common/providers/rango/models/rango-supported-blockchains';
import { RangoCommonParser } from 'src/features/common/providers/rango/services/rango-parser';
import { RangoUtils } from 'src/features/common/providers/rango/utils/rango-utils';
import { getFromWithoutFee } from 'src/features/common/utils/get-from-without-fee';
import { RangoCrossChainFactory } from 'src/features/cross-chain/calculation-manager/providers/rango-provider/rango-cross-chain-factory';

import { CROSS_CHAIN_TRADE_TYPE, CrossChainTradeType } from '../../models/cross-chain-trade-type';
import { CrossChainProvider } from '../common/cross-chain-provider';
import { CalculationResult } from '../common/models/calculation-result';
import { FeeInfo } from '../common/models/fee-info';
import { CrossChainStep, RubicStep } from '../common/models/rubicStep';
import { ProxyCrossChainEvmTrade } from '../common/proxy-cross-chain-evm-facade/proxy-cross-chain-evm-trade';
import { RangoCrossChainOptions } from './model/rango-cross-chain-api-types';
import { RangoCrossChainTradeConstructorParams } from './model/rango-cross-chain-parser-types';
import { RangoCrossChainApiService } from './services/rango-cross-chain-api-service';

export class RangoCrossChainProvider extends CrossChainProvider {
    public type: CrossChainTradeType = CROSS_CHAIN_TRADE_TYPE.RANGO;

    public static readonly apiKey = RANGO_API_KEY;

    public static readonly apiEndpoint = RANGO_API_ENDPOINT;

    private rangoSupportedBlockchains = rangoSupportedBlockchains;

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
        const fromBlockchain = from.blockchain as RangoSupportedBlockchain;
        const useProxy = options?.useProxy?.[this.type] ?? true;

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

            const bestRouteParams = await RangoCommonParser.getBestRouteQueryParams(
                fromWithoutFee,
                toToken,
                { ...options, swapperGroups: options.rangoDisabledProviders }
            );

            const { route } = await RangoCrossChainApiService.getBestRoute(bestRouteParams);
            const { outputAmountMin, outputAmount, path, fee } =
                route as RangoBestRouteSimulationResult;

            const toTokenAmountMin = Web3Pure.fromWei(outputAmountMin, toToken.decimals);
            const to = new PriceTokenAmount({
                ...toToken.asStruct,
                tokenAmount: Web3Pure.fromWei(outputAmount, toToken.decimals)
            });
            const routePath = await this.getRoutePath(from, to, path);

            const swapQueryParams = await RangoCommonParser.getSwapQueryParams(
                fromWithoutFee,
                toToken,
                { ...options, swapperGroups: options.rangoDisabledProviders }
            );

            const cryptoFee = await this.getCryptoFee(fee, fromBlockchain);

            if (cryptoFee?.amount.gt(0)) {
                feeInfo.provider = {
                    cryptoFee
                };
            }

            const bridgeSubtype = (
                routePath.find(el => el.type === 'cross-chain') as CrossChainStep
            )?.provider;

            const priceImpact = from.calculatePriceImpactPercent(to);

            const tradeParams: RangoCrossChainTradeConstructorParams<BlockchainName> = {
                crossChainTrade: {
                    from,
                    to,
                    feeInfo,
                    toTokenAmountMin,
                    priceImpact,
                    swapQueryParams,
                    slippage: options.slippageTolerance,
                    bridgeSubtype,
                    gasData: await this.getGasData(from)
                },
                routePath,
                providerAddress: options.providerAddress,
                useProxy
            };

            const trade = RangoCrossChainFactory.createTrade(fromBlockchain, tradeParams);
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

        return Promise.all(path.map(path => this.getStep(path)));
    }

    private async getStep(rangoPath: RangoQuotePath): Promise<RubicStep> {
        const type = rangoPath.swapperType === 'DEX' ? 'on-chain' : 'cross-chain';

        const provider = RangoUtils.getTradeTypeForRubic(
            rangoPath.swapper.swapperGroup as RangoTradeType,
            type
        );

        const fromBlockchain = RangoUtils.getRubicBlockchainByRangoBlockchain(
            rangoPath.from.blockchain
        );
        const toBlockchain = RangoUtils.getRubicBlockchainByRangoBlockchain(
            rangoPath.to.blockchain
        );

        const fromTokenAmount = await TokenAmount.createToken({
            address: rangoPath.from.address || nativeTokensList[fromBlockchain].address,
            blockchain: fromBlockchain,
            weiAmount: new BigNumber(rangoPath.inputAmount)
        });

        const toTokenAmount = await TokenAmount.createToken({
            address: rangoPath.to.address || nativeTokensList[toBlockchain].address,
            blockchain: toBlockchain,
            weiAmount: new BigNumber(rangoPath.expectedOutput)
        });

        return {
            provider: provider as Any,
            type: type,
            path: [fromTokenAmount, toTokenAmount]
        };
    }

    protected async getFeeInfo(
        fromBlockchain: RangoSupportedBlockchain,
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

    private async getCryptoFee(
        fee: RangoSwapFee[],
        fromBlockchain: BlockchainName
    ): Promise<{
        amount: BigNumber;
        token: PriceToken;
    }> {
        const nativeToken = nativeTokensList[fromBlockchain];

        if (!fee) {
            return {
                amount: new BigNumber(0),
                token: await PriceTokenAmount.createFromToken({
                    ...nativeToken,
                    weiAmount: new BigNumber(0)
                })
            };
        }

        const feeAmount = fee
            .filter(fee => fee.expenseType === 'FROM_SOURCE_WALLET')
            .reduce((acc, fee) => acc.plus(fee.amount), new BigNumber(0));
        const cryptoFeeToken = await PriceTokenAmount.createFromToken({
            ...nativeToken,
            weiAmount: new BigNumber(feeAmount)
        });

        return {
            amount: Web3Pure.fromWei(feeAmount, nativeToken.decimals),
            token: cryptoFeeToken
        };
    }

    private getReceiverAddress(blockchain: BlockchainName): string {
        const type = BlockchainsInfo.getChainType(blockchain);
        if (type === CHAIN_TYPE.EVM) {
            return FAKE_WALLET_ADDRESS;
        }
        if (type === CHAIN_TYPE.BITCOIN) {
            return FAKE_BITCOIN_ADDRESS;
        }
        throw new Error('Chain type not supported');
    }
}
