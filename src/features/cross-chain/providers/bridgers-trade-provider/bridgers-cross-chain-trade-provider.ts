import { CrossChainTradeProvider } from 'src/features/cross-chain/providers/common/cross-chain-trade-provider';
import { CROSS_CHAIN_TRADE_TYPE } from 'src/features/cross-chain/models/cross-chain-trade-type';
import { BlockchainName, TronBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import {
    BridgersCrossChainSupportedBlockchain,
    bridgersCrossChainSupportedBlockchains
} from 'src/features/cross-chain/providers/bridgers-trade-provider/constants/bridgers-cross-chain-supported-blockchain';
import { CalculationResult } from 'src/features/cross-chain/providers/common/models/calculation-result';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { RequiredCrossChainOptions } from 'src/features/cross-chain/models/cross-chain-options';

import { rubicProxyContractAddress } from 'src/features/cross-chain/providers/common/constants/rubic-proxy-contract-address';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { BridgersQuoteRequest } from 'src/features/cross-chain/providers/bridgers-trade-provider/models/bridgers-quote-request';
import { toBridgersBlockchain } from 'src/features/cross-chain/providers/bridgers-trade-provider/constants/to-bridgers-blockchain';
import { BridgersQuoteResponse } from 'src/features/cross-chain/providers/bridgers-trade-provider/models/bridgers-quote-response';
import { CrossChainMaxAmountError, CrossChainMinAmountError } from 'src/common/errors';
import BigNumber from 'bignumber.js';
import { BridgersCrossChainTrade } from 'src/features/cross-chain/providers/bridgers-trade-provider/bridgers-cross-chain-trade';
import { FeeInfo } from 'src/features/cross-chain/providers/common/models/fee';
import { evmCommonCrossChainAbi } from 'src/features/cross-chain/providers/common/emv-cross-chain-trade/constants/evm-common-cross-chain-abi';
import { nativeTokensList } from 'src/common/tokens/constants/native-tokens';

export class BridgersCrossChainTradeProvider extends CrossChainTradeProvider {
    public static isSupportedBlockchain(
        blockchain: BlockchainName
    ): blockchain is BridgersCrossChainSupportedBlockchain {
        return bridgersCrossChainSupportedBlockchains.some(
            supportedBlockchain => supportedBlockchain === blockchain
        );
    }

    public readonly type = CROSS_CHAIN_TRADE_TYPE.BRIDGERS;

    public isSupportedBlockchains(
        fromBlockchain: BlockchainName,
        toBlockchain: BlockchainName
    ): boolean {
        return (
            BridgersCrossChainTradeProvider.isSupportedBlockchain(fromBlockchain) &&
            BridgersCrossChainTradeProvider.isSupportedBlockchain(toBlockchain)
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
            !BridgersCrossChainTradeProvider.isSupportedBlockchain(fromBlockchain) ||
            !BridgersCrossChainTradeProvider.isSupportedBlockchain(toBlockchain)
        ) {
            return null;
        }

        try {
            await this.checkContractState(
                fromBlockchain,
                rubicProxyContractAddress[fromBlockchain]
            );

            const feeInfo = await this.getFeeInfo(fromBlockchain, options.providerAddress, from);

            const feeAmount = Web3Pure.toWei(
                from.tokenAmount.multipliedBy(feeInfo.platformFee!.percent).dividedBy(100),
                from.decimals,
                1
            );
            const tokenAmountIn = from.weiAmount.minus(feeAmount).toFixed(0);

            const quoteRequest: BridgersQuoteRequest = {
                fromTokenAddress: from.address,
                toTokenAddress: toToken.address,
                fromTokenAmount: tokenAmountIn,
                fromTokenChain: toBridgersBlockchain[fromBlockchain],
                toTokenChain: toBridgersBlockchain[toBlockchain]
            };
            const quoteResponse = await this.httpClient.post<BridgersQuoteResponse>(
                'https://sswap.swft.pro/api/sswap/quote',
                quoteRequest
            );
            const transactionData = quoteResponse.txData;
            if (!transactionData) {
                return null;
            }

            if (from.tokenAmount.lt(transactionData.depositMin)) {
                return {
                    trade: null,
                    error: new CrossChainMinAmountError(
                        new BigNumber(transactionData.depositMin),
                        from.symbol
                    )
                };
            }
            if (from.tokenAmount.gt(transactionData.depositMax)) {
                return {
                    trade: null,
                    error: new CrossChainMaxAmountError(
                        new BigNumber(transactionData.depositMax),
                        from.symbol
                    )
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

            return {
                trade: new BridgersCrossChainTrade(
                    {
                        from: from as PriceTokenAmount<TronBlockchainName>,
                        to,
                        toTokenAmountMin,
                        feeInfo
                    },
                    options.providerAddress
                )
            };
        } catch (err: unknown) {
            return {
                trade: null,
                error: CrossChainTradeProvider.parseError(err)
            };
        }
    }

    protected override async getFeeInfo(
        fromBlockchain: BridgersCrossChainSupportedBlockchain,
        providerAddress: string,
        percentFeeToken: PriceTokenAmount
    ): Promise<FeeInfo> {
        return {
            fixedFee: {
                amount: await this.getFixedFee(
                    fromBlockchain,
                    providerAddress,
                    rubicProxyContractAddress[fromBlockchain],
                    evmCommonCrossChainAbi
                ),
                tokenSymbol: nativeTokensList[fromBlockchain].symbol
            },
            platformFee: {
                percent: await this.getFeePercent(
                    fromBlockchain,
                    providerAddress,
                    rubicProxyContractAddress[fromBlockchain],
                    evmCommonCrossChainAbi
                ),
                tokenSymbol: percentFeeToken.symbol
            },
            cryptoFee: null
        };
    }
}
