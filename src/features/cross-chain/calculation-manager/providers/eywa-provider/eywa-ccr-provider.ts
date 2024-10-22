import BigNumber from 'bignumber.js';
import { MinAmountError, NotSupportedTokensError, RubicSdkError } from 'src/common/errors';
import { PriceToken, PriceTokenAmount, Token, TokenAmount } from 'src/common/tokens';
import { nativeTokensList } from 'src/common/tokens/constants/native-tokens';
import { BlockchainName, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { BlockchainsInfo } from 'src/core/blockchain/utils/blockchains-info/blockchains-info';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { getFromWithoutFee } from 'src/features/common/utils/get-from-without-fee';
import { ON_CHAIN_TRADE_TYPE } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';

import { RequiredCrossChainOptions } from '../../models/cross-chain-options';
import { CROSS_CHAIN_TRADE_TYPE } from '../../models/cross-chain-trade-type';
import { CrossChainProvider } from '../common/cross-chain-provider';
import { CalculationResult } from '../common/models/calculation-result';
import { FeeInfo } from '../common/models/fee-info';
import { RubicStep } from '../common/models/rubicStep';
import { ProxyCrossChainEvmTrade } from '../common/proxy-cross-chain-evm-facade/proxy-cross-chain-evm-trade';
import {
    EywaCcrSupportedChains,
    eywaCrossChainSupportedChains
} from './constants/eywa-ccr-supported-chains';
import { EywaCrossChainTrade } from './eywa-ccr-trade';
import { EywaRoute, EywaRoutingParams } from './models/request-routing-params';
import { EywaApiService } from './services/eywa-api-service';

export class EywaCrossChainProvider extends CrossChainProvider {
    public readonly type = CROSS_CHAIN_TRADE_TYPE.EYWA_V2;

    private readonly MIN_AMOUNT_USD = new BigNumber(1);

    public isSupportedBlockchain(fromBlockchain: BlockchainName): boolean {
        return eywaCrossChainSupportedChains.some(
            supportedChain => supportedChain === fromBlockchain
        );
    }

    public async calculate(
        from: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>,
        options: RequiredCrossChainOptions
    ): Promise<CalculationResult> {
        const fromBlockchain = from.blockchain as EywaCcrSupportedChains;
        const toBlockchain = toToken.blockchain as EywaCcrSupportedChains;

        const useProxy = true;
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

            const routingSendParams: EywaRoutingParams = {
                params: {
                    chainIdIn: blockchainId[fromBlockchain],
                    chainIdOut: blockchainId[toBlockchain],
                    amountIn: fromWithoutFee.stringWeiAmount,
                    tokenIn: from.address,
                    tokenOut: toToken.address
                },
                slippage: options.slippageTolerance * 100
            };

            const quotes = await EywaApiService.getRoutes(routingSendParams);

            const bestQuote = quotes[0];

            if (!bestQuote) {
                return {
                    trade: null,
                    error: new NotSupportedTokensError(),
                    tradeType: this.type
                };
            }

            const to = new PriceTokenAmount({
                ...toToken.asStruct,
                tokenAmount: Web3Pure.fromWei(bestQuote.amountOutWithoutSlippage, toToken.decimals)
            });

            const toTokenAmountMin = new BigNumber(bestQuote.amountOut);

            const nativeToken = nativeTokensList[from.blockchain];

            const cryptoFeeToken = await PriceTokenAmount.createFromToken({
                ...nativeToken,
                tokenAmount: new BigNumber(bestQuote.totalFee.amount)
            });

            const gasData =
                options.gasCalculation === 'enabled'
                    ? await EywaCrossChainTrade.getGasData(
                          from,
                          to,
                          feeInfo,
                          options.providerAddress,
                          toTokenAmountMin,
                          bestQuote
                      )
                    : null;

            const trade = new EywaCrossChainTrade(
                {
                    from,
                    to,
                    feeInfo: {
                        ...feeInfo,
                        provider: {
                            cryptoFee: {
                                token: cryptoFeeToken,
                                amount: new BigNumber(bestQuote.totalFee.amount)
                            }
                        }
                    },
                    priceImpact: from.calculatePriceImpactPercent(to),
                    toTokenAmountMin,
                    gasData,
                    slippage: options.slippageTolerance,
                    eywaRoute: bestQuote
                },
                options.providerAddress,
                await this.getRoutePath(bestQuote.route),
                useProxy
            );

            const minAmountError = this.checkMinError(from);

            if (minAmountError) {
                return {
                    trade,
                    error: minAmountError,
                    tradeType: this.type
                };
            }

            return {
                trade,
                tradeType: this.type
            };
        } catch (err) {
            return {
                trade: null,
                error: err,
                tradeType: this.type
            };
        }
    }

    protected async getRoutePath(eywaRoutes: EywaRoute[]): Promise<RubicStep[]> {
        const routePath: RubicStep[] = [];

        for (const route of eywaRoutes) {
            if (route.params.chainIdIn === route.params.chainIdOut) {
                const tokens = await Token.createTokens(
                    [route.params.tokenIn.address, route.params.tokenOut.address],
                    BlockchainsInfo.getBlockchainNameById(route.params.chainIdIn)!
                );
                routePath.push({
                    provider: ON_CHAIN_TRADE_TYPE.EYWA_SWAP,
                    type: 'on-chain',
                    path: tokens
                });
            } else {
                const fromTransitToken = await TokenAmount.createToken({
                    address: route.params.tokenIn.address,
                    blockchain: BlockchainsInfo.getBlockchainNameById(
                        route.params.tokenIn.chainId
                    )!,
                    weiAmount: new BigNumber(route.params.amountInWithoutSlippage)
                });

                const toTransitToken = await TokenAmount.createToken({
                    address: route.params.tokenOut.address,
                    blockchain: BlockchainsInfo.getBlockchainNameById(
                        route.params.tokenOut.chainId
                    )!,
                    weiAmount: new BigNumber(route.params.amountOutWithoutSlippage)
                });

                routePath.push({
                    provider: this.type,
                    type: 'cross-chain',
                    path: [fromTransitToken, toTransitToken]
                });
            }
        }

        return routePath;
    }

    private checkMinError(from: PriceTokenAmount): RubicSdkError | null {
        const fromUsdAmount = from.price.multipliedBy(from.tokenAmount);
        if (fromUsdAmount.lt(this.MIN_AMOUNT_USD)) {
            const minTokenAmount = this.MIN_AMOUNT_USD.multipliedBy(from.tokenAmount).dividedBy(
                fromUsdAmount
            );
            return new MinAmountError(minTokenAmount, from.symbol);
        }
        return null;
    }

    protected async getFeeInfo(
        fromBlockchain: EywaCcrSupportedChains,
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
