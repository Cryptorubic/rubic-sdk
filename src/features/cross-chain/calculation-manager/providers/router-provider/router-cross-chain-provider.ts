import BigNumber from 'bignumber.js';
import { NotSupportedTokensError } from 'src/common/errors';
import { PriceToken, PriceTokenAmount, TokenAmount } from 'src/common/tokens';
import { BlockchainName, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { RouterQuoteResponseConfig } from 'src/features/common/providers/router/models/router-quote-response-config';
import { RouterApiService } from 'src/features/common/providers/router/services/router-api-service';
import { getFromWithoutFee } from 'src/features/common/utils/get-from-without-fee';
import { RouterCrossChainFactory } from 'src/features/cross-chain/calculation-manager/providers/router-provider/router-cross-chain-factory';
import { RouterCrossChainUtilService } from 'src/features/cross-chain/calculation-manager/providers/router-provider/utils/router-cross-chain-util-service';
import { ON_CHAIN_TRADE_TYPE } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';

import { RequiredCrossChainOptions } from '../../models/cross-chain-options';
import { CROSS_CHAIN_TRADE_TYPE } from '../../models/cross-chain-trade-type';
import { CrossChainProvider } from '../common/cross-chain-provider';
import { CalculationResult } from '../common/models/calculation-result';
import { FeeInfo } from '../common/models/fee-info';
import { RubicStep } from '../common/models/rubicStep';
import { ProxyCrossChainEvmTrade } from '../common/proxy-cross-chain-evm-facade/proxy-cross-chain-evm-trade';
import {
    RouterCrossChainSupportedBlockchains,
    routerCrossChainSupportedChains
} from './constants/router-cross-chain-supported-chains';
export class RouterCrossChainProvider extends CrossChainProvider {
    public readonly type = CROSS_CHAIN_TRADE_TYPE.ROUTER;

    public isSupportedBlockchain(fromBlockchain: BlockchainName): boolean {
        return routerCrossChainSupportedChains.some(chain => chain === fromBlockchain);
    }

    public async calculate(
        from: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>,
        options: RequiredCrossChainOptions
    ): Promise<CalculationResult> {
        const fromBlockchain = from.blockchain as RouterCrossChainSupportedBlockchains;
        const toBlockchain = toToken.blockchain as RouterCrossChainSupportedBlockchains;
        if (!this.areSupportedBlockchains(from.blockchain, toToken.blockchain)) {
            return {
                trade: null,
                error: new NotSupportedTokensError(),
                tradeType: this.type
            };
        }

        const useProxy = options?.useProxy?.[this.type] ?? true;

        try {
            // if (toBlockchain === BLOCKCHAIN_NAME.SOLANA && options.receiverAddress) {
            //     await RouterCrossChainUtilService.checkAtaAddress(
            //         options.receiverAddress,
            //         toToken.address
            //     );
            // }

            const srcChainId = RouterCrossChainUtilService.getBlockchainId(fromBlockchain);
            const dstChainId = RouterCrossChainUtilService.getBlockchainId(toBlockchain);

            const NATIVE_TOKEN_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';

            const srcTokenAddress = from.address;
            const dstTokenAddress = await RouterCrossChainUtilService.checkAndConvertAddress(
                toBlockchain,
                toToken.address
            );

            const feeInfo = await this.getFeeInfo(
                from.blockchain,
                options.providerAddress,
                from,
                useProxy
            );

            const fromWithoutFee = getFromWithoutFee(
                from,
                feeInfo?.rubicProxy?.platformFee?.percent
            );

            const routerQuoteConfig = await RouterApiService.getQuote({
                amount: fromWithoutFee.stringWeiAmount,
                fromTokenAddress: from.isNative ? NATIVE_TOKEN_ADDRESS : srcTokenAddress,
                fromTokenChainId: srcChainId,
                toTokenAddress: toToken.isNative ? NATIVE_TOKEN_ADDRESS : dstTokenAddress,
                toTokenChainId: dstChainId,
                slippageTolerance: options.slippageTolerance * 100
            });
            const dstTokenAmount = new BigNumber(routerQuoteConfig.destination.tokenAmount);

            const to = new PriceTokenAmount({
                ...toToken.asStruct,
                tokenAmount: Web3Pure.fromWei(
                    dstTokenAmount,
                    routerQuoteConfig.destination.asset.decimals
                )
            });

            const routePath = await this.getRoutePath(from, to, routerQuoteConfig);
            return {
                trade: RouterCrossChainFactory.createTrade(fromBlockchain, {
                    crossChainTrade: {
                        from,
                        to,
                        feeInfo,
                        gasData: await this.getGasData(from),
                        priceImpact: from.calculatePriceImpactPercent(to),
                        routerQuoteConfig,
                        slippage: options.slippageTolerance
                    },
                    providerAddress: options.providerAddress,
                    routePath,
                    useProxy
                }),
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

    protected async getRoutePath(
        fromToken: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceTokenAmount<EvmBlockchainName>,
        routerQuoteConfig: RouterQuoteResponseConfig
    ): Promise<RubicStep[]> {
        const routerSrcAsset = routerQuoteConfig.source;
        const routerDstAsset = routerQuoteConfig.destination;

        if (routerSrcAsset.path.length === 0 && routerDstAsset.path.length === 0) {
            return [
                {
                    type: 'cross-chain',
                    provider: this.type,
                    path: [fromToken, toToken]
                }
            ];
        }
        const transitFromAddress =
            fromToken.address.toLowerCase() !==
            routerSrcAsset.stableReserveAsset.address.toLowerCase()
                ? routerSrcAsset.stableReserveAsset.address
                : null;

        const transitToAddress =
            toToken.address.toLowerCase() !==
            routerDstAsset.stableReserveAsset.address.toLowerCase()
                ? routerDstAsset.stableReserveAsset.address
                : null;
        const fromTransitToken = transitFromAddress
            ? await TokenAmount.createToken({
                  blockchain: fromToken.blockchain,
                  address: transitFromAddress,
                  weiAmount: new BigNumber(routerSrcAsset.stableReserveAmount)
              })
            : fromToken;

        const toTransitToken = transitToAddress
            ? await TokenAmount.createToken({
                  blockchain: toToken.blockchain,
                  address: transitToAddress,
                  weiAmount: new BigNumber(routerDstAsset.stableReserveAmount)
              })
            : toToken;
        const routePath: RubicStep[] = [];

        if (transitFromAddress) {
            routePath.push({
                type: 'on-chain',
                provider: ON_CHAIN_TRADE_TYPE.ROUTER_SWAP,
                path: [fromToken, fromTransitToken]
            });
        }
        routePath.push({
            type: 'cross-chain',
            provider: CROSS_CHAIN_TRADE_TYPE.ROUTER,
            path: [fromTransitToken, toTransitToken]
        });
        if (transitToAddress) {
            routePath.push({
                type: 'on-chain',
                provider: ON_CHAIN_TRADE_TYPE.ROUTER_SWAP,
                path: [toTransitToken, toToken]
            });
        }
        return routePath;
    }

    public async getFeeInfo(
        fromBlockchain: EvmBlockchainName,
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
