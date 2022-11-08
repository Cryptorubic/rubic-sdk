import { CrossChainProvider } from 'src/features/cross-chain/calculation-manager/providers/common/cross-chain-provider';
import { CROSS_CHAIN_TRADE_TYPE } from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import {
    BLOCKCHAIN_NAME,
    BlockchainName,
    TronBlockchainName
} from 'src/core/blockchain/models/blockchain-name';
import {
    BridgersCrossChainSupportedBlockchain,
    bridgersCrossChainSupportedBlockchains,
    BridgersEvmCrossChainSupportedBlockchain
} from 'src/features/cross-chain/calculation-manager/providers/bridgers-provider/constants/bridgers-cross-chain-supported-blockchain';
import { CalculationResult } from 'src/features/cross-chain/calculation-manager/providers/common/models/calculation-result';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { RequiredCrossChainOptions } from 'src/features/cross-chain/calculation-manager/models/cross-chain-options';
import { rubicProxyContractAddress } from 'src/features/cross-chain/calculation-manager/providers/common/constants/rubic-proxy-contract-address';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { toBridgersBlockchain } from 'src/features/common/providers/bridgers/constants/to-bridgers-blockchain';
import { BridgersPairIsUnavailableError, MaxAmountError, MinAmountError } from 'src/common/errors';
import BigNumber from 'bignumber.js';
import { TronBridgersCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/bridgers-provider/tron-bridgers-trade/tron-bridgers-cross-chain-trade';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee';
import { nativeTokensList } from 'src/common/tokens/constants/native-tokens';
import { bridgersNativeAddress } from 'src/features/common/providers/bridgers/constants/bridgers-native-address';
import { createTokenNativeAddressProxy } from 'src/features/on-chain/calculation-manager/providers/dexes/abstract/utils/token-native-address-proxy';
import { BlockchainsInfo } from 'src/core/blockchain/utils/blockchains-info/blockchains-info';
import { EvmBridgersCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/bridgers-provider/evm-bridgers-trade/evm-bridgers-cross-chain-trade';
import { tronCommonCrossChainAbi } from 'src/features/cross-chain/calculation-manager/providers/common/tron-cross-chain-trade/constants/tron-common-cross-chain-abi';
import { evmCommonCrossChainAbi } from 'src/features/cross-chain/calculation-manager/providers/common/emv-cross-chain-trade/constants/evm-common-cross-chain-abi';
import { AbiItem } from 'web3-utils';
import {
    BridgersQuoteRequest,
    BridgersQuoteResponse
} from 'src/features/common/providers/bridgers/models/bridgers-quote-api';
import { getFromWithoutFee } from 'src/features/cross-chain/calculation-manager/utils/get-from-without-fee';

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
    ): Promise<CalculationResult> {
        const fromBlockchain = from.blockchain as BridgersCrossChainSupportedBlockchain;
        const toBlockchain = toToken.blockchain as BridgersCrossChainSupportedBlockchain;
        if (!this.areSupportedBlockchains(fromBlockchain, toBlockchain)) {
            return null;
        }

        try {
            const contractAbi = BlockchainsInfo.isTronBlockchainName(fromBlockchain)
                ? tronCommonCrossChainAbi
                : evmCommonCrossChainAbi;
            await this.checkContractState(
                fromBlockchain,
                rubicProxyContractAddress[fromBlockchain],
                contractAbi
            );

            let feeInfo = await this.getFeeInfo(
                fromBlockchain,
                options.providerAddress,
                from,
                contractAbi
            );
            const fromWithoutFee = getFromWithoutFee(from, feeInfo);

            const fromTokenAddress = createTokenNativeAddressProxy(
                from,
                bridgersNativeAddress
            ).address;
            const toTokenAddress = createTokenNativeAddressProxy(
                toToken,
                bridgersNativeAddress
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
                    error: CrossChainProvider.parseError(new BridgersPairIsUnavailableError())
                };
            }

            if (from.tokenAmount.lt(transactionData.depositMin)) {
                return {
                    trade: null,
                    error: new MinAmountError(
                        new BigNumber(transactionData.depositMin),
                        from.symbol
                    )
                };
            }
            if (from.tokenAmount.gt(transactionData.depositMax)) {
                return {
                    trade: null,
                    error: new MaxAmountError(
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

            feeInfo = {
                ...feeInfo,
                platformFee: {
                    ...feeInfo.platformFee!,
                    percent: feeInfo.platformFee!.percent + transactionData.fee * 100
                },
                cryptoFee: {
                    amount: new BigNumber(transactionData.chainFee),
                    tokenSymbol: toToken.symbol
                }
            };

            if (BlockchainsInfo.isEvmBlockchainName(fromBlockchain)) {
                const gasData =
                    options.gasCalculation === 'enabled' && options.receiverAddress
                        ? await EvmBridgersCrossChainTrade.getGasData(
                              from as PriceTokenAmount<BridgersEvmCrossChainSupportedBlockchain>,
                              to as PriceTokenAmount<TronBlockchainName>,
                              options.receiverAddress
                          )
                        : null;

                return {
                    trade: new EvmBridgersCrossChainTrade(
                        {
                            from: from as PriceTokenAmount<BridgersEvmCrossChainSupportedBlockchain>,
                            to: to as PriceTokenAmount<TronBlockchainName>,
                            toTokenAmountMin,
                            feeInfo,
                            gasData,
                            slippage: options.slippageTolerance
                        },
                        options.providerAddress
                    )
                };
            }
            return {
                trade: new TronBridgersCrossChainTrade(
                    {
                        from: from as PriceTokenAmount<TronBlockchainName>,
                        to: to as PriceTokenAmount<BridgersEvmCrossChainSupportedBlockchain>,
                        toTokenAmountMin,
                        feeInfo,
                        slippage: options.slippageTolerance
                    },
                    options.providerAddress
                )
            };
        } catch (err: unknown) {
            return {
                trade: null,
                error: CrossChainProvider.parseError(err)
            };
        }
    }

    protected override async getFeeInfo(
        fromBlockchain: BridgersCrossChainSupportedBlockchain,
        providerAddress: string,
        percentFeeToken: PriceTokenAmount,
        contractAbi: AbiItem[]
    ): Promise<FeeInfo> {
        return {
            fixedFee: {
                amount: await this.getFixedFee(
                    fromBlockchain,
                    providerAddress,
                    rubicProxyContractAddress[fromBlockchain],
                    contractAbi
                ),
                tokenSymbol: nativeTokensList[fromBlockchain].symbol
            },
            platformFee: {
                percent: await this.getFeePercent(
                    fromBlockchain,
                    providerAddress,
                    rubicProxyContractAddress[fromBlockchain],
                    contractAbi
                ),
                tokenSymbol: percentFeeToken.symbol
            },
            cryptoFee: null
        };
    }
}
