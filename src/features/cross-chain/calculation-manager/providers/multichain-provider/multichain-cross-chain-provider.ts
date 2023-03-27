import BigNumber from 'bignumber.js';
import { MaxAmountError, MinAmountError, NotSupportedTokensError } from 'src/common/errors';
import { PriceToken, PriceTokenAmount, Token } from 'src/common/tokens';
import { compareAddresses } from 'src/common/utils/blockchain';
import { BlockchainName, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { getFromWithoutFee } from 'src/features/common/utils/get-from-without-fee';
import { RequiredCrossChainOptions } from 'src/features/cross-chain/calculation-manager/models/cross-chain-options';
import { CROSS_CHAIN_TRADE_TYPE } from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { CrossChainProvider } from 'src/features/cross-chain/calculation-manager/providers/common/cross-chain-provider';
import { CalculationResult } from 'src/features/cross-chain/calculation-manager/providers/common/models/calculation-result';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { ProxyCrossChainEvmTrade } from 'src/features/cross-chain/calculation-manager/providers/common/proxy-cross-chain-evm-facade/proxy-cross-chain-evm-trade';
import {
    MultichainCrossChainSupportedBlockchain,
    multichainCrossChainSupportedBlockchains
} from 'src/features/cross-chain/calculation-manager/providers/multichain-provider/models/supported-blockchain';
import { MultichainTargetToken } from 'src/features/cross-chain/calculation-manager/providers/multichain-provider/models/tokens-api';
import { MultichainCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/multichain-provider/multichain-cross-chain-trade';
import { getMultichainTokens } from 'src/features/cross-chain/calculation-manager/providers/multichain-provider/utils/get-multichain-tokens';
import { getToFeeAmount } from 'src/features/cross-chain/calculation-manager/providers/multichain-provider/utils/get-to-fee-amount';
import { isMultichainMethodName } from 'src/features/cross-chain/calculation-manager/providers/multichain-provider/utils/is-multichain-method-name';
import { EvmOnChainTrade } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/evm-on-chain-trade';

export class MultichainCrossChainProvider extends CrossChainProvider {
    public readonly type = CROSS_CHAIN_TRADE_TYPE.MULTICHAIN;

    public isSupportedBlockchain(
        blockchain: BlockchainName
    ): blockchain is MultichainCrossChainSupportedBlockchain {
        return multichainCrossChainSupportedBlockchains.some(
            supportedBlockchain => supportedBlockchain === blockchain
        );
    }

    public async calculate(
        from: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken,
        options: RequiredCrossChainOptions
    ): Promise<CalculationResult> {
        const fromBlockchain = from.blockchain as MultichainCrossChainSupportedBlockchain;
        const toBlockchain = toToken.blockchain as MultichainCrossChainSupportedBlockchain;
        const useProxy = options?.useProxy?.[this.type] ?? true;

        if (!this.areSupportedBlockchains(fromBlockchain, toBlockchain)) {
            return null;
        }

        try {
            const sourceTransitToken = await this.getSourceTransitToken(fromBlockchain, toToken);
            if (!sourceTransitToken) {
                return {
                    trade: null,
                    error: new NotSupportedTokensError()
                };
            }

            const tokens = await getMultichainTokens(
                {
                    blockchain: fromBlockchain,
                    address: sourceTransitToken.address,
                    isNative: sourceTransitToken.tokenType === 'NATIVE'
                },
                toBlockchain
            );
            const routerMethodName = tokens?.targetToken.routerABI.split('(')[0]!;
            if (!tokens || !isMultichainMethodName(routerMethodName)) {
                return {
                    trade: null,
                    error: new NotSupportedTokensError()
                };
            }
            const { targetToken } = tokens;

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
            const cryptoFee = this.getProtocolFee(targetToken, from.tokenAmount);

            let onChainTrade: EvmOnChainTrade | null = null;
            let transitTokenAmount: BigNumber;
            let transitMinAmount: BigNumber;

            if (
                (from.isNative && sourceTransitToken.tokenType === 'NATIVE') ||
                compareAddresses(from.address, sourceTransitToken.address)
            ) {
                transitTokenAmount = fromWithoutFee.tokenAmount;
                transitMinAmount = transitTokenAmount;
            } else {
                if (useProxy) {
                    return {
                        trade: null,
                        error: new NotSupportedTokensError()
                    };
                }
                onChainTrade = await ProxyCrossChainEvmTrade.getOnChainTrade(
                    fromWithoutFee,
                    {
                        ...sourceTransitToken,
                        blockchain: fromBlockchain
                    },
                    options.slippageTolerance
                );
                if (!onChainTrade) {
                    return {
                        trade: null,
                        error: new NotSupportedTokensError()
                    };
                }

                transitTokenAmount = onChainTrade.to.tokenAmount;
                transitMinAmount = onChainTrade.toTokenAmountMin.tokenAmount;
            }
            const feeToAmount = getToFeeAmount(transitTokenAmount, targetToken);
            const toAmount = transitTokenAmount.minus(feeToAmount);

            const to = new PriceTokenAmount({
                ...toToken.asStruct,
                tokenAmount: toAmount
            });
            const toTokenAmountMin = transitMinAmount.minus(feeToAmount);

            const routerAddress = targetToken.router;
            const spenderAddress = targetToken.spender;
            const anyTokenAddress = targetToken.fromanytoken.address;
            const gasData =
                options.gasCalculation === 'enabled'
                    ? await MultichainCrossChainTrade.getGasData(
                          from,
                          to,
                          routerAddress,
                          spenderAddress,
                          routerMethodName,
                          anyTokenAddress,
                          onChainTrade
                      )
                    : null;

            const trade = new MultichainCrossChainTrade(
                {
                    from,
                    to,
                    gasData,
                    priceImpact: onChainTrade?.from
                        ? from.calculatePriceImpactPercent(onChainTrade?.to) || 0
                        : 0,
                    toTokenAmountMin,
                    feeInfo: {
                        ...feeInfo,
                        provider: {
                            cryptoFee
                        }
                    },
                    routerAddress,
                    spenderAddress,
                    routerMethodName,
                    anyTokenAddress,
                    onChainTrade,
                    slippage: options.slippageTolerance
                },
                options.providerAddress
            );

            try {
                this.checkMinMaxErrors(
                    { tokenAmount: transitTokenAmount, symbol: sourceTransitToken.symbol },
                    { tokenAmount: transitMinAmount, symbol: sourceTransitToken.symbol },
                    targetToken,
                    feeInfo
                );
            } catch (error) {
                return {
                    trade,
                    error
                };
            }
            return { trade };
        } catch (err: unknown) {
            return {
                trade: null,
                error: CrossChainProvider.parseError(err)
            };
        }
    }

    private async getSourceTransitToken(
        fromBlockchain: BlockchainName,
        toToken: Token
    ): Promise<MultichainTargetToken | null> {
        const tokens = await getMultichainTokens(toToken, fromBlockchain);
        if (!tokens) {
            return null;
        }
        return tokens.targetToken;
    }

    private getProtocolFee(
        targetToken: MultichainTargetToken,
        fromAmount: BigNumber
    ): { amount: BigNumber; tokenSymbol: string } {
        const minFee = targetToken.MinimumSwapFee;
        const maxFee = targetToken.MaximumSwapFee;

        let amount = fromAmount.multipliedBy(targetToken.SwapFeeRatePerMillion).dividedBy(100);

        if (amount.gte(maxFee)) {
            amount = new BigNumber(maxFee);
        }

        if (amount.lte(minFee)) {
            amount = new BigNumber(minFee);
        }

        return {
            amount,
            tokenSymbol: targetToken.symbol
        };
    }

    protected async getFeeInfo(
        fromBlockchain: MultichainCrossChainSupportedBlockchain,
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

    private checkMinMaxErrors(
        amount: { tokenAmount: BigNumber; symbol: string },
        minAmount: { tokenAmount: BigNumber; symbol: string },
        targetToken: MultichainTargetToken,
        feeInfo: FeeInfo
    ): void {
        if (minAmount.tokenAmount.lt(targetToken.MinimumSwap)) {
            const minimumAmount = new BigNumber(targetToken.MinimumSwap)
                .dividedBy(1 - (feeInfo.rubicProxy?.platformFee?.percent || 0) / 100)
                .toFixed(5, 0);
            throw new MinAmountError(new BigNumber(minimumAmount), minAmount.symbol);
        }

        if (amount.tokenAmount.gt(targetToken.MaximumSwap)) {
            const maximumAmount = new BigNumber(targetToken.MaximumSwap)
                .dividedBy(1 - (feeInfo.rubicProxy?.platformFee?.percent || 0) / 100)
                .toFixed(5, 1);
            throw new MaxAmountError(new BigNumber(maximumAmount), amount.symbol);
        }
    }
}
