import { CrossChainTradeProvider } from '@rsdk-features/cross-chain/providers/common/cross-chain-trade-provider';
import { CROSS_CHAIN_TRADE_TYPE } from 'src/features';
import { BlockchainName, BlockchainsInfo, PriceToken, Web3Pure } from 'src/core';
import { RequiredCrossChainOptions } from '@rsdk-features/cross-chain/models/cross-chain-options';
import { Injector } from '@rsdk-core/sdk/injector';
import { PriceTokenAmount } from '@rsdk-core/blockchain/tokens/price-token-amount';
import {
    DeBridgeCrossChainSupportedBlockchain,
    deBridgeCrossChainSupportedBlockchains
} from 'src/features/cross-chain/providers/debridge-trade-provider/constants/debridge-cross-chain-supported-blockchain';
import { TransactionRequest } from 'src/features/cross-chain/providers/debridge-trade-provider/models/transaction-request';
import {
    TransactionErrorResponse,
    TransactionResponse
} from 'src/features/cross-chain/providers/debridge-trade-provider/models/transaction-response';
import { DebridgeCrossChainTrade } from 'src/features/cross-chain/providers/debridge-trade-provider/debridge-cross-chain-trade';
import { DE_BRIDGE_CONTRACT_ADDRESS } from 'src/features/cross-chain/providers/debridge-trade-provider/constants/contract-address';
import { FeeInfo } from 'src/features/cross-chain/providers/common/models/fee';
import { commonCrossChainAbi } from 'src/features/cross-chain/providers/common/constants/common-cross-chain-abi';
import { nativeTokensList } from 'src/core/blockchain/constants/native-tokens';
import BigNumber from 'bignumber.js';
import { EMPTY_ADDRESS } from 'src/core/blockchain/constants/empty-address';
import { RubicSdkError } from 'src/common';
import { TooLowAmountError } from 'src/common/errors/cross-chain/too-low-amount.error';
import { CalculationResult } from 'src/features/cross-chain/providers/common/models/calculation-result';
import { getFromWithoutFee } from 'src/features/cross-chain/utils/get-from-without-fee';

export class DebridgeCrossChainTradeProvider extends CrossChainTradeProvider {
    public static isSupportedBlockchain(
        blockchain: BlockchainName
    ): blockchain is DeBridgeCrossChainSupportedBlockchain {
        return deBridgeCrossChainSupportedBlockchains.some(
            supportedBlockchain => supportedBlockchain === blockchain
        );
    }

    public static readonly apiEndpoint = 'https://deswap.debridge.finance/v1.0/transaction';

    private readonly deBridgeReferralCode = '4350';

    public readonly type = CROSS_CHAIN_TRADE_TYPE.DEBRIDGE;

    protected get walletAddress(): string {
        return Injector.web3Private.address;
    }

    public isSupportedBlockchains(
        fromBlockchain: BlockchainName,
        toBlockchain: BlockchainName
    ): boolean {
        return (
            DebridgeCrossChainTradeProvider.isSupportedBlockchain(fromBlockchain) &&
            DebridgeCrossChainTradeProvider.isSupportedBlockchain(toBlockchain)
        );
    }

    public async calculate(
        from: PriceTokenAmount,
        toToken: PriceToken,
        options: RequiredCrossChainOptions
    ): Promise<CalculationResult> {
        const fromBlockchain = from.blockchain;
        const toBlockchain = toToken.blockchain;
        if (
            !DebridgeCrossChainTradeProvider.isSupportedBlockchain(fromBlockchain) ||
            !DebridgeCrossChainTradeProvider.isSupportedBlockchain(toBlockchain)
        ) {
            return null;
        }

        try {
            const fromAddress = options.fromAddress || this.walletAddress;

            await this.checkContractState(
                fromBlockchain,
                DE_BRIDGE_CONTRACT_ADDRESS[fromBlockchain].rubicRouter
            );

            const feeInfo = await this.getFeeInfo(fromBlockchain, options.providerAddress);
            const fromWithoutFee = getFromWithoutFee(from, feeInfo);

            const slippageTolerance = options.slippageTolerance * 100;

            const requestParams: TransactionRequest = {
                srcChainId: BlockchainsInfo.getBlockchainByName(fromBlockchain).id,
                srcChainTokenIn: from.address,
                srcChainTokenInAmount: fromWithoutFee.stringWeiAmount,
                slippage: slippageTolerance,
                dstChainId: BlockchainsInfo.getBlockchainByName(toBlockchain).id,
                dstChainTokenOut: toToken.address,
                dstChainTokenOutRecipient: EMPTY_ADDRESS,
                referralCode: this.deBridgeReferralCode
            };

            const { tx, estimation } = await Injector.httpClient.get<TransactionResponse>(
                DebridgeCrossChainTradeProvider.apiEndpoint,
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

            const transitToken = estimation.srcChainTokenOut;

            const cryptoFeeAmount = new BigNumber(tx.value).minus(
                from.isNative ? from.stringWeiAmount : 0
            );

            const nativeToken = BlockchainsInfo.getBlockchainByName(fromBlockchain).nativeCoin;
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
                        // @TODO price impact
                        priceImpact: 0,
                        slippage: options.slippageTolerance,
                        feeInfo: {
                            ...feeInfo,
                            cryptoFee: {
                                amount: Web3Pure.fromWei(cryptoFeeAmount),
                                tokenSymbol: nativeTokensList[fromBlockchain].symbol
                            }
                        },
                        transitAmount: Web3Pure.fromWei(transitToken.amount, transitToken.decimals),
                        cryptoFeeToken
                    },
                    options.providerAddress
                )
            };
        } catch (err) {
            const rubicSdkError = CrossChainTradeProvider.parseError(err);
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
            fixedFee: {
                amount: await this.getFixedFee(
                    fromBlockchain,
                    providerAddress,
                    DE_BRIDGE_CONTRACT_ADDRESS[fromBlockchain].rubicRouter,
                    commonCrossChainAbi
                ),
                tokenSymbol: nativeTokensList[fromBlockchain].symbol
            },
            platformFee: {
                percent: await this.getFeePercent(
                    fromBlockchain,
                    providerAddress,
                    DE_BRIDGE_CONTRACT_ADDRESS[fromBlockchain].rubicRouter,
                    commonCrossChainAbi
                ),
                tokenSymbol: 'USDC'
            },
            cryptoFee: null
        };
    }

    private parseDebridgeApiError(httpErrorResponse: {
        error: TransactionErrorResponse;
    }): RubicSdkError | null {
        if (httpErrorResponse.error.errorId === 'INCLUDED_GAS_FEE_NOT_COVERED_BY_INPUT_AMOUNT') {
            return new TooLowAmountError();
        }

        // @TODO handle other debridge API error codes:
        // CONNECTOR_1INCH_RETURNED_ERROR
        // INCLUDED_GAS_FEE_CANNOT_BE_ESTIMATED_FOR_TRANSACTION_BUNDLE

        return null;
    }
}
