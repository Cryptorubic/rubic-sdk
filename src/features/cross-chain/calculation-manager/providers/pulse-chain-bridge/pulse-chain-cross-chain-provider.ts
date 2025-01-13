import BigNumber from 'bignumber.js';
import { MinAmountError, NotSupportedTokensError, RubicSdkError } from 'src/common/errors';
import { PriceToken, PriceTokenAmount, Token } from 'src/common/tokens';
import { compareAddresses } from 'src/common/utils/blockchain';
import {
    BLOCKCHAIN_NAME,
    BlockchainName,
    EvmBlockchainName
} from 'src/core/blockchain/models/blockchain-name';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { getFromWithoutFee } from 'src/features/common/utils/get-from-without-fee';
import { RequiredCrossChainOptions } from 'src/features/cross-chain/calculation-manager/models/cross-chain-options';
import { CROSS_CHAIN_TRADE_TYPE } from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
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
import { OmniBridge } from 'src/features/cross-chain/calculation-manager/providers/pulse-chain-bridge/omni-bridge-entities/omni-bridge';
import { PulseChainCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/pulse-chain-bridge/pulse-chain-cross-chain-trade';
import { typedTradeProviders } from 'src/features/on-chain/calculation-manager/constants/trade-providers/typed-trade-providers';
import { EvmOnChainTrade } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/evm-on-chain-trade';

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

        if (
            !this.areSupportedBlockchains(fromBlockchain, toBlockchain) ||
            // @TODO Remove after home bridge development
            fromToken.blockchain === BLOCKCHAIN_NAME.PULSECHAIN
        ) {
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
            const sourceBridgeManager = BridgeManager.createBridge(
                fromToken as Token<PulseChainCrossChainSupportedBlockchain>,
                toToken as Token<PulseChainCrossChainSupportedBlockchain>
            );
            const targetBridgeManager = BridgeManager.createBridge(
                fromToken as Token<PulseChainCrossChainSupportedBlockchain>,
                toToken as Token<PulseChainCrossChainSupportedBlockchain>
            );
            const fromTokenAddress = this.getTokenAddress(fromToken);
            const toTokenAddress = this.getTokenAddress(toToken);

            const tokenRegistered = await sourceBridgeManager.isTokenRegistered(fromTokenAddress);
            const targetTokenAddress = await sourceBridgeManager.getBridgeToken(fromTokenAddress);

            if (!compareAddresses(toTokenAddress, targetTokenAddress)) {
                return {
                    trade: null,
                    error: new NotSupportedTokensError(),
                    tradeType: this.type
                };
            }

            const fromWithoutFee = getFromWithoutFee(
                fromToken,
                feeInfo.rubicProxy?.platformFee?.percent
            );

            let onChainTrade: EvmOnChainTrade | null = null;
            let transitTokenAmount = fromWithoutFee.tokenAmount;
            let transitMinAmount = transitTokenAmount;
            let transitToken = fromWithoutFee;

            if (!tokenRegistered) {
                if (!useProxy) {
                    return {
                        trade: null,
                        error: new NotSupportedTokensError(),
                        tradeType: this.type
                    };
                }
                const transitTokenAddress = await targetBridgeManager.getBridgeToken(
                    toToken.address
                );

                onChainTrade = await this.getOnChainTrade(
                    fromWithoutFee,
                    [],
                    options.slippageTolerance,
                    transitTokenAddress
                );
                if (!onChainTrade) {
                    return {
                        trade: null,
                        error: new NotSupportedTokensError(),
                        tradeType: this.type
                    };
                }

                transitTokenAmount = onChainTrade.to.tokenAmount;
                transitMinAmount = onChainTrade.toTokenAmountMin.tokenAmount;
                transitToken = onChainTrade.to;
            }

            const targetAmount = await sourceBridgeManager.calculateAmount(
                toToken.address,
                Web3Pure.toWei(transitTokenAmount, transitToken.decimals)
            );
            const targetAmountMin = await sourceBridgeManager.calculateAmount(
                toToken.address,
                Web3Pure.toWei(transitMinAmount, transitToken.decimals)
            );

            const amountsErrors = await this.getMinMaxAmountsErrors(
                fromTokenAddress,
                sourceBridgeManager,
                transitToken
            );

            if (!targetAmount) {
                throw new RubicSdkError('Can not estimate trade');
            }

            const to = new PriceTokenAmount({
                ...toToken.asStruct,
                tokenAmount: Web3Pure.fromWei(targetAmount, toToken.decimals)
            });

            return {
                trade: new PulseChainCrossChainTrade(
                    {
                        from: fromToken,
                        to,
                        gasData: await this.getGasData(fromToken),
                        slippage: options.slippageTolerance,
                        feeInfo: feeInfo,
                        toTokenAmountMin: targetAmountMin,
                        onChainTrade,
                        priceImpact: fromToken.calculatePriceImpactPercent(to),
                        routerAddress: sourceBridgeManager.sourceBridgeAddress,
                        tokenRegistered
                    },
                    options.providerAddress,
                    await this.getRoutePath(fromToken, transitToken, to, onChainTrade),
                    useProxy
                ),
                error: amountsErrors,
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

    private async getOnChainTrade(
        from: PriceTokenAmount,
        _availableDexes: string[],
        slippageTolerance: number,
        transitTokenAddress: string
    ): Promise<EvmOnChainTrade | null> {
        const fromBlockchain = from.blockchain;

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
        fromTokenAddress: string,
        fromBridgeManager: OmniBridge,
        fromToken: PriceTokenAmount<EvmBlockchainName>
    ): Promise<MinAmountError | undefined> {
        try {
            const minAmountWei = await fromBridgeManager.getMinAmountToken(fromTokenAddress);
            const minAmount = new BigNumber(minAmountWei);

            if (minAmount.gte(fromToken.stringWeiAmount)) {
                return new MinAmountError(
                    Web3Pure.fromWei(minAmount, fromToken.decimals),
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
            provider: CROSS_CHAIN_TRADE_TYPE.PULSE_CHAIN_BRIDGE
        });
        return routePath;
    }

    private getTokenAddress(token: Token): string {
        if (token.blockchain === BLOCKCHAIN_NAME.ETHEREUM) {
            return token.isNative ? '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2' : token.address;
        }
        return token.isNative ? '0xA1077a294dDE1B09bB078844df40758a5D0f9a27' : token.address;
    }
}
