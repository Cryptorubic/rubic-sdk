import BigNumber from 'bignumber.js';
import { MaxAmountError, MinAmountError, RubicSdkError } from 'src/common/errors';
import { PriceToken, PriceTokenAmount, wrappedNativeTokensList } from 'src/common/tokens';
import { nativeTokensList } from 'src/common/tokens/constants/native-tokens';
import { compareAddresses } from 'src/common/utils/blockchain';
import { BlockchainName, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { Injector } from 'src/core/injector/injector';
import { RequiredCrossChainOptions } from 'src/features/cross-chain/calculation-manager/models/cross-chain-options';
import { CROSS_CHAIN_TRADE_TYPE } from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { CbridgeCrossChainApiService } from 'src/features/cross-chain/calculation-manager/providers/cbridge/cbridge-cross-chain-api-service';
import { CbridgeCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/cbridge/cbridge-cross-chain-trade';
import { cbridgeContractAbi } from 'src/features/cross-chain/calculation-manager/providers/cbridge/constants/cbridge-contract-abi';
import { cbridgeContractAddress } from 'src/features/cross-chain/calculation-manager/providers/cbridge/constants/cbridge-contract-address';
import { cbridgeProxyAbi } from 'src/features/cross-chain/calculation-manager/providers/cbridge/constants/cbridge-proxy-abi';
import {
    CbridgeCrossChainSupportedBlockchain,
    cbridgeSupportedBlockchains
} from 'src/features/cross-chain/calculation-manager/providers/cbridge/constants/cbridge-supported-blockchains';
import { TokenInfo } from 'src/features/cross-chain/calculation-manager/providers/cbridge/models/cbridge-chain-token-info';
import { CbridgeEstimateAmountRequest } from 'src/features/cross-chain/calculation-manager/providers/cbridge/models/cbridge-estimate-amount-request';
import { celerTransitTokens } from 'src/features/cross-chain/calculation-manager/providers/celer-provider/constants/celer-transit-tokens';
import { CelerCrossChainSupportedBlockchain } from 'src/features/cross-chain/calculation-manager/providers/celer-provider/models/celer-cross-chain-supported-blockchain';
import { CrossChainProvider } from 'src/features/cross-chain/calculation-manager/providers/common/cross-chain-provider';
import { CalculationResult } from 'src/features/cross-chain/calculation-manager/providers/common/models/calculation-result';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { typedTradeProviders } from 'src/features/on-chain/calculation-manager/constants/trade-providers/typed-trade-providers';
import { EvmOnChainTrade } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/evm-on-chain-trade';

interface CelerConfig {
    address: string;
    supportedFromToken: TokenInfo | undefined;
    supportedToToken: TokenInfo | undefined;
    isBridge: boolean;
}

export class CbridgeCrossChainProvider extends CrossChainProvider {
    public readonly type = CROSS_CHAIN_TRADE_TYPE.CELER_BRIDGE;

    public isSupportedBlockchain(
        blockchain: BlockchainName
    ): blockchain is CbridgeCrossChainSupportedBlockchain {
        return cbridgeSupportedBlockchains.some(
            supportedBlockchain => supportedBlockchain === blockchain
        );
    }

    public async calculate(
        fromToken: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>,
        options: RequiredCrossChainOptions
    ): Promise<CalculationResult> {
        const fromBlockchain = fromToken.blockchain as CbridgeCrossChainSupportedBlockchain;
        const toBlockchain = toToken.blockchain as CbridgeCrossChainSupportedBlockchain;
        if (!this.areSupportedBlockchains(fromBlockchain, toBlockchain)) {
            return null;
        }

        try {
            const config = await this.fetchContractAddressAndCheckTokens(fromToken, toToken);
            if (!config.supportedToToken) {
                throw new RubicSdkError('To token is not supported');
            }

            // const feeInfo = await this.getFeeInfo(fromBlockchain, options.providerAddress);
            // const fromWithoutFee = getFromWithoutFee(
            //     fromToken,
            //     feeInfo.rubicProxy?.platformFee?.percent
            // );
            const fromWithoutFee = fromToken;

            const onChainTrade: EvmOnChainTrade | null = null;
            const transitTokenAmount = fromWithoutFee.tokenAmount;
            const transitMinAmount = transitTokenAmount;
            const transitToken = fromWithoutFee;

            if (!config.isBridge) {
                throw new RubicSdkError('Tokens are not supported');
                // onChainTrade = await this.getOnChainTrade(
                //     fromWithoutFee,
                //     [],
                //     options.slippageTolerance
                // );
                // if (!onChainTrade) {
                //     return {
                //         trade: null,
                //         error: new NotSupportedTokensError()
                //     };
                // }
                //
                // transitTokenAmount = onChainTrade.to.tokenAmount;
                // transitMinAmount = onChainTrade.toTokenAmountMin.tokenAmount;
                //
                // const defaultTransit = new PriceTokenAmount<EvmBlockchainName>({
                //     ...(celerTransitTokens[
                //         fromToken.blockchain as CelerCrossChainSupportedBlockchain
                //     ] as TokenStruct<EvmBlockchainName>),
                //     tokenAmount: transitTokenAmount,
                //     price: new BigNumber(0)
                // });
                // const transitConfig = await this.fetchContractAddressAndCheckTokens(
                //     defaultTransit,
                //     toToken
                // );
                // const celerTransitTokenStruct: PriceTokenAmountStruct<EvmBlockchainName> = {
                //     blockchain: fromToken.blockchain,
                //     address: transitConfig.supportedFromToken!.token.address,
                //     name: transitConfig.supportedFromToken!.name,
                //     symbol: transitConfig.supportedFromToken!.token.symbol,
                //     decimals: transitConfig.supportedFromToken!.token.decimal,
                //     price: new BigNumber(0),
                //     tokenAmount: transitTokenAmount
                // };
                // transitToken = transitConfig?.supportedFromToken
                //     ? new PriceTokenAmount<EvmBlockchainName>(celerTransitTokenStruct)
                //     : defaultTransit;
            }
            // const toTransitToken =
            //     celerTransitTokens[toToken.blockchain as CelerCrossChainSupportedBlockchain];
            // if (onChainTrade && !compareAddresses(toTransitToken.address, toToken.address)) {
            //     throw new RubicSdkError('Not supported tokens');
            // }

            const { amount, maxSlippage, fee } = await this.getEstimates(
                transitToken,
                toToken,
                options,
                config
            );
            if (!amount) {
                throw new RubicSdkError('Can not estimate trade');
            }

            const to = new PriceTokenAmount({
                ...toToken.asStruct,
                tokenAmount: Web3Pure.fromWei(amount, toToken.decimals)
            });

            const gasData =
                options.gasCalculation === 'enabled'
                    ? await CbridgeCrossChainTrade.getGasData(fromToken, to, onChainTrade)
                    : null;

            const amountsErrors = await this.getMinMaxAmountsErrors(transitToken);

            return {
                trade: new CbridgeCrossChainTrade(
                    {
                        from: fromToken,
                        to,
                        gasData,
                        priceImpact: /* fromToken.calculatePriceImpactPercent(to)  || */ 0,
                        slippage: options.slippageTolerance,
                        feeInfo: {
                            provider: {
                                cryptoFee: {
                                    amount: Web3Pure.fromWei(fee, toToken.decimals),
                                    tokenSymbol: toToken.symbol
                                }
                            }
                        },
                        maxSlippage,
                        contractAddress: config.address,
                        transitMinAmount,
                        onChainTrade
                    },
                    options.providerAddress
                ),
                error: amountsErrors
            };
        } catch (err) {
            const rubicSdkError = CrossChainProvider.parseError(err);

            return {
                trade: null,
                error: rubicSdkError
            };
        }
    }

    protected async getFeeInfo(
        fromBlockchain: CbridgeCrossChainSupportedBlockchain,
        providerAddress: string
    ): Promise<FeeInfo> {
        return {
            rubicProxy: {
                fixedFee: {
                    amount: await this.getFixedFee(
                        fromBlockchain,
                        providerAddress,
                        cbridgeContractAddress[fromBlockchain].rubicRouter,
                        cbridgeProxyAbi
                    ),
                    tokenSymbol: nativeTokensList[fromBlockchain].symbol
                },
                platformFee: {
                    percent: await this.getFeePercent(
                        fromBlockchain,
                        providerAddress,
                        cbridgeContractAddress[fromBlockchain].rubicRouter,
                        cbridgeProxyAbi
                    ),
                    tokenSymbol: 'USDC'
                }
            }
        };
    }

    private async fetchContractAddressAndCheckTokens(
        fromTokenOrNative: PriceTokenAmount<EvmBlockchainName>,
        toTokenOrNative: PriceToken<EvmBlockchainName>
    ): Promise<CelerConfig> {
        let fromToken = fromTokenOrNative;
        if (fromToken.isNative) {
            const wrappedFrom = wrappedNativeTokensList[fromTokenOrNative.blockchain]!;
            const token = await PriceTokenAmount.createToken({
                ...wrappedFrom,
                tokenAmount: fromTokenOrNative.tokenAmount
            });
            fromToken = token as PriceTokenAmount<EvmBlockchainName>;
        }
        let toToken = toTokenOrNative;
        if (toToken.symbol === nativeTokensList[toToken.blockchain].symbol) {
            const wrappedTo = wrappedNativeTokensList[toTokenOrNative.blockchain]!;
            const token = await PriceToken.createToken(wrappedTo);
            toToken = token as PriceToken<EvmBlockchainName>;
        }

        const config = await CbridgeCrossChainApiService.getTransferConfigs();
        const fromChainId = blockchainId[fromToken.blockchain];
        const toChainId = blockchainId[toToken.blockchain];
        if (
            !config.chains.some(chain => chain.id === fromChainId) ||
            !config.chains.some(chain => chain.id === toChainId)
        ) {
            throw new RubicSdkError('Not supported chain');
        }

        const supportedFromToken = config.chain_token?.[fromChainId]?.token.find(el =>
            compareAddresses(el.token.address, fromToken.address)
        );

        const supportedToToken = config.chain_token?.[toChainId]?.token.find(el =>
            compareAddresses(el.token.address, toToken.address)
        );

        return {
            supportedFromToken,
            supportedToToken,
            address: config.chains.find(chain => chain.id === fromChainId)!.contract_addr,
            isBridge: supportedFromToken?.token.symbol === supportedToToken?.token.symbol
        };
    }

    private async getEstimates(
        fromToken: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>,
        options: RequiredCrossChainOptions,
        config: CelerConfig
    ): Promise<{ amount: string; maxSlippage: number; fee: string }> {
        let tokenSymbol = fromToken.symbol;
        if (config.isBridge) {
            tokenSymbol = config.supportedFromToken?.token.symbol || tokenSymbol;
        }
        const requestParams: CbridgeEstimateAmountRequest = {
            src_chain_id: blockchainId[fromToken.blockchain],
            dst_chain_id: blockchainId[toToken.blockchain],
            token_symbol: tokenSymbol,
            usr_addr: options?.receiverAddress || this.getWalletAddress(fromToken.blockchain),
            slippage_tolerance: Number((options.slippageTolerance * 1_000_000).toFixed(0)),
            amt: fromToken.stringWeiAmount
        };
        const { estimated_receive_amt, max_slippage, base_fee } =
            await CbridgeCrossChainApiService.fetchEstimateAmount(requestParams);
        return { amount: estimated_receive_amt, maxSlippage: max_slippage, fee: base_fee };
    }

    private async getOnChainTrade(
        from: PriceTokenAmount,
        _availableDexes: string[],
        slippageTolerance: number
    ): Promise<EvmOnChainTrade | null> {
        const fromBlockchain = from.blockchain as CelerCrossChainSupportedBlockchain;

        const dexes = Object.values(typedTradeProviders[fromBlockchain]).filter(
            dex => dex.supportReceiverAddress
        );
        const to = await PriceToken.createToken({
            address: celerTransitTokens[fromBlockchain].address,
            blockchain: fromBlockchain
        });
        const onChainTrades = (
            await Promise.allSettled(
                dexes.map(dex =>
                    dex.calculate(from, to, {
                        slippageTolerance,
                        gasCalculation: 'disabled',
                        useProxy: false
                    })
                )
            )
        )
            .filter(value => value.status === 'fulfilled')
            .map(value => (value as PromiseFulfilledResult<EvmOnChainTrade>).value)
            .sort((a, b) => b.to.tokenAmount.comparedTo(a.to.tokenAmount));

        if (!onChainTrades.length) {
            return null;
        }
        return onChainTrades[0]!;
    }

    private async getMinMaxAmountsErrors(
        fromToken: PriceTokenAmount<EvmBlockchainName>
    ): Promise<MinAmountError | MaxAmountError | undefined> {
        try {
            const fromBlockchain = fromToken.blockchain as CbridgeCrossChainSupportedBlockchain;
            const web3Public = Injector.web3PublicService.getWeb3Public(fromBlockchain);

            const fromTokenAddress = fromToken.isNative
                ? wrappedNativeTokensList[fromBlockchain]!.address
                : fromToken.address;

            const minAmountString = await web3Public.callContractMethod(
                cbridgeContractAddress[fromBlockchain].providerRouter,
                cbridgeContractAbi,
                'minSend',
                [fromTokenAddress]
            );
            const minAmount = new BigNumber(minAmountString).multipliedBy(1.05);
            if (minAmount.gt(fromToken.stringWeiAmount)) {
                return new MinAmountError(
                    Web3Pure.fromWei(minAmount, fromToken.decimals),
                    fromToken.symbol
                );
            }

            const maxAmountString = await web3Public.callContractMethod(
                cbridgeContractAddress[fromBlockchain].providerRouter,
                cbridgeContractAbi,
                'maxSend',
                [fromTokenAddress]
            );
            const maxAmount = new BigNumber(maxAmountString).dividedBy(0.95);
            if (maxAmount.lt(fromToken.stringWeiAmount)) {
                return new MaxAmountError(
                    Web3Pure.fromWei(maxAmount, fromToken.decimals),
                    fromToken.symbol
                );
            }
        } catch {
            return undefined;
        }
        return undefined;
    }
}
