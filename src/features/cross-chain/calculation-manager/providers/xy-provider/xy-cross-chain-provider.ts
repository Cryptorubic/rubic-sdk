import BigNumber from 'bignumber.js';
import { NotSupportedTokensError } from 'src/common/errors';
import { PriceToken, PriceTokenAmount, TokenAmount } from 'src/common/tokens';
import { compareAddresses } from 'src/common/utils/blockchain';
import { BlockchainName, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { Injector } from 'src/core/injector/injector';
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
import { XyBuildTxRequest } from 'src/features/cross-chain/calculation-manager/providers/xy-provider/models/xy-build-tx-request';
import { XyCrossChainQuoteRequest } from 'src/features/cross-chain/calculation-manager/providers/xy-provider/models/xy-cross-chain-quote-request';
import { XyCrossChainQuoteResponse } from 'src/features/cross-chain/calculation-manager/providers/xy-provider/models/xy-cross-chain-quote-response';
import { XyQuoteErrorCode } from 'src/features/cross-chain/calculation-manager/providers/xy-provider/models/xy-quote-error-response';
import { XyQuote } from 'src/features/cross-chain/calculation-manager/providers/xy-provider/models/xy-quote-success-response';
import { XyCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/xy-provider/xy-cross-chain-trade';
import { ON_CHAIN_TRADE_TYPE } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';

export class XyCrossChainProvider extends CrossChainProvider {
    public static readonly apiEndpoint = 'https://aggregator-api.xy.finance/v1';

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

            const requestParams: XyCrossChainQuoteRequest = {
                srcChainId: blockchainId[fromBlockchain],
                srcQuoteTokenAddress: fromToken.isNative
                    ? XyCrossChainTrade.nativeAddress
                    : fromToken.address,
                srcQuoteTokenAmount: fromWithoutFee.stringWeiAmount,
                dstChainId: blockchainId[toBlockchain],
                dstQuoteTokenAddress: toToken.isNative
                    ? XyCrossChainTrade.nativeAddress
                    : toToken.address,
                slippage: slippageTolerance
            };

            const { routes, errorCode, errorMsg } =
                await Injector.httpClient.get<XyCrossChainQuoteResponse>(
                    `${XyCrossChainProvider.apiEndpoint}/quote`,
                    {
                        params: { ...requestParams }
                    }
                );
            this.analyzeStatusCode(errorCode, errorMsg);

            const {
                srcSwapDescription,
                bridgeDescription,
                dstSwapDescription,
                dstQuoteTokenAmount
            } = routes[0]!;

            console.log('============================');
            console.log('Src swap provider: ', srcSwapDescription?.provider);
            console.log('Src swap dexNames: ', srcSwapDescription?.dexNames);
            console.log('Bridge swap provider: ', bridgeDescription?.provider);
            console.log('Dst swap provider: ', dstSwapDescription?.provider);
            console.log('Dst swap dexNames: ', dstSwapDescription?.dexNames);
            console.log('============================');

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

            const gasData =
                options.gasCalculation === 'enabled'
                    ? await XyCrossChainTrade.getGasData(
                          fromToken,
                          to,
                          buildTxTransactionRequest,
                          feeInfo,
                          options.providerAddress
                      )
                    : null;

            return {
                trade: new XyCrossChainTrade(
                    {
                        from: fromToken,
                        to,
                        transactionRequest: buildTxTransactionRequest,
                        gasData,
                        priceImpact: fromToken.calculatePriceImpactPercent(to),
                        slippage: options.slippageTolerance,
                        feeInfo,
                        onChainTrade: null
                    },
                    options.providerAddress,
                    await this.getRoutePath(fromToken, to, {
                        srcSwapDescription,
                        bridgeDescription,
                        dstSwapDescription,
                        dstQuoteTokenAmount
                    })
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

    private analyzeStatusCode(code: XyQuoteErrorCode, message: string): void {
        console.log('========CALCULATE========');
        console.log('Error Code: ', code);
        console.log('Error msg: ', message);
        // switch (code) {
        //     case '0':
        //         break;
        //     case '3':
        //     case '4':
        //         throw new InsufficientLiquidityError();
        //     case '6': {
        //         const [minAmount, tokenSymbol] = message.split('to ')[1]!.slice(0, -1).split(' ');
        //         throw new MinAmountError(new BigNumber(minAmount!), tokenSymbol!);
        //     }
        //     case '5':
        //     case '10':
        //     case '99':
        //     default:
        //         throw new RubicSdkError('Unknown Error.');
        // }
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
                  address: compareAddresses(transitFromAddress, XyCrossChainTrade.nativeAddress)
                      ? EvmWeb3Pure.EMPTY_ADDRESS
                      : transitFromAddress,
                  weiAmount: new BigNumber(0)
              })
            : fromToken;

        const toTokenAmount = transitToAddress
            ? await TokenAmount.createToken({
                  blockchain: toToken.blockchain,
                  address: compareAddresses(transitToAddress, XyCrossChainTrade.nativeAddress)
                      ? EvmWeb3Pure.EMPTY_ADDRESS
                      : transitToAddress,
                  weiAmount: new BigNumber(0)
              })
            : toToken;

        const routePath: RubicStep[] = [];

        if (transitFromAddress) {
            routePath.push({
                type: 'on-chain',
                // @TODO provider: ON_CHAIN_TRADE_TYPE.XY_DEX,
                provider: ON_CHAIN_TRADE_TYPE.ONE_INCH,
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
                // @TODO provider: ON_CHAIN_TRADE_TYPE.XY_DEX,
                provider: ON_CHAIN_TRADE_TYPE.ONE_INCH,
                path: [toTokenAmount, toToken]
            });
        }
        return routePath;
    }
}
