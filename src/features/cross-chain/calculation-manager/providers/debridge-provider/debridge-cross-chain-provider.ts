import BigNumber from 'bignumber.js';
import { NotSupportedTokensError, RubicSdkError, TooLowAmountError } from 'src/common/errors';
import { PriceToken, PriceTokenAmount, TokenAmount } from 'src/common/tokens';
import { nativeTokensList } from 'src/common/tokens/constants/native-tokens';
import {
    BLOCKCHAIN_NAME,
    BlockchainName,
    EvmBlockchainName
} from 'src/core/blockchain/models/blockchain-name';
import { CHAIN_TYPE } from 'src/core/blockchain/models/chain-type';
import { BlockchainsInfo } from 'src/core/blockchain/utils/blockchains-info/blockchains-info';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { DlnApiService } from 'src/features/common/providers/dln/dln-api-service';
import { DlnUtils } from 'src/features/common/providers/dln/dln-utils';
import { getFromWithoutFee } from 'src/features/common/utils/get-from-without-fee';
import { RequiredCrossChainOptions } from 'src/features/cross-chain/calculation-manager/models/cross-chain-options';
import { CROSS_CHAIN_TRADE_TYPE } from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { CrossChainProvider } from 'src/features/cross-chain/calculation-manager/providers/common/cross-chain-provider';
import { GasData } from 'src/features/cross-chain/calculation-manager/providers/common/emv-cross-chain-trade/models/gas-data';
import { CalculationResult } from 'src/features/cross-chain/calculation-manager/providers/common/models/calculation-result';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { RubicStep } from 'src/features/cross-chain/calculation-manager/providers/common/models/rubicStep';
import { ProxyCrossChainEvmTrade } from 'src/features/cross-chain/calculation-manager/providers/common/proxy-cross-chain-evm-facade/proxy-cross-chain-evm-trade';
import { DebridgeEvmCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/debridge-provider/chains/debridge-evm-cross-chain-trade';
import {
    DeBridgeCrossChainSupportedBlockchain,
    deBridgeCrossChainSupportedBlockchains
} from 'src/features/cross-chain/calculation-manager/providers/debridge-provider/constants/debridge-cross-chain-supported-blockchain';
import { DebridgeCrossChainFactory } from 'src/features/cross-chain/calculation-manager/providers/debridge-provider/debridge-cross-chain-factory';
import { Estimation } from 'src/features/cross-chain/calculation-manager/providers/debridge-provider/models/estimation-response';
import { TransactionRequest } from 'src/features/cross-chain/calculation-manager/providers/debridge-provider/models/transaction-request';
import {
    DlnEvmTransactionResponse,
    DlnSolanaTransactionResponse,
    TransactionErrorResponse
} from 'src/features/cross-chain/calculation-manager/providers/debridge-provider/models/transaction-response';
import { DeflationTokenManager } from 'src/features/deflation-token-manager/deflation-token-manager';
import { DlnOnChainSupportedBlockchain } from 'src/features/on-chain/calculation-manager/providers/aggregators/dln/constants/dln-on-chain-supported-blockchains';
import { DlnOnChainSwapRequest } from 'src/features/on-chain/calculation-manager/providers/aggregators/dln/models/dln-on-chain-swap-request';
import { ON_CHAIN_TRADE_TYPE } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';

export class DebridgeCrossChainProvider extends CrossChainProvider {
    public readonly type = CROSS_CHAIN_TRADE_TYPE.DEBRIDGE;

    public isSupportedBlockchain(
        blockchain: BlockchainName
    ): blockchain is DeBridgeCrossChainSupportedBlockchain {
        return deBridgeCrossChainSupportedBlockchains.some(
            supportedBlockchain => supportedBlockchain === blockchain
        );
    }

    public async calculate(
        from: PriceTokenAmount<DeBridgeCrossChainSupportedBlockchain>,
        toToken: PriceToken<DeBridgeCrossChainSupportedBlockchain>,
        options: RequiredCrossChainOptions
    ): Promise<CalculationResult<EvmEncodeConfig | { data: string }>> {
        const fromBlockchain = from.blockchain;
        const toBlockchain = toToken.blockchain;
        const useProxy = options?.useProxy?.[this.type] ?? true;

        await this.checkDeflationTokens(from, toToken);

        if (!this.areSupportedBlockchains(fromBlockchain, toBlockchain)) {
            return {
                trade: null,
                error: new NotSupportedTokensError(),
                tradeType: this.type
            };
        }

        try {
            const fakeAddress = DlnUtils.getFakeReceiver(toBlockchain);

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

            const requestParams: TransactionRequest = {
                ...this.getAffiliateFee(fromBlockchain),
                srcChainId: blockchainId[fromBlockchain],
                srcChainTokenIn: DlnUtils.getSupportedAddress(from),
                srcChainTokenInAmount: fromWithoutFee.stringWeiAmount,
                dstChainId: blockchainId[toBlockchain],
                dstChainTokenOut: DlnUtils.getSupportedAddress(toToken),
                dstChainTokenOutRecipient: this.getWalletAddress(fromBlockchain) || fakeAddress,
                prependOperatingExpenses: false
            };

            const debridgeResponse = await DlnApiService.fetchCrossChainQuote<
                DlnEvmTransactionResponse | DlnSolanaTransactionResponse
            >(requestParams);

            const to = new PriceTokenAmount({
                ...toToken.asStruct,
                tokenAmount: Web3Pure.fromWei(
                    debridgeResponse.estimation.dstChainTokenOut.maxTheoreticalAmount,
                    debridgeResponse.estimation.dstChainTokenOut.decimals
                )
            });

            const toTokenAmountMin = Web3Pure.fromWei(
                debridgeResponse.estimation.dstChainTokenOut.amount,
                debridgeResponse.estimation.dstChainTokenOut.decimals
            );
            const slippage = Number(
                to.tokenAmount
                    .minus(toTokenAmountMin)
                    .dividedBy(toTokenAmountMin)
                    .multipliedBy(100)
                    .toFixed(2)
            );

            const transitToken =
                debridgeResponse.estimation.srcChainTokenOut ||
                debridgeResponse.estimation.srcChainTokenIn;

            const nativeToken = nativeTokensList[fromBlockchain];
            const cryptoFeeToken = await PriceTokenAmount.createFromToken({
                ...nativeToken,
                weiAmount: new BigNumber(debridgeResponse.fixFee)
            });

            const gasData = await this.getGasData(
                { ...options, receiverAddress: fakeAddress },
                from,
                to,
                requestParams,
                feeInfo
            );

            return {
                trade: DebridgeCrossChainFactory.createTrade(
                    fromBlockchain,
                    {
                        from,
                        to,
                        transactionRequest: requestParams,
                        gasData,
                        priceImpact: from.calculatePriceImpactPercent(to),
                        allowanceTarget: (
                            debridgeResponse?.tx as { allowanceTarget: string | undefined }
                        )?.allowanceTarget,
                        slippage,
                        feeInfo: {
                            ...feeInfo,
                            provider: {
                                cryptoFee: {
                                    amount: Web3Pure.fromWei(
                                        cryptoFeeToken.stringWeiAmount,
                                        cryptoFeeToken.decimals
                                    ),
                                    token: cryptoFeeToken
                                }
                            }
                        },
                        transitAmount: Web3Pure.fromWei(transitToken.amount, transitToken.decimals),
                        toTokenAmountMin,
                        cryptoFeeToken,
                        onChainTrade: null
                    },
                    options.providerAddress,
                    await this.getRoutePath(debridgeResponse.estimation, from, to)
                ),
                tradeType: this.type
            };
        } catch (err) {
            const rubicSdkError = CrossChainProvider.parseError(err);
            const debridgeApiError = this.parseDebridgeApiError(err);

            return {
                trade: null,
                error: debridgeApiError || rubicSdkError,
                tradeType: this.type
            };
        }
    }

    protected async getFeeInfo(
        fromBlockchain: DeBridgeCrossChainSupportedBlockchain,
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

    private parseDebridgeApiError(httpErrorResponse: {
        error: TransactionErrorResponse;
    }): RubicSdkError | null {
        if (
            httpErrorResponse?.error?.errorId === 'INCLUDED_GAS_FEE_NOT_COVERED_BY_INPUT_AMOUNT' ||
            httpErrorResponse?.error?.errorId === 'ERROR_LOW_GIVE_AMOUNT'
        ) {
            return new TooLowAmountError();
        }

        // @TODO handle other debridge API error codes:
        // CONNECTOR_1INCH_RETURNED_ERROR
        // INCLUDED_GAS_FEE_CANNOT_BE_ESTIMATED_FOR_TRANSACTION_BUNDLE

        return null;
    }

    protected async getRoutePath(
        estimation: Estimation,
        from: PriceTokenAmount,
        to: PriceTokenAmount
    ): Promise<RubicStep[]> {
        const fromChainId = String(blockchainId[from.blockchain]);
        const toChainId = String(blockchainId[to.blockchain]);

        const transitFrom = [...estimation.costsDetails]
            .reverse()
            .find(el => el.chain === fromChainId);
        const transitTo = estimation.costsDetails.find(el => el.chain === toChainId);

        try {
            const fromTokenAmount = transitFrom
                ? await TokenAmount.createToken({
                      blockchain: from.blockchain,
                      address: transitFrom!.tokenOut,
                      weiAmount: new BigNumber(transitFrom!.amountOut)
                  })
                : from;

            const toTokenAmount = transitTo
                ? await TokenAmount.createToken({
                      blockchain: to.blockchain,
                      address: transitTo!.tokenIn,
                      weiAmount: new BigNumber(transitTo!.amountIn)
                  })
                : to;

            return [
                {
                    type: 'on-chain',
                    path: [from, fromTokenAmount],
                    provider: ON_CHAIN_TRADE_TYPE.DLN
                },
                {
                    type: 'on-chain',
                    path: [toTokenAmount, to],
                    provider: ON_CHAIN_TRADE_TYPE.DLN
                }
            ];
        } catch {
            return [
                {
                    type: 'cross-chain',
                    path: [from, to],
                    provider: CROSS_CHAIN_TRADE_TYPE.DEBRIDGE
                }
            ];
        }
    }

    private async getGasData(
        options: RequiredCrossChainOptions,
        from: PriceTokenAmount<DeBridgeCrossChainSupportedBlockchain>,
        to: PriceTokenAmount<DeBridgeCrossChainSupportedBlockchain>,
        requestParams: TransactionRequest,
        feeInfo: FeeInfo
    ): Promise<GasData | null> {
        if (options.gasCalculation !== 'enabled') {
            return null;
        }

        const blockchain = from.blockchain;
        const chainType = BlockchainsInfo.getChainType(blockchain);

        if (chainType === CHAIN_TYPE.EVM) {
            return DebridgeEvmCrossChainTrade.getGasData(
                from as PriceTokenAmount<EvmBlockchainName>,
                to as PriceTokenAmount<EvmBlockchainName>,
                requestParams,
                feeInfo,
                options.providerAddress,
                options.receiverAddress
            );
        }
        // Chain is not supported
        return null;
    }

    private async checkDeflationTokens(
        from: PriceTokenAmount<BlockchainName>,
        toToken: PriceToken<BlockchainName>
    ): Promise<void> {
        const deflationTokenManager = new DeflationTokenManager();
        await deflationTokenManager.checkToken(from);
        await deflationTokenManager.checkToken(toToken);
    }

    private getAffiliateFee(
        fromBlockchain: DlnOnChainSupportedBlockchain
    ): Partial<Pick<DlnOnChainSwapRequest, 'affiliateFeePercent' | 'affiliateFeeRecipient'>> {
        if (fromBlockchain === BLOCKCHAIN_NAME.SOLANA) {
            return {
                affiliateFeeRecipient: '4juPxgyQapaKdgxuCS7N8pRxjttXGRZsS5WTVZ42rNjn',
                affiliateFeePercent: 0.1
            };
        }
        return {};
    }
}
