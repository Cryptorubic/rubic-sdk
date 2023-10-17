import BigNumber from 'bignumber.js';
import {
    MaxAmountError,
    MinAmountError,
    NotSupportedTokensError,
    RubicSdkError,
    TooLowAmountError
} from 'src/common/errors';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { TokenStruct } from 'src/common/tokens/token';
import {
    BLOCKCHAIN_NAME,
    BlockchainName,
    EvmBlockchainName
} from 'src/core/blockchain/models/blockchain-name';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import { Web3PrivateSupportedBlockchain } from 'src/core/blockchain/web3-private-service/models/web-private-supported-blockchain';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { Injector } from 'src/core/injector/injector';
import { getFromWithoutFee } from 'src/features/common/utils/get-from-without-fee';
import { RequiredCrossChainOptions } from 'src/features/cross-chain/calculation-manager/models/cross-chain-options';
import { CROSS_CHAIN_TRADE_TYPE } from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { CrossChainProvider } from 'src/features/cross-chain/calculation-manager/providers/common/cross-chain-provider';
import { CalculationResult } from 'src/features/cross-chain/calculation-manager/providers/common/models/calculation-result';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { ProxyCrossChainEvmTrade } from 'src/features/cross-chain/calculation-manager/providers/common/proxy-cross-chain-evm-facade/proxy-cross-chain-evm-trade';
import {
    SymbiosisCrossChainSupportedBlockchain,
    symbiosisCrossChainSupportedBlockchains
} from 'src/features/cross-chain/calculation-manager/providers/symbiosis-provider/constants/symbiosis-cross-chain-supported-blockchain';
import { SwappingParams } from 'src/features/cross-chain/calculation-manager/providers/symbiosis-provider/models/swapping-params';
import {
    errorCode,
    SymbiosisError
} from 'src/features/cross-chain/calculation-manager/providers/symbiosis-provider/models/symbiosis-error';
import {
    SymbiosisToken,
    SymbiosisTokenAmount,
    SymbiosisTradeData
} from 'src/features/cross-chain/calculation-manager/providers/symbiosis-provider/models/symbiosis-trade-data';
import { SymbiosisCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/symbiosis-provider/symbiosis-cross-chain-trade';
import { oneinchApiParams } from 'src/features/on-chain/calculation-manager/providers/dexes/common/oneinch-abstract/constants';

export class SymbiosisCrossChainProvider extends CrossChainProvider {
    public readonly type = CROSS_CHAIN_TRADE_TYPE.SYMBIOSIS;

    public readonly symbiosisApi = 'https://api-v2.symbiosis.finance/crosschain/v1';

    public isSupportedBlockchain(
        blockchain: BlockchainName
    ): blockchain is SymbiosisCrossChainSupportedBlockchain {
        return symbiosisCrossChainSupportedBlockchains.some(
            supportedBlockchain => supportedBlockchain === blockchain
        );
    }

    public override areSupportedBlockchains(
        fromBlockchain: BlockchainName,
        toBlockchain: BlockchainName
    ): boolean {
        if (fromBlockchain === BLOCKCHAIN_NAME.BITCOIN) {
            return false;
        }

        return super.areSupportedBlockchains(fromBlockchain, toBlockchain);
    }

    public async calculate(
        from: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken,
        options: RequiredCrossChainOptions
    ): Promise<CalculationResult> {
        const fromBlockchain = from.blockchain as SymbiosisCrossChainSupportedBlockchain;
        const toBlockchain = toToken.blockchain as SymbiosisCrossChainSupportedBlockchain;
        const useProxy = options?.useProxy?.[this.type] ?? true;

        if (!this.areSupportedBlockchains(fromBlockchain, toBlockchain)) {
            return {
                trade: null,
                error: new NotSupportedTokensError(),
                tradeType: this.type
            };
        }

        try {
            const fromAddress =
                options.fromAddress ||
                this.getWalletAddress(fromBlockchain as Web3PrivateSupportedBlockchain) ||
                oneinchApiParams.nativeAddress;

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

            const tokenIn: SymbiosisToken = {
                chainId: blockchainId[fromBlockchain],
                address: from.isNative ? '' : from.address,
                decimals: from.decimals,
                isNative: from.isNative,
                symbol: from.symbol
            };

            const tokenOut: SymbiosisToken = {
                chainId: blockchainId[toBlockchain],
                address: toToken.isNative ? '' : toToken.address,
                decimals: toToken.decimals,
                isNative: toToken.isNative,
                symbol: toToken.symbol
            };

            const tokenAmountIn: SymbiosisTokenAmount = {
                ...tokenIn,
                amount: fromWithoutFee.stringWeiAmount
            };

            const receiverAddress = options.receiverAddress || fromAddress;

            const deadline = Math.floor(Date.now() / 1000) + 60 * options.deadline;
            const slippageTolerance = options.slippageTolerance * 10000;

            const trade = await this.getTrade({
                tokenAmountIn,
                tokenOut,
                fromAddress,
                receiverAddress,
                refundAddress: fromAddress,
                slippage: slippageTolerance,
                deadline
            });
            const {
                tokenAmountOut,
                fee: transitTokenFee,
                inTradeType,
                outTradeType,
                tx,
                approveTo,
                amountInUsd
            } = trade;

            const swapFunction = (fromUserAddress: string, receiver?: string) => {
                const refundAddress = receiver || fromAddress;
                const receiverAddress = receiver || fromUserAddress;

                const amountIn = fromWithoutFee.tokenAmount;
                const tokenAmountIn: SymbiosisTokenAmount = {
                    ...tokenIn,
                    amount: Web3Pure.toWei(amountIn, from.decimals)
                };

                return this.getTrade({
                    tokenAmountIn,
                    tokenOut,
                    fromAddress: fromUserAddress,
                    receiverAddress,
                    refundAddress,
                    slippage: slippageTolerance,
                    deadline
                });
            };

            const to = new PriceTokenAmount({
                ...toToken.asStruct,
                tokenAmount: new BigNumber(
                    Web3Pure.fromWei(tokenAmountOut.amount, tokenAmountOut.decimals)
                )
            });

            const gasData =
                options.gasCalculation === 'enabled'
                    ? await SymbiosisCrossChainTrade.getGasData(from, to)
                    : null;

            return {
                trade: new SymbiosisCrossChainTrade(
                    {
                        from,
                        to,
                        swapFunction,
                        gasData,
                        priceImpact: from.calculatePriceImpactPercent(to),
                        slippage: options.slippageTolerance,
                        feeInfo: {
                            ...feeInfo,
                            provider: {
                                cryptoFee: {
                                    amount: new BigNumber(
                                        Web3Pure.fromWei(
                                            transitTokenFee.amount,
                                            transitTokenFee.decimals
                                        )
                                    ),
                                    tokenSymbol: transitTokenFee.symbol || ''
                                }
                            }
                        },
                        transitAmount: from.tokenAmount,
                        amountInUsd: amountInUsd
                            ? Web3Pure.fromWei(amountInUsd?.amount, amountInUsd?.decimals)
                            : null,
                        tradeType: { in: inTradeType, out: outTradeType },
                        contractAddresses: { providerRouter: tx.to!, providerGateway: approveTo }
                    },
                    options.providerAddress
                ),
                tradeType: this.type
            };
        } catch (err: unknown) {
            let rubicSdkError = CrossChainProvider.parseError(err);
            const symbiosisMessage = (err as { error: SymbiosisError })?.error?.message;

            if (symbiosisMessage?.includes('$') || symbiosisMessage?.includes('Min amount')) {
                const symbiosisError = (err as { error: SymbiosisError }).error;
                rubicSdkError =
                    symbiosisError.code === errorCode.AMOUNT_LESS_THAN_FEE ||
                    symbiosisError.code === 400
                        ? new TooLowAmountError()
                        : await this.checkMinMaxErrors(symbiosisError);
            }

            return {
                trade: null,
                error: rubicSdkError,
                tradeType: this.type
            };
        }
    }

    private async checkMinMaxErrors(err: SymbiosisError): Promise<RubicSdkError> {
        if (err.code === errorCode.AMOUNT_TOO_LOW) {
            const index = err.message!.lastIndexOf('$');
            const transitTokenAmount = new BigNumber(err.message!.substring(index + 1));
            return new MinAmountError(transitTokenAmount, 'USDC');
        }

        if (err?.code === errorCode.AMOUNT_TOO_HIGH) {
            const index = err.message!.lastIndexOf('$');
            const transitTokenAmount = new BigNumber(err.message!.substring(index + 1));
            return new MaxAmountError(transitTokenAmount, 'USDC');
        }

        return new RubicSdkError(err.message);
    }

    protected async getFeeInfo(
        fromBlockchain: SymbiosisCrossChainSupportedBlockchain,
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

    private async getTrade(swapParams: {
        tokenAmountIn: SymbiosisTokenAmount;
        tokenOut: SymbiosisToken | null;
        fromAddress: string;
        receiverAddress: string;
        refundAddress: string;
        slippage: number;
        deadline: number;
    }): Promise<SymbiosisTradeData> {
        const swappingParams: SwappingParams = {
            tokenAmountIn: swapParams.tokenAmountIn,
            tokenOut: swapParams.tokenOut!,
            to: swapParams.receiverAddress || swapParams.fromAddress,
            from: swapParams.fromAddress,
            revertableAddress: swapParams.fromAddress,
            slippage: swapParams.slippage,
            deadline: swapParams.deadline
        };

        return await Injector.httpClient.post<SymbiosisTradeData>(
            `${this.symbiosisApi}/swapping/exact_in?partnerId=rubic`,
            swappingParams
        );
    }

    private getTransferToken(
        route: SymbiosisToken[],
        from: PriceTokenAmount<EvmBlockchainName>
    ): TokenStruct | undefined {
        const fromBlockchainId = blockchainId[from.blockchain];
        const fromRouting = route.filter(token => token.chainId === fromBlockchainId);

        const token = fromRouting.at(-1)!;
        return fromRouting.length !== 1
            ? {
                  address: token.address,
                  decimals: token.decimals,
                  name: token.name!,
                  blockchain: from.blockchain,
                  symbol: token.symbol!
              }
            : undefined;
    }
}
