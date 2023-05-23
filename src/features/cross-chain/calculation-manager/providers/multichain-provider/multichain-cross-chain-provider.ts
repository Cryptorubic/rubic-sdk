import BigNumber from 'bignumber.js';
import { MaxAmountError, MinAmountError, NotSupportedTokensError } from 'src/common/errors';
import {
    nativeTokensList,
    PriceToken,
    PriceTokenAmount,
    wrappedNativeTokensList
} from 'src/common/tokens';
import { compareAddresses } from 'src/common/utils/blockchain';
import {
    BLOCKCHAIN_NAME,
    BlockchainName,
    EvmBlockchainName
} from 'src/core/blockchain/models/blockchain-name';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import { Injector } from 'src/core/injector/injector';
import { getFromWithoutFee } from 'src/features/common/utils/get-from-without-fee';
import { RequiredCrossChainOptions } from 'src/features/cross-chain/calculation-manager/models/cross-chain-options';
import { CROSS_CHAIN_TRADE_TYPE } from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { CrossChainProvider } from 'src/features/cross-chain/calculation-manager/providers/common/cross-chain-provider';
import { CalculationResult } from 'src/features/cross-chain/calculation-manager/providers/common/models/calculation-result';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { ProxyCrossChainEvmTrade } from 'src/features/cross-chain/calculation-manager/providers/common/proxy-cross-chain-evm-facade/proxy-cross-chain-evm-trade';
import {
    MultichainMethodName,
    multichainMethodNames
} from 'src/features/cross-chain/calculation-manager/providers/multichain-provider/models/multichain-method-name';
import {
    MultichainCrossChainSupportedBlockchain,
    multichainCrossChainSupportedBlockchains
} from 'src/features/cross-chain/calculation-manager/providers/multichain-provider/models/supported-blockchain';
import {
    MultichainSourceToken,
    MultichainTargetToken,
    MultichainTokensResponse
} from 'src/features/cross-chain/calculation-manager/providers/multichain-provider/models/tokens-api';
import { MultichainCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/multichain-provider/multichain-cross-chain-trade';
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
        let useProxy = options?.useProxy?.[this.type] ?? true;
        if (fromBlockchain === BLOCKCHAIN_NAME.ZK_SYNC) {
            useProxy = false;
        }
        if (!this.areSupportedBlockchains(fromBlockchain, toBlockchain)) {
            return null;
        }

        try {
            const tokensInfo = await this.getTokensData(from, toToken);
            const isPureBridge = this.checkIsBridge(tokensInfo, from, toToken);
            const routerMethodName = tokensInfo.target.routerABI.split(
                '('
            )[0]! as MultichainMethodName;
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
            const targetToken = tokensInfo!.target;

            let onChainTrade: EvmOnChainTrade | null = null;
            let transitTokenAmount = fromWithoutFee.tokenAmount;
            let transitMinAmount = transitTokenAmount;

            if (isPureBridge && !this.isMultichainMethodName(routerMethodName)) {
                return {
                    trade: null,
                    error: new NotSupportedTokensError()
                };
            }

            if (!isPureBridge) {
                const similarAddress = compareAddresses(from.address, tokensInfo.source.address);
                const isFromNative = from.isNative && tokensInfo.source.tokenType === 'NATIVE';
                const isFromWrap = compareAddresses(
                    from.address,
                    wrappedNativeTokensList[from.blockchain]!.address
                );
                const shouldSwap = !((isFromNative || similarAddress) && !isFromWrap);

                if (shouldSwap) {
                    if (!useProxy) {
                        return {
                            trade: null,
                            error: new NotSupportedTokensError()
                        };
                    }
                    const transitToken =
                        tokensInfo.source.tokenType === 'NATIVE'
                            ? nativeTokensList[fromBlockchain]
                            : {
                                  address: tokensInfo.source.address,
                                  blockchain: fromBlockchain
                              };
                    onChainTrade = await ProxyCrossChainEvmTrade.getOnChainTrade(
                        fromWithoutFee,
                        transitToken,
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
            }

            const feeToAmount = this.getToFeeAmount(transitTokenAmount, targetToken);
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

            const cryptoFee = this.getProtocolFee(targetToken, from.tokenAmount);
            const trade = new MultichainCrossChainTrade(
                {
                    from,
                    to,
                    gasData,
                    priceImpact:
                        (onChainTrade?.from && from.calculatePriceImpactPercent(to)) || null,
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
                const transitSymbol = onChainTrade ? onChainTrade.to.symbol : from.symbol;
                this.checkMinMaxErrors(
                    { tokenAmount: transitTokenAmount, symbol: transitSymbol },
                    { tokenAmount: transitMinAmount, symbol: transitSymbol },
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

    private getToFeeAmount(fromAmount: BigNumber, targetToken: MultichainTargetToken): BigNumber {
        return BigNumber.min(
            BigNumber.max(
                fromAmount.multipliedBy(targetToken.SwapFeeRatePerMillion / 100),
                new BigNumber(targetToken.MinimumSwapFee)
            ),
            new BigNumber(targetToken.MaximumSwapFee)
        );
    }

    private isMultichainMethodName(methodName: string): methodName is MultichainMethodName {
        return multichainMethodNames.some(
            multichainMethodName => multichainMethodName === methodName
        );
    }

    private async getTokensData(
        from: {
            blockchain: BlockchainName;
            address: string;
        },
        toToken: PriceToken
    ): Promise<{ source: MultichainSourceToken; target: MultichainTargetToken }> {
        const fromChainId = blockchainId[from.blockchain];
        const toChainId = blockchainId[toToken.blockchain];
        const tokensList = await Injector.httpClient.get<MultichainTokensResponse>(
            `https://bridgeapi.anyswap.exchange/v4/tokenlistv4/${fromChainId}`
        );
        let possibleTargetToken: MultichainTargetToken | undefined | null = null;
        const sourceToken = Object.values(tokensList).find(sourceToken => {
            const possibleTargetTokens = Object.values(sourceToken.destChains?.[toChainId] || {});
            const possibleTargetTokenInner = possibleTargetTokens.find(targetToken => {
                const isNative = targetToken.tokenType === 'NATIVE';
                return (
                    (compareAddresses(targetToken.address, toToken.address) && !isNative) ||
                    (isNative && toToken.isNative)
                );
            });
            possibleTargetToken = possibleTargetTokenInner;
            return possibleTargetTokenInner;
        });

        if (!sourceToken || !possibleTargetToken) {
            throw new NotSupportedTokensError();
        }

        return { source: sourceToken, target: possibleTargetToken };
    }

    private checkIsBridge(
        tokensInfo: { source: MultichainSourceToken; target: MultichainTargetToken },
        from: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken
    ): boolean {
        const fromNative = tokensInfo.source.tokenType === 'NATIVE';
        const toNative = tokensInfo.target.tokenType === 'NATIVE';

        const fromTokenMatch =
            (compareAddresses(tokensInfo.source.address, from.address) && !fromNative) ||
            (fromNative && from.isNative);
        const toTokenMatch =
            (compareAddresses(tokensInfo.target.address, toToken.address) && !toNative) ||
            (toNative && toToken.isNative);

        return fromTokenMatch && toTokenMatch;
    }
}
