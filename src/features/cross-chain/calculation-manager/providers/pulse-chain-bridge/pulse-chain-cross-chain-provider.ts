import BigNumber from 'bignumber.js';
import {
    MaxAmountError,
    MinAmountError,
    NotSupportedTokensError,
    RubicSdkError
} from 'src/common/errors';
import { PriceToken, PriceTokenAmount, wrappedNativeTokensList } from 'src/common/tokens';
import { nativeTokensList } from 'src/common/tokens/constants/native-tokens';
import { compareAddresses } from 'src/common/utils/blockchain';
import { BlockchainName, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { BlockchainsInfo } from 'src/core/blockchain/utils/blockchains-info/blockchains-info';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { Injector } from 'src/core/injector/injector';
import { getFromWithoutFee } from 'src/features/common/utils/get-from-without-fee';
import { RequiredCrossChainOptions } from 'src/features/cross-chain/calculation-manager/models/cross-chain-options';
import { CROSS_CHAIN_TRADE_TYPE } from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { CbridgeCrossChainApiService } from 'src/features/cross-chain/calculation-manager/providers/cbridge/cbridge-cross-chain-api-service';
import { cbridgeContractAbi } from 'src/features/cross-chain/calculation-manager/providers/cbridge/constants/cbridge-contract-abi';
import { cbridgeContractAddress } from 'src/features/cross-chain/calculation-manager/providers/cbridge/constants/cbridge-contract-address';
import { CbridgeCrossChainSupportedBlockchain } from 'src/features/cross-chain/calculation-manager/providers/cbridge/constants/cbridge-supported-blockchains';
import { TokenInfo } from 'src/features/cross-chain/calculation-manager/providers/cbridge/models/cbridge-chain-token-info';
import { CbridgeEstimateAmountRequest } from 'src/features/cross-chain/calculation-manager/providers/cbridge/models/cbridge-estimate-amount-request';
import { CrossChainProvider } from 'src/features/cross-chain/calculation-manager/providers/common/cross-chain-provider';
import { CalculationResult } from 'src/features/cross-chain/calculation-manager/providers/common/models/calculation-result';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { RubicStep } from 'src/features/cross-chain/calculation-manager/providers/common/models/rubicStep';
import { ProxyCrossChainEvmTrade } from 'src/features/cross-chain/calculation-manager/providers/common/proxy-cross-chain-evm-facade/proxy-cross-chain-evm-trade';
import {
    PulseChainCrossChainSupportedBlockchain,
    pulseChainSupportedBlockchains
} from 'src/features/cross-chain/calculation-manager/providers/pulse-chain-bridge/constants/pulse-chain-supported-blockchains';
import { BridgeManager } from 'src/features/cross-chain/calculation-manager/providers/pulse-chain-bridge/omni-bridge-entities/bridge-manager';
import { typedTradeProviders } from 'src/features/on-chain/calculation-manager/constants/trade-providers/typed-trade-providers';
import { EvmOnChainTrade } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/evm-on-chain-trade';

interface CelerConfig {
    address: string;
    supportedFromToken: TokenInfo | undefined;
    supportedToToken: TokenInfo | undefined;
    isBridge: boolean;
    possibleTransitToken: TokenInfo | undefined;
}

export class PulseChainCrossChainProvider extends CrossChainProvider {
    public readonly type = CROSS_CHAIN_TRADE_TYPE.PULSE_CHAIN_BRIDGE;

    public isSupportedBlockchain(
        blockchain: BlockchainName
    ): blockchain is PulseChainCrossChainSupportedBlockchain {
        return pulseChainSupportedBlockchains.some(chain => chain === blockchain);
    }

    public async calculate(
        fromToken: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>,
        options: RequiredCrossChainOptions
    ): Promise<CalculationResult> {
        const fromBlockchain = fromToken.blockchain as PulseChainCrossChainSupportedBlockchain;
        const toBlockchain = toToken.blockchain as PulseChainCrossChainSupportedBlockchain;
        const useProxy = options?.useProxy?.[this.type] ?? true;

        if (!this.areSupportedBlockchains(fromBlockchain, toBlockchain)) {
            return {
                trade: null,
                error: new NotSupportedTokensError(),
                tradeType: this.type
            };
        }

        const feeInfo = await this.getFeeInfo(
            fromBlockchain,
            options.providerAddress,
            fromToken,
            useProxy
        );

        try {
            const fromAddress = fromToken.isNative
                ? '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
                : fromToken.address;
            const bridgeManager = BridgeManager.createBridge(fromBlockchain);
            const tokenRegistered = await bridgeManager.isTokenRegistered(fromAddress);

            const fromWithoutFee = getFromWithoutFee(
                fromToken,
                feeInfo.rubicProxy?.platformFee?.percent
            );

            // eslint-disable-next-line unused-imports/no-unused-vars
            let onChainTrade: EvmOnChainTrade | null = null;
            let transitTokenAmount = fromWithoutFee.tokenAmount;
            // eslint-disable-next-line unused-imports/no-unused-vars
            let transitMinAmount = transitTokenAmount;
            // eslint-disable-next-line unused-imports/no-unused-vars
            let transitToken = fromWithoutFee;

            if (!tokenRegistered) {
                if (!useProxy) {
                    return {
                        trade: null,
                        error: new NotSupportedTokensError(),
                        tradeType: this.type
                    };
                }
                // onChainTrade = await this.getOnChainTrade(
                //     fromWithoutFee,
                //     [],
                //     options.slippageTolerance,
                //     config.possibleTransitToken!.token.address
                // );
                // if (!onChainTrade) {
                //     return {
                //         trade: null,
                //         error: new NotSupportedTokensError(),
                //         tradeType: this.type
                //     };
                // }

                // transitTokenAmount = onChainTrade.to.tokenAmount;
                // transitMinAmount = onChainTrade.toTokenAmountMin.tokenAmount;
                // transitToken = onChainTrade.to;

                // const defaultTransit = new PriceTokenAmount<EvmBlockchainName>({
                //     ...onChainTrade.to.asStructWithAmount
                // });
                // const transitConfig = await this.fetchContractAddressAndCheckTokens(
                //     defaultTransit,
                //     toToken
                // );
                // const celerTransitTokenStruct: PriceTokenAmountStruct<EvmBlockchainName> = {
                //     blockchain: fromToken.blockchain,
                //     address: transitToken.address,
                //     name: onChainTrade
                //         ? transitConfig.possibleTransitToken!.name
                //         : transitConfig.supportedFromToken!.name,
                //     symbol: onChainTrade
                //         ? transitConfig.possibleTransitToken!.token.symbol
                //         : transitConfig.supportedFromToken!.token.symbol,
                //     decimals: onChainTrade
                //         ? transitConfig.possibleTransitToken!.token.decimal
                //         : transitConfig.supportedFromToken!.token.decimal,
                //     price: new BigNumber(0),
                //     tokenAmount: transitTokenAmount
                // };
                // transitToken = transitConfig?.supportedFromToken
                //     ? new PriceTokenAmount<EvmBlockchainName>(celerTransitTokenStruct)
                //     : defaultTransit;
            }

            // const { amount, maxSlippage } = await this.getEstimates(
            //     transitToken,
            //     toToken,
            //     options,
            //     config
            // );
            // if (!amount) {
            //     throw new RubicSdkError('Can not estimate trade');
            // }

            // const to = new PriceTokenAmount({
            //     ...toToken.asStruct,
            //     tokenAmount: Web3Pure.fromWei(amount, toToken.decimals)
            // });

            // const gasData =
            //     options.gasCalculation === 'enabled'
            //         ? await CbridgeCrossChainTrade.getGasData(
            //               fromToken,
            //               to,
            //               onChainTrade,
            //               feeInfo,
            //               maxSlippage,
            //               config.address,
            //               options.providerAddress,
            //               options.receiverAddress || this.getWalletAddress(fromToken.blockchain)
            //           )
            //         : null;
            //
            // const amountsErrors = await this.getMinMaxAmountsErrors(transitToken, feeInfo);

            // return {
            //     trade: new CbridgeCrossChainTrade(
            //         {
            //             from: fromToken,
            //             to,
            //             gasData,
            //             priceImpact: fromToken.calculatePriceImpactPercent(to),
            //             slippage: options.slippageTolerance,
            //             feeInfo: feeInfo,
            //             maxSlippage,
            //             contractAddress: config.address,
            //             transitMinAmount,
            //             onChainTrade
            //         },
            //         options.providerAddress,
            //         await this.getRoutePath(fromToken, transitToken, to, onChainTrade)
            //     ),
            //     error: amountsErrors,
            //     tradeType: this.type
            // };
            return {
                trade: null,
                error: new RubicSdkError(''),
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

    private async fetchContractAddressAndCheckTokens(
        fromTokenOrNative: PriceTokenAmount<EvmBlockchainName>,
        toTokenOrNative: PriceToken<EvmBlockchainName>
    ): Promise<CelerConfig> {
        let fromToken = fromTokenOrNative;
        const useTestnet = BlockchainsInfo.isTestBlockchainName(fromToken.blockchain);
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

        const config = await CbridgeCrossChainApiService.getTransferConfigs({ useTestnet });
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

        if (!supportedToToken) {
            throw new RubicSdkError('Not supported tokens');
        }

        const possibleTransitToken = config.chain_token?.[fromChainId]?.token.find(
            el => el.token.symbol === supportedToToken!.token.symbol
        );

        return {
            supportedFromToken,
            supportedToToken,
            address: config.chains.find(chain => chain.id === fromChainId)!.contract_addr,
            isBridge: supportedFromToken?.token.symbol === supportedToToken?.token.symbol,
            possibleTransitToken
        };
    }

    private async getEstimates(
        fromToken: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>,
        options: RequiredCrossChainOptions,
        config: CelerConfig
    ): Promise<{ amount: string; maxSlippage: number; fee: string }> {
        let tokenSymbol = fromToken.symbol;
        const useTestnet = BlockchainsInfo.isTestBlockchainName(fromToken.blockchain);
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
            await CbridgeCrossChainApiService.fetchEstimateAmount(requestParams, { useTestnet });
        return { amount: estimated_receive_amt, maxSlippage: max_slippage, fee: base_fee };
    }

    private async getOnChainTrade(
        from: PriceTokenAmount,
        _availableDexes: string[],
        slippageTolerance: number,
        transitTokenAddress: string
    ): Promise<EvmOnChainTrade | null> {
        const fromBlockchain = from.blockchain as CbridgeCrossChainSupportedBlockchain;

        const dexes = Object.values(typedTradeProviders[fromBlockchain]).filter(
            dex => dex.supportReceiverAddress
        );
        const to = await PriceToken.createToken({
            address: transitTokenAddress,
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
        fromToken: PriceTokenAmount<EvmBlockchainName>,
        _feeInfo: FeeInfo
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
            const minAmount = new BigNumber(minAmountString);
            if (minAmount.gte(fromToken.stringWeiAmount)) {
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
            const maxAmount = new BigNumber(maxAmountString);
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

    protected async getFeeInfo(
        fromBlockchain: PulseChainCrossChainSupportedBlockchain,
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
        from: PriceTokenAmount,
        transit: PriceTokenAmount,
        to: PriceTokenAmount,
        onChainTrade: EvmOnChainTrade | null
    ): Promise<RubicStep[]> {
        const routePath: RubicStep[] = [];
        if (onChainTrade) {
            routePath.push({
                type: 'on-chain',
                path: [from, transit],
                provider: onChainTrade.type
            });
        }
        routePath.push({
            type: 'cross-chain',
            path: [transit, to],
            provider: CROSS_CHAIN_TRADE_TYPE.CELER_BRIDGE
        });
        return routePath;
    }
}
