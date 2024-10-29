import BigNumber from 'bignumber.js';
import {
    BridgersPairIsUnavailableError,
    MaxAmountError,
    MinAmountError,
    NotSupportedTokensError
} from 'src/common/errors';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import {
    BLOCKCHAIN_NAME,
    BlockchainName,
    TronBlockchainName
} from 'src/core/blockchain/models/blockchain-name';
import { BlockchainsInfo } from 'src/core/blockchain/utils/blockchains-info/blockchains-info';
import { Web3PublicSupportedBlockchain } from 'src/core/blockchain/web3-public-service/models/web3-public-storage';
import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';
import { TronTransactionConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/tron-web3-pure/models/tron-transaction-config';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { bridgersNativeAddress } from 'src/features/common/providers/bridgers/constants/bridgers-native-address';
import { toBridgersBlockchain } from 'src/features/common/providers/bridgers/constants/to-bridgers-blockchain';
import {
    BridgersQuoteRequest,
    BridgersQuoteResponse
} from 'src/features/common/providers/bridgers/models/bridgers-quote-api';
import { getFromWithoutFee } from 'src/features/common/utils/get-from-without-fee';
import { createTokenNativeAddressProxy } from 'src/features/common/utils/token-native-address-proxy';
import { RequiredCrossChainOptions } from 'src/features/cross-chain/calculation-manager/models/cross-chain-options';
import { CROSS_CHAIN_TRADE_TYPE } from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import {
    BridgersCrossChainSupportedBlockchain,
    bridgersCrossChainSupportedBlockchains,
    BridgersEvmCrossChainSupportedBlockchain
} from 'src/features/cross-chain/calculation-manager/providers/bridgers-provider/constants/bridgers-cross-chain-supported-blockchain';
import { EvmBridgersCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/bridgers-provider/evm-bridgers-trade/evm-bridgers-cross-chain-trade';
import { TronBridgersCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/bridgers-provider/tron-bridgers-trade/tron-bridgers-cross-chain-trade';
import { CrossChainProvider } from 'src/features/cross-chain/calculation-manager/providers/common/cross-chain-provider';
import { evmCommonCrossChainAbi } from 'src/features/cross-chain/calculation-manager/providers/common/emv-cross-chain-trade/constants/evm-common-cross-chain-abi';
import { CalculationResult } from 'src/features/cross-chain/calculation-manager/providers/common/models/calculation-result';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { RubicStep } from 'src/features/cross-chain/calculation-manager/providers/common/models/rubicStep';

import { CrossChainTrade } from '../common/cross-chain-trade';
import { ProxyCrossChainEvmTrade } from '../common/proxy-cross-chain-evm-facade/proxy-cross-chain-evm-trade';

export class BridgersCrossChainProvider extends CrossChainProvider {
    public readonly type = CROSS_CHAIN_TRADE_TYPE.BRIDGERS;

    public isSupportedBlockchain(
        blockchain: BlockchainName
    ): blockchain is BridgersCrossChainSupportedBlockchain {
        return bridgersCrossChainSupportedBlockchains.some(
            supportedBlockchain => supportedBlockchain === blockchain
        );
    }

    public override areSupportedBlockchains(
        fromBlockchain: BlockchainName,
        toBlockchain: BlockchainName
    ): boolean {
        return (
            (fromBlockchain === BLOCKCHAIN_NAME.TRON && this.isSupportedBlockchain(toBlockchain)) ||
            (this.isSupportedBlockchain(fromBlockchain) && toBlockchain === BLOCKCHAIN_NAME.TRON)
        );
    }

    public async calculate(
        from: PriceTokenAmount,
        toToken: PriceToken,
        options: RequiredCrossChainOptions
    ): Promise<CalculationResult<EvmEncodeConfig | TronTransactionConfig>> {
        const fromBlockchain = from.blockchain as BridgersCrossChainSupportedBlockchain;
        const toBlockchain = toToken.blockchain as BridgersCrossChainSupportedBlockchain;
        if (!this.areSupportedBlockchains(fromBlockchain, toBlockchain)) {
            return {
                trade: null,
                error: new NotSupportedTokensError(),
                tradeType: this.type
            };
        }

        try {
            const useProxy = options?.useProxy?.[this.type] ?? true;

            let feeInfo = await this.getFeeInfo(
                fromBlockchain,
                options.providerAddress,
                from,
                useProxy
            );
            const fromWithoutFee = getFromWithoutFee(
                from,
                feeInfo.rubicProxy?.platformFee?.percent
            );

            const fromTokenAddress = createTokenNativeAddressProxy(
                fromWithoutFee,
                bridgersNativeAddress,
                false
            ).address;
            const toTokenAddress = createTokenNativeAddressProxy(
                toToken,
                bridgersNativeAddress,
                false
            ).address;
            const quoteRequest: BridgersQuoteRequest = {
                fromTokenAddress,
                toTokenAddress,
                fromTokenAmount: fromWithoutFee.stringWeiAmount,
                fromTokenChain: toBridgersBlockchain[fromBlockchain],
                toTokenChain: toBridgersBlockchain[toBlockchain]
            };
            const quoteResponse = await this.httpClient.post<BridgersQuoteResponse>(
                'https://sswap.swft.pro/api/sswap/quote',
                quoteRequest
            );
            const transactionData = quoteResponse.data?.txData;
            if (quoteResponse.resCode !== 100 || !transactionData) {
                return {
                    trade: null,
                    error: CrossChainProvider.parseError(new BridgersPairIsUnavailableError()),
                    tradeType: this.type
                };
            }

            if (from.tokenAmount.lt(transactionData.depositMin)) {
                return {
                    trade: null,
                    error: new MinAmountError(
                        new BigNumber(transactionData.depositMin),
                        from.symbol
                    ),
                    tradeType: this.type
                };
            }
            if (from.tokenAmount.gt(transactionData.depositMax)) {
                return {
                    trade: null,
                    error: new MaxAmountError(
                        new BigNumber(transactionData.depositMax),
                        from.symbol
                    ),
                    tradeType: this.type
                };
            }

            const to = new PriceTokenAmount({
                ...toToken.asStruct,
                blockchain: toBlockchain,
                tokenAmount: new BigNumber(transactionData.toTokenAmount)
            });
            const toTokenAmountMin = Web3Pure.fromWei(
                transactionData.amountOutMin,
                toToken.decimals
            );

            if (BlockchainsInfo.isEvmBlockchainName(fromBlockchain)) {
                const gasData =
                    options.gasCalculation === 'enabled' && options.receiverAddress
                        ? await EvmBridgersCrossChainTrade.getGasData(
                              from as PriceTokenAmount<BridgersEvmCrossChainSupportedBlockchain>,
                              to as PriceTokenAmount<TronBlockchainName>,
                              options.receiverAddress,
                              options.providerAddress,
                              feeInfo
                          )
                        : null;

                const evmTrade = new EvmBridgersCrossChainTrade(
                    {
                        from: from as PriceTokenAmount<BridgersEvmCrossChainSupportedBlockchain>,
                        to: to as PriceTokenAmount<TronBlockchainName>,
                        toTokenAmountMin,
                        feeInfo,
                        gasData,
                        slippage: options.slippageTolerance
                    },
                    options.providerAddress,
                    await this.getRoutePath(from, to),
                    useProxy
                );

                return this.getCalculationResponse(from, transactionData, evmTrade);
            }

            const tronTrade = new TronBridgersCrossChainTrade(
                {
                    from: from as PriceTokenAmount<TronBlockchainName>,
                    to: to as PriceTokenAmount<BridgersEvmCrossChainSupportedBlockchain>,
                    toTokenAmountMin,
                    feeInfo,
                    slippage: options.slippageTolerance,
                    contractAddress: transactionData.contractAddress
                },
                options.providerAddress,
                await this.getRoutePath(from, to)
            );

            return this.getCalculationResponse(from, transactionData, tronTrade);
        } catch (err: unknown) {
            return {
                trade: null,
                error: CrossChainProvider.parseError(err),
                tradeType: this.type
            };
        }
    }

    private getCalculationResponse(
        from: PriceTokenAmount,
        transactionData: BridgersQuoteResponse['data']['txData'],
        trade: CrossChainTrade<EvmEncodeConfig | TronTransactionConfig>
    ): CalculationResult<EvmEncodeConfig | TronTransactionConfig> {
        if (from.tokenAmount.lt(transactionData.depositMin)) {
            return {
                trade,
                error: new MinAmountError(new BigNumber(transactionData.depositMin), from.symbol),
                tradeType: this.type
            };
        }
        if (from.tokenAmount.gt(transactionData.depositMax)) {
            return {
                trade,
                error: new MaxAmountError(new BigNumber(transactionData.depositMax), from.symbol),
                tradeType: this.type
            };
        }

        return {
            trade,
            tradeType: this.type
        };
    }

    protected override async getFeeInfo(
        fromBlockchain: Web3PublicSupportedBlockchain,
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
        toToken: PriceTokenAmount
    ): Promise<RubicStep[]> {
        return [{ type: 'cross-chain', provider: this.type, path: [fromToken, toToken] }];
    }
}
