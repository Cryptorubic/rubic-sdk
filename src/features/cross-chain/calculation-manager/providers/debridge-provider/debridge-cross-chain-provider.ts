import BigNumber from 'bignumber.js';
import { RubicSdkError, TooLowAmountError } from 'src/common/errors';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { nativeTokensList } from 'src/common/tokens/constants/native-tokens';
import { BlockchainName, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { Injector } from 'src/core/injector/injector';
import { RequiredCrossChainOptions } from 'src/features/cross-chain/calculation-manager/models/cross-chain-options';
import { CROSS_CHAIN_TRADE_TYPE } from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { CrossChainProvider } from 'src/features/cross-chain/calculation-manager/providers/common/cross-chain-provider';
import { evmCommonCrossChainAbi } from 'src/features/cross-chain/calculation-manager/providers/common/emv-cross-chain-trade/constants/evm-common-cross-chain-abi';
import { CalculationResult } from 'src/features/cross-chain/calculation-manager/providers/common/models/calculation-result';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { DE_BRIDGE_CONTRACT_ADDRESS } from 'src/features/cross-chain/calculation-manager/providers/debridge-provider/constants/contract-address';
import {
    DeBridgeCrossChainSupportedBlockchain,
    deBridgeCrossChainSupportedBlockchains
} from 'src/features/cross-chain/calculation-manager/providers/debridge-provider/constants/debridge-cross-chain-supported-blockchain';
import { DebridgeCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/debridge-provider/debridge-cross-chain-trade';
import { TransactionRequest } from 'src/features/cross-chain/calculation-manager/providers/debridge-provider/models/transaction-request';
import {
    TransactionErrorResponse,
    TransactionResponse
} from 'src/features/cross-chain/calculation-manager/providers/debridge-provider/models/transaction-response';

export class DebridgeCrossChainProvider extends CrossChainProvider {
    public static readonly apiEndpoint = 'https://api.dln.trade/v1.0/dln/quote';

    private readonly deBridgeReferralCode = '4350';

    public readonly type = CROSS_CHAIN_TRADE_TYPE.DEBRIDGE;

    public isSupportedBlockchain(
        blockchain: BlockchainName
    ): blockchain is DeBridgeCrossChainSupportedBlockchain {
        return deBridgeCrossChainSupportedBlockchains.some(
            supportedBlockchain => supportedBlockchain === blockchain
        );
    }

    public async calculate(
        from: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>,
        options: RequiredCrossChainOptions
    ): Promise<CalculationResult> {
        const fromBlockchain = from.blockchain as DeBridgeCrossChainSupportedBlockchain;
        const toBlockchain = toToken.blockchain as DeBridgeCrossChainSupportedBlockchain;
        if (!this.areSupportedBlockchains(fromBlockchain, toBlockchain)) {
            return null;
        }

        try {
            const fromAddress = options.fromAddress || this.getWalletAddress(fromBlockchain);

            // const feeInfo = await this.getFeeInfo(fromBlockchain, options.providerAddress);
            // const fromWithoutFee = getFromWithoutFee(
            //     from,
            //     feeInfo.rubicProxy?.platformFee?.percent
            // );

            const slippageTolerance = options.slippageTolerance * 100;
            const fakeAddress = '0xe388Ed184958062a2ea29B7fD049ca21244AE02e';

            const requestParams: TransactionRequest = {
                srcChainId: blockchainId[fromBlockchain],
                srcChainTokenIn: from.address,
                srcChainTokenInAmount: from.stringWeiAmount,
                slippage: slippageTolerance,
                dstChainId: blockchainId[toBlockchain],
                dstChainTokenOut: toToken.address,
                dstChainTokenOutRecipient: this.getWalletAddress(fromBlockchain) || fakeAddress,
                referralCode: this.deBridgeReferralCode
            };

            const { tx, estimation } = await Injector.httpClient.get<TransactionResponse>(
                DebridgeCrossChainProvider.apiEndpoint,
                {
                    params: requestParams as unknown as {}
                }
            );

            const to = new PriceTokenAmount({
                ...toToken.asStruct,
                tokenAmount: Web3Pure.fromWei(
                    estimation.dstChainTokenOut.amount,
                    estimation.dstChainTokenOut.decimals
                )
            });

            const gasData =
                options.gasCalculation === 'enabled'
                    ? await DebridgeCrossChainTrade.getGasData(from, to, requestParams)
                    : null;

            const transitToken = estimation.srcChainTokenOut || estimation.srcChainTokenIn;

            const cryptoFeeAmount = new BigNumber(tx.value).minus(
                from.isNative ? from.stringWeiAmount : 0
            );
            // feeInfo.provider = {
            //     ...feeInfo?.provider,
            //     cryptoFee: {
            //         amount: Web3Pure.fromWei(cryptoFeeAmount),
            //         tokenSymbol: nativeTokensList[fromBlockchain].symbol
            //     }
            // };

            const nativeToken = nativeTokensList[fromBlockchain];
            const cryptoFeeToken = await PriceTokenAmount.createFromToken({
                ...nativeToken,
                weiAmount: cryptoFeeAmount
            });

            return {
                trade: new DebridgeCrossChainTrade(
                    {
                        from,
                        to,
                        transactionRequest: {
                            ...requestParams,
                            dstChainTokenOutRecipient: fromAddress
                        },
                        gasData,
                        priceImpact: from.calculatePriceImpactPercent(to) || 0,
                        slippage: options.slippageTolerance,
                        feeInfo: {
                            provider: {
                                cryptoFee: {
                                    amount: Web3Pure.fromWei(cryptoFeeAmount),
                                    tokenSymbol: nativeTokensList[fromBlockchain].symbol
                                }
                            }
                        },
                        transitAmount: Web3Pure.fromWei(transitToken.amount, transitToken.decimals),
                        cryptoFeeToken,
                        onChainTrade: null
                    },
                    options.providerAddress
                )
            };
        } catch (err) {
            const rubicSdkError = CrossChainProvider.parseError(err);
            const debridgeApiError = this.parseDebridgeApiError(err);

            return {
                trade: null,
                error: debridgeApiError || rubicSdkError
            };
        }
    }

    protected async getFeeInfo(
        fromBlockchain: DeBridgeCrossChainSupportedBlockchain,
        providerAddress: string
    ): Promise<FeeInfo> {
        return {
            rubicProxy: {
                fixedFee: {
                    amount: await this.getFixedFee(
                        fromBlockchain,
                        providerAddress,
                        DE_BRIDGE_CONTRACT_ADDRESS[fromBlockchain].rubicRouter,
                        evmCommonCrossChainAbi
                    ),
                    tokenSymbol: nativeTokensList[fromBlockchain].symbol
                },
                platformFee: {
                    percent: await this.getFeePercent(
                        fromBlockchain,
                        providerAddress,
                        DE_BRIDGE_CONTRACT_ADDRESS[fromBlockchain].rubicRouter,
                        evmCommonCrossChainAbi
                    ),
                    tokenSymbol: 'USDC'
                }
            }
        };
    }

    private parseDebridgeApiError(httpErrorResponse: {
        error: TransactionErrorResponse;
    }): RubicSdkError | null {
        if (httpErrorResponse?.error?.errorId === 'INCLUDED_GAS_FEE_NOT_COVERED_BY_INPUT_AMOUNT') {
            return new TooLowAmountError();
        }

        // @TODO handle other debridge API error codes:
        // CONNECTOR_1INCH_RETURNED_ERROR
        // INCLUDED_GAS_FEE_CANNOT_BE_ESTIMATED_FOR_TRANSACTION_BUNDLE

        return null;
    }
}
