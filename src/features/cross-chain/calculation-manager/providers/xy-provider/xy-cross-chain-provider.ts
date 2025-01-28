import BigNumber from 'bignumber.js';
import { NotSupportedTokensError } from 'src/common/errors';
import { PriceToken, PriceTokenAmount, TokenAmount } from 'src/common/tokens';
import { compareAddresses } from 'src/common/utils/blockchain';
import { BlockchainName, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { Injector } from 'src/core/injector/injector';
import {
    XY_AFFILIATE_ADDRESS,
    XY_API_ENDPOINT,
    XY_NATIVE_ADDRESS
} from 'src/features/common/providers/xy/constants/xy-api-params';
import { XyBuildTxRequest } from 'src/features/common/providers/xy/models/xy-build-tx-request';
import { XyQuoteRequest } from 'src/features/common/providers/xy/models/xy-quote-request';
import { XyQuoteResponse } from 'src/features/common/providers/xy/models/xy-quote-response';
import { XyQuote } from 'src/features/common/providers/xy/models/xy-quote-success-response';
import { xyAnalyzeStatusCode } from 'src/features/common/providers/xy/utils/xy-utils';
import { getFromWithoutFee } from 'src/features/common/utils/get-from-without-fee';
import { RequiredCrossChainOptions } from 'src/features/cross-chain/calculation-manager/models/cross-chain-options';
import { CROSS_CHAIN_TRADE_TYPE } from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { CrossChainProvider } from 'src/features/cross-chain/calculation-manager/providers/common/cross-chain-provider';
import { CalculationResult } from 'src/features/cross-chain/calculation-manager/providers/common/models/calculation-result';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { RubicStep } from 'src/features/cross-chain/calculation-manager/providers/common/models/rubicStep';
import { ProxyCrossChainEvmTrade } from 'src/features/cross-chain/calculation-manager/providers/common/proxy-cross-chain-evm-facade/proxy-cross-chain-evm-trade';
import {
    XyCrossChainSupportedBlockchain,
    xySupportedBlockchains
} from 'src/features/cross-chain/calculation-manager/providers/xy-provider/constants/xy-supported-blockchains';
import { XyCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/xy-provider/xy-cross-chain-trade';
import { ON_CHAIN_TRADE_TYPE } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';

import { BRIDGE_TYPE, BridgeType } from '../common/models/bridge-type';

export class XyCrossChainProvider extends CrossChainProvider {
    public readonly type = CROSS_CHAIN_TRADE_TYPE.XY;

    public isSupportedBlockchain(
        blockchain: BlockchainName
    ): blockchain is XyCrossChainSupportedBlockchain {
        return xySupportedBlockchains.some(
            supportedBlockchain => supportedBlockchain === blockchain
        );
    }

    public async calculate(
        fromToken: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>,
        options: RequiredCrossChainOptions
    ): Promise<CalculationResult> {
        const fromBlockchain = fromToken.blockchain as XyCrossChainSupportedBlockchain;
        const toBlockchain = toToken.blockchain as XyCrossChainSupportedBlockchain;
        const useProxy = options?.useProxy?.[this.type] ?? true;

        if (!this.areSupportedBlockchains(fromBlockchain, toBlockchain)) {
            return {
                trade: null,
                error: new NotSupportedTokensError(),
                tradeType: this.type
            };
        }

        try {
            const receiverAddress =
                options.receiverAddress || this.getWalletAddress(fromBlockchain);

            const feeInfo = await this.getFeeInfo(
                fromBlockchain,
                options.providerAddress,
                fromToken,
                useProxy
            );

            const fromWithoutFee = getFromWithoutFee(
                fromToken,
                feeInfo.rubicProxy?.platformFee?.percent
            );

            const slippageTolerance = options.slippageTolerance * 100;

            const requestParams: XyQuoteRequest = {
                srcChainId: blockchainId[fromBlockchain],
                srcQuoteTokenAddress: fromToken.isNative ? XY_NATIVE_ADDRESS : fromToken.address,
                srcQuoteTokenAmount: fromWithoutFee.stringWeiAmount,
                dstChainId: blockchainId[toBlockchain],
                dstQuoteTokenAddress: toToken.isNative ? XY_NATIVE_ADDRESS : toToken.address,
                slippage: slippageTolerance,
                affiliate: XY_AFFILIATE_ADDRESS,
                bridgeProviders:
                    'yBridge,XassetBridge,Synapse,Across,Owlto,PolygonPoSEtherBridge,ArbitrumEtherBridge'
            };

            const { success, routes, errorCode, errorMsg } =
                await Injector.httpClient.get<XyQuoteResponse>(`${XY_API_ENDPOINT}/quote`, {
                    params: { ...requestParams }
                });

            if (!success) {
                xyAnalyzeStatusCode(errorCode, errorMsg);
            }

            const {
                srcSwapDescription,
                bridgeDescription,
                dstSwapDescription,
                dstQuoteTokenAmount,
                estimatedGasFeeAmount
            } = routes[0]!;

            const to = new PriceTokenAmount({
                ...toToken.asStruct,
                tokenAmount: Web3Pure.fromWei(dstQuoteTokenAmount, toToken.decimals)
            });

            const buildTxTransactionRequest: XyBuildTxRequest = {
                ...requestParams,
                ...(srcSwapDescription?.provider && {
                    srcSwapProvider: srcSwapDescription?.provider
                }),
                ...(bridgeDescription?.provider && {
                    srcBridgeTokenAddress: bridgeDescription.srcBridgeTokenAddress,
                    bridgeProvider: bridgeDescription.provider,
                    dstBridgeTokenAddress: bridgeDescription.dstBridgeTokenAddress
                }),
                ...(dstSwapDescription?.provider && {
                    dstSwapProvider: dstSwapDescription?.provider
                }),
                receiver: receiverAddress
            };
            const bridgeType = (
                bridgeDescription.provider === 'yBridge' ? BRIDGE_TYPE.YPOOL : BRIDGE_TYPE.XY
            ) as BridgeType;

            return {
                trade: new XyCrossChainTrade(
                    {
                        from: fromToken,
                        to,
                        transactionRequest: buildTxTransactionRequest,
                        gasData: null,
                        priceImpact: fromToken.calculatePriceImpactPercent(to),
                        slippage: options.slippageTolerance,
                        feeInfo,
                        onChainTrade: null,
                        bridgeType: bridgeType,
                        xyEstimatedGas: new BigNumber(estimatedGasFeeAmount)
                    },
                    options.providerAddress,
                    await this.getRoutePath(fromToken, to, {
                        srcSwapDescription,
                        bridgeDescription,
                        dstSwapDescription,
                        dstQuoteTokenAmount
                    }),
                    useProxy
                ),
                tradeType: this.type
            };
        } catch (err) {
            const rubicSdkError = CrossChainProvider.parseError(err);

            return {
                trade: null,
                error: rubicSdkError,
                tradeType: this.type
            };
        }
    }

    protected async getFeeInfo(
        fromBlockchain: XyCrossChainSupportedBlockchain,
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

    protected async getRoutePath(
        fromToken: PriceTokenAmount,
        toToken: PriceTokenAmount,
        quote: XyQuote
    ): Promise<RubicStep[]> {
        const transitFromAddress = quote.srcSwapDescription?.dstTokenAddress;
        const transitToAddress = quote.dstSwapDescription?.srcTokenAddress;

        const fromTokenAmount = transitFromAddress
            ? await TokenAmount.createToken({
                  blockchain: fromToken.blockchain,
                  address: compareAddresses(transitFromAddress, XY_NATIVE_ADDRESS)
                      ? EvmWeb3Pure.EMPTY_ADDRESS
                      : transitFromAddress,
                  weiAmount: new BigNumber(0)
              })
            : fromToken;

        const toTokenAmount = transitToAddress
            ? await TokenAmount.createToken({
                  blockchain: toToken.blockchain,
                  address: compareAddresses(transitToAddress, XY_NATIVE_ADDRESS)
                      ? EvmWeb3Pure.EMPTY_ADDRESS
                      : transitToAddress,
                  weiAmount: new BigNumber(0)
              })
            : toToken;

        const routePath: RubicStep[] = [];

        if (transitFromAddress) {
            routePath.push({
                type: 'on-chain',
                provider: ON_CHAIN_TRADE_TYPE.XY_DEX,
                path: [fromToken, fromTokenAmount]
            });
        }
        routePath.push({
            type: 'cross-chain',
            provider: CROSS_CHAIN_TRADE_TYPE.XY,
            path: [fromTokenAmount, toTokenAmount]
        });
        if (transitToAddress) {
            routePath.push({
                type: 'on-chain',
                provider: ON_CHAIN_TRADE_TYPE.XY_DEX,
                path: [toTokenAmount, toToken]
            });
        }
        return routePath;
    }
}
