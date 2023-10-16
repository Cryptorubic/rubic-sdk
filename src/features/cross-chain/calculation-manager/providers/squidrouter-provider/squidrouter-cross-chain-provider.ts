import BigNumber from 'bignumber.js';
import { NotSupportedTokensError, RubicSdkError } from 'src/common/errors';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { nativeTokensList } from 'src/common/tokens/constants/native-tokens';
import { compareAddresses } from 'src/common/utils/blockchain';
import { BlockchainName, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { Injector } from 'src/core/injector/injector';
import { getFromWithoutFee } from 'src/features/common/utils/get-from-without-fee';
import { RequiredCrossChainOptions } from 'src/features/cross-chain/calculation-manager/models/cross-chain-options';
import { CROSS_CHAIN_TRADE_TYPE } from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { CrossChainProvider } from 'src/features/cross-chain/calculation-manager/providers/common/cross-chain-provider';
import { CalculationResult } from 'src/features/cross-chain/calculation-manager/providers/common/models/calculation-result';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { ProxyCrossChainEvmTrade } from 'src/features/cross-chain/calculation-manager/providers/common/proxy-cross-chain-evm-facade/proxy-cross-chain-evm-trade';
import {
    SquidrouterCrossChainSupportedBlockchain,
    squidrouterCrossChainSupportedBlockchains
} from 'src/features/cross-chain/calculation-manager/providers/squidrouter-provider/constants/squidrouter-cross-chain-supported-blockchain';
import { SquidrouterTransactionRequest } from 'src/features/cross-chain/calculation-manager/providers/squidrouter-provider/models/transaction-request';
import { SquidrouterTransactionResponse } from 'src/features/cross-chain/calculation-manager/providers/squidrouter-provider/models/transaction-response';
import { SquidrouterCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/squidrouter-provider/squidrouter-cross-chain-trade';

export class SquidrouterCrossChainProvider extends CrossChainProvider {
    public static readonly apiEndpoint = 'https://api.0xsquid.com/v1/';

    private readonly nativeAddress = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';

    public readonly type = CROSS_CHAIN_TRADE_TYPE.SQUIDROUTER;

    public isSupportedBlockchain(
        blockchain: BlockchainName
    ): blockchain is SquidrouterCrossChainSupportedBlockchain {
        return squidrouterCrossChainSupportedBlockchains.some(
            supportedBlockchain => supportedBlockchain === blockchain
        );
    }

    public async calculate(
        from: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>,
        options: RequiredCrossChainOptions
    ): Promise<CalculationResult> {
        const fromBlockchain = from.blockchain as SquidrouterCrossChainSupportedBlockchain;
        const toBlockchain = toToken.blockchain as SquidrouterCrossChainSupportedBlockchain;
        if (!this.areSupportedBlockchains(fromBlockchain, toBlockchain)) {
            return {
                trade: null,
                error: new NotSupportedTokensError(),
                tradeType: this.type
            };
        }

        try {
            const feeInfo = await this.getFeeInfo(
                fromBlockchain,
                options.providerAddress,
                from,
                options?.useProxy?.[this.type] ?? true
            );
            const fromWithoutFee = getFromWithoutFee(
                from,
                feeInfo.rubicProxy?.platformFee?.percent
            );

            const fakeAddress = '0xe388Ed184958062a2ea29B7fD049ca21244AE02e';

            const transactionRequest = async (receiverAddress: string) => {
                const requestParams: SquidrouterTransactionRequest = {
                    fromChain: blockchainId[fromBlockchain],
                    fromToken: from.isNative ? this.nativeAddress : from.address,
                    fromAmount: fromWithoutFee.stringWeiAmount,
                    toChain: blockchainId[toBlockchain],
                    toToken: toToken.isNative ? this.nativeAddress : toToken.address,
                    toAddress: receiverAddress,
                    slippage: Number(options.slippageTolerance * 100)
                };

                return Injector.httpClient.get<SquidrouterTransactionResponse>(
                    `${SquidrouterCrossChainProvider.apiEndpoint}route`,
                    {
                        params: requestParams as unknown as {},
                        headers: {
                            'x-integrator-id': 'rubic-api'
                        }
                    }
                );
            };

            const {
                route: { estimate, transactionRequest: tx }
            } = await transactionRequest(
                options?.receiverAddress || this.getWalletAddress(fromBlockchain) || fakeAddress
            );

            const to = new PriceTokenAmount({
                ...toToken.asStruct,
                tokenAmount: Web3Pure.fromWei(estimate.toAmount, toToken.decimals)
            });

            const gasData =
                options.gasCalculation === 'enabled'
                    ? await SquidrouterCrossChainTrade.getGasData(from, to, transactionRequest)
                    : null;

            const feeAmount = estimate.feeCosts
                .filter(fee => compareAddresses(this.nativeAddress, fee.token.address))
                .reduce((acc, fee) => acc.plus(fee.amount), new BigNumber(0));
            const nativeToken = nativeTokensList[fromBlockchain];
            const cryptoFeeToken = await PriceTokenAmount.createFromToken({
                ...nativeToken,
                weiAmount: new BigNumber(feeAmount)
            });

            const transitRoute = estimate.route.toChain.at(-1)!;

            const transitUSDAmount =
                'toAmount' in transitRoute
                    ? Web3Pure.fromWei(transitRoute.toAmount, transitRoute.toToken.decimals)
                    : new BigNumber(estimate.toAmountUSD);

            return {
                trade: new SquidrouterCrossChainTrade(
                    {
                        from,
                        to,
                        transactionRequest,
                        gasData,
                        priceImpact: from.calculatePriceImpactPercent(to),
                        allowanceTarget: tx.targetAddress,
                        slippage: options.slippageTolerance,
                        feeInfo: {
                            ...feeInfo,
                            provider: {
                                cryptoFee: {
                                    amount: Web3Pure.fromWei(feeAmount, nativeToken.decimals),
                                    tokenSymbol: nativeTokensList[fromBlockchain].symbol
                                }
                            }
                        },
                        transitUSDAmount,
                        cryptoFeeToken,
                        onChainTrade: null,
                        onChainSubtype: { from: undefined, to: undefined }
                    },
                    options.providerAddress
                ),
                tradeType: this.type
            };
        } catch (err) {
            let rubicSdkError = CrossChainProvider.parseError(err);
            const httpError = err?.error?.errors?.[0];
            if (httpError?.message) {
                rubicSdkError = new RubicSdkError(httpError.message);
            }

            return {
                trade: null,
                error: rubicSdkError,
                tradeType: this.type
            };
        }
    }

    protected async getFeeInfo(
        fromBlockchain: SquidrouterCrossChainSupportedBlockchain,
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
