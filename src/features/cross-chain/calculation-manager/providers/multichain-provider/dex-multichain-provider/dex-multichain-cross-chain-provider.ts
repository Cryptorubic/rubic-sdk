import BigNumber from 'bignumber.js';
import { NotSupportedTokensError } from 'src/common/errors';
import { PriceToken, PriceTokenAmount, Token } from 'src/common/tokens';
import { compareAddresses } from 'src/common/utils/blockchain';
import { BlockchainName, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { getFromWithoutFee } from 'src/features/common/utils/get-from-without-fee';
import { RequiredCrossChainOptions } from 'src/features/cross-chain/calculation-manager/models/cross-chain-options';
import { CROSS_CHAIN_TRADE_TYPE } from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { CrossChainProvider } from 'src/features/cross-chain/calculation-manager/providers/common/cross-chain-provider';
import { CalculationResult } from 'src/features/cross-chain/calculation-manager/providers/common/models/calculation-result';
import { ProxyCrossChainEvmTrade } from 'src/features/cross-chain/calculation-manager/providers/common/proxy-cross-chain-evm-facade/proxy-cross-chain-evm-trade';
import { DexMultichainCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/multichain-provider/dex-multichain-provider/dex-multichain-cross-chain-trade';
import {
    MultichainProxyCrossChainSupportedBlockchain,
    multichainProxyCrossChainSupportedBlockchains
} from 'src/features/cross-chain/calculation-manager/providers/multichain-provider/dex-multichain-provider/models/supported-blockchain';
import { MultichainTargetToken } from 'src/features/cross-chain/calculation-manager/providers/multichain-provider/models/tokens-api';
import { MultichainCrossChainProvider } from 'src/features/cross-chain/calculation-manager/providers/multichain-provider/multichain-cross-chain-provider';
import { getMultichainTokens } from 'src/features/cross-chain/calculation-manager/providers/multichain-provider/utils/get-multichain-tokens';
import { getToFeeAmount } from 'src/features/cross-chain/calculation-manager/providers/multichain-provider/utils/get-to-fee-amount';
import { isMultichainMethodName } from 'src/features/cross-chain/calculation-manager/providers/multichain-provider/utils/is-multichain-method-name';
import { EvmOnChainTrade } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/evm-on-chain-trade';

export class DexMultichainCrossChainProvider extends MultichainCrossChainProvider {
    public readonly type = CROSS_CHAIN_TRADE_TYPE.MULTICHAIN;

    public isSupportedBlockchain(
        blockchain: BlockchainName
    ): blockchain is MultichainProxyCrossChainSupportedBlockchain {
        return multichainProxyCrossChainSupportedBlockchains.some(
            supportedBlockchain => supportedBlockchain === blockchain
        );
    }

    public async calculate(
        from: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken,
        options: RequiredCrossChainOptions
    ): Promise<CalculationResult> {
        const fromBlockchain = from.blockchain as MultichainProxyCrossChainSupportedBlockchain;
        const toBlockchain = toToken.blockchain as MultichainProxyCrossChainSupportedBlockchain;
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

            const feeInfo = await this.getFeeInfo(fromBlockchain, options.providerAddress, from);
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
                    ? await DexMultichainCrossChainTrade.getGasData(
                          from,
                          to,
                          routerAddress,
                          spenderAddress,
                          routerMethodName,
                          anyTokenAddress,
                          onChainTrade
                      )
                    : null;

            const trade = new DexMultichainCrossChainTrade(
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
}
