import BigNumber from 'bignumber.js';
import { MaxAmountError, MinAmountError, NotSupportedTokensError } from 'src/common/errors';
import { PriceToken, PriceTokenAmount, Token } from 'src/common/tokens';
import { compareAddresses } from 'src/common/utils/blockchain';
import { BlockchainName, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
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

    // eslint-disable-next-line complexity
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
            const tokensInfo = await this.getMultichainTokens(from, toBlockchain);
            const isPureBridge = tokensInfo?.targetToken.address === toToken.address;

            let targetToken: MultichainTargetToken;
            let routerMethodName: MultichainMethodName;
            let onChainTrade: EvmOnChainTrade | null = null;
            let transitTokenAmount: BigNumber;
            let transitMinAmount: BigNumber;

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

            if (isPureBridge) {
                targetToken = tokensInfo!.targetToken;
                transitTokenAmount = fromWithoutFee.tokenAmount;
                transitMinAmount = transitTokenAmount;
                routerMethodName = targetToken.routerABI.split('(')[0]! as MultichainMethodName;
                if (useProxy && !this.isMultichainMethodName(routerMethodName)) {
                    return {
                        trade: null,
                        error: new NotSupportedTokensError()
                    };
                }
            } else {
                const sourceTransitToken = await this.getSourceTransitToken(
                    fromBlockchain,
                    toToken
                );
                if (!sourceTransitToken) {
                    return {
                        trade: null,
                        error: new NotSupportedTokensError()
                    };
                }
                const tokens = await this.getMultichainTokens(
                    {
                        blockchain: fromBlockchain,
                        address: sourceTransitToken.address,
                        isNative: sourceTransitToken.tokenType === 'NATIVE'
                    },
                    toBlockchain
                );
                routerMethodName = tokens?.targetToken.routerABI.split(
                    '('
                )[0]! as MultichainMethodName;
                if (!tokens || (useProxy && !this.isMultichainMethodName(routerMethodName))) {
                    return {
                        trade: null,
                        error: new NotSupportedTokensError()
                    };
                }
                targetToken = tokens.targetToken;
                if (
                    (from.isNative && sourceTransitToken.tokenType === 'NATIVE') ||
                    compareAddresses(from.address, sourceTransitToken.address)
                ) {
                    transitTokenAmount = fromWithoutFee.tokenAmount;
                    transitMinAmount = transitTokenAmount;
                } else {
                    if (!useProxy) {
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

    private async getSourceTransitToken(
        fromBlockchain: BlockchainName,
        toToken: Token
    ): Promise<MultichainTargetToken | null> {
        const tokens = await this.getMultichainTokens(toToken, fromBlockchain);
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

    private async getMultichainTokens(
        from: {
            blockchain: BlockchainName;
            address: string;
            isNative: boolean;
        },
        toBlockchain: BlockchainName
    ): Promise<{ sourceToken: MultichainSourceToken; targetToken: MultichainTargetToken } | null> {
        const fromChainId = blockchainId[from.blockchain];
        const tokensList = await Injector.httpClient.get<MultichainTokensResponse>(
            `https://bridgeapi.anyswap.exchange/v4/tokenlistv4/${fromChainId}`
        );
        const sourceToken = Object.entries(tokensList).find(([address, token]) => {
            return (
                (token.tokenType === 'NATIVE' && from.isNative) ||
                (token.tokenType === 'TOKEN' &&
                    address.toLowerCase().endsWith(from.address.toLowerCase()))
            );
        })?.[1];
        if (!sourceToken) {
            return null;
        }

        const toChainId = blockchainId[toBlockchain];
        const dstChainInformation = sourceToken?.destChains[toChainId.toString()];
        if (!sourceToken || !dstChainInformation) {
            return null;
        }
        const dstTokens = Object.values(dstChainInformation);

        const anyToken = dstTokens.find(token => {
            const method = token.routerABI.split('(')[0]!;
            return multichainMethodNames.includes(method as MultichainMethodName);
        });
        const targetToken = anyToken || dstTokens[0];
        if (!targetToken) {
            return null;
        }

        return { sourceToken, targetToken };
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
}
