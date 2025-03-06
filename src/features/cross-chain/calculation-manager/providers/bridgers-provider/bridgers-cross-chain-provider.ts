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
    EvmBlockchainName,
    TronBlockchainName
} from 'src/core/blockchain/models/blockchain-name';
import { TonEncodedConfig } from 'src/core/blockchain/web3-private-service/web3-private/ton-web3-private/models/ton-types';
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
import { BridgersCrossChainProviderFactory } from 'src/features/cross-chain/calculation-manager/providers/bridgers-provider/bridgers-cross-chain-provider-factory';
import {
    BridgersCrossChainSupportedBlockchain,
    bridgersCrossChainSupportedBlockchains
} from 'src/features/cross-chain/calculation-manager/providers/bridgers-provider/constants/bridgers-cross-chain-supported-blockchain';
import { CrossChainProvider } from 'src/features/cross-chain/calculation-manager/providers/common/cross-chain-provider';
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
            (this.isSupportedBlockchain(fromBlockchain) && toBlockchain === BLOCKCHAIN_NAME.TON) ||
            (fromBlockchain === BLOCKCHAIN_NAME.TON && this.isSupportedBlockchain(toBlockchain)) ||
            (fromBlockchain === BLOCKCHAIN_NAME.TRON && this.isSupportedBlockchain(toBlockchain)) ||
            (this.isSupportedBlockchain(fromBlockchain) && toBlockchain === BLOCKCHAIN_NAME.TRON)
        );
    }

    public async calculate(
        from: PriceTokenAmount,
        toToken: PriceToken,
        options: RequiredCrossChainOptions
    ): Promise<CalculationResult> {
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
                    error: new BridgersPairIsUnavailableError(),
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

            const trade = BridgersCrossChainProviderFactory.createTrade({
                crossChainTrade: {
                    from: from as
                        | PriceTokenAmount<EvmBlockchainName>
                        | PriceTokenAmount<TronBlockchainName>,
                    to,
                    toTokenAmountMin,
                    feeInfo,
                    gasData: await this.getGasData(from),
                    slippage: options.slippageTolerance
                },
                providerAddress: options.providerAddress,
                routePath: await this.getRoutePath(from, to),
                useProxy
            });

            return this.getCalculationResponse(
                from,
                transactionData,
                trade as CrossChainTrade<EvmEncodeConfig | TronTransactionConfig | TonEncodedConfig>
            );
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
        trade: CrossChainTrade<EvmEncodeConfig | TronTransactionConfig | TonEncodedConfig>
    ): CalculationResult {
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
