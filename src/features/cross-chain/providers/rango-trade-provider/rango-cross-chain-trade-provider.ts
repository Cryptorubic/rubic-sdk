import {
    RangoCrossChainSupportedBlockchain,
    rangoCrossChainSupportedBlockchains
} from 'src/features/cross-chain/providers/rango-trade-provider/constants/rango-cross-chain-supported-blockchain';
import { BlockchainName, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import {
    CrossChainMaxAmountError,
    CrossChainMinAmountError,
    UnsupportedReceiverAddressError
} from 'src/common/errors';
import { FeeInfo } from 'src/features/cross-chain/providers/common/models/fee';
import { RequiredCrossChainOptions } from 'src/features/cross-chain/models/cross-chain-options';
import { RANGO_API_KEY } from 'src/features/cross-chain/providers/rango-trade-provider/constants/rango-api-key';
import {
    EvmTransaction,
    MetaResponse,
    QuotePath,
    QuoteSimulationResult,
    RangoClient,
    SwapRequest
} from 'rango-sdk-basic/lib';
import { RangoCrossChainTrade } from 'src/features/cross-chain/providers/rango-trade-provider/rango-cross-chain-trade';
import { commonCrossChainAbi } from 'src/features/cross-chain/providers/common/constants/common-cross-chain-abi';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { nativeTokensList } from 'src/common/tokens/constants/native-tokens';
import { RANGO_BLOCKCHAIN_NAME } from 'src/features/cross-chain/providers/rango-trade-provider/constants/rango-blockchain-name';
import { RANGO_CONTRACT_ADDRESSES } from 'src/features/cross-chain/providers/rango-trade-provider/constants/contract-address';
import { PriceTokenAmount } from 'src/common/tokens';
import { BridgeType } from 'src/features/cross-chain/providers/common/models/bridge-type';
import { rangoProviders } from 'src/features/instant-trades/dexes/common/rango/constants/rango-providers';
import { RANGO_TRADE_BRIDGE_TYPE } from 'src/features/cross-chain/providers/rango-trade-provider/models/rango-providers';
import { CROSS_CHAIN_TRADE_TYPE } from 'src/features/cross-chain/models/cross-chain-trade-type';
import { CrossChainTradeProvider } from 'src/features/cross-chain/providers/common/cross-chain-trade-provider';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure';
import BigNumber from 'bignumber.js';
import { TradeType } from 'src/features/instant-trades/models/trade-type';
import { CalculationResult } from 'src/features/cross-chain/providers/common/models/calculation-result';

export class RangoCrossChainTradeProvider extends CrossChainTradeProvider {
    public readonly type = CROSS_CHAIN_TRADE_TYPE.RANGO;

    public readonly rango = new RangoClient(RANGO_API_KEY);

    public meta: MetaResponse | null = null;

    public static isSupportedBlockchain(
        blockchain: BlockchainName
    ): blockchain is RangoCrossChainSupportedBlockchain {
        return rangoCrossChainSupportedBlockchains.some(
            supportedBlockchain => supportedBlockchain === blockchain
        );
    }

    public isSupportedBlockchains(
        fromBlockchain: BlockchainName,
        toBlockchain: BlockchainName
    ): boolean {
        return (
            RangoCrossChainTradeProvider.isSupportedBlockchain(fromBlockchain) &&
            RangoCrossChainTradeProvider.isSupportedBlockchain(toBlockchain)
        );
    }

    // @TODO Reduce complexity
    public async calculate(
        fromToken: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceTokenAmount<EvmBlockchainName>,
        options: RequiredCrossChainOptions
    ): Promise<CalculationResult> {
        if (options.receiverAddress) {
            throw new UnsupportedReceiverAddressError();
        }

        const fromBlockchain = fromToken.blockchain as RangoCrossChainSupportedBlockchain;
        const toBlockchain = toToken.blockchain as RangoCrossChainSupportedBlockchain;

        if (!this.isSupportedBlockchains(fromBlockchain, toBlockchain)) {
            return null;
        }

        await this.checkContractState(
            fromBlockchain,
            RANGO_CONTRACT_ADDRESSES[fromBlockchain].rubicRouter
        );

        const price = await fromToken.getAndUpdateTokenPrice();
        const amountUsdPrice = fromToken.tokenAmount.multipliedBy(price);

        if (price && amountUsdPrice.lt(101)) {
            return {
                trade: null,
                error: new CrossChainMinAmountError(
                    new BigNumber(101).dividedBy(price),
                    fromToken.symbol
                )
            };
        }

        const request = this.getRequestParams(fromToken, toToken, options);

        try {
            const { route, resultType, tx } = await this.rango.swap(request);

            const feeInfo = await this.getFeeInfo(fromBlockchain, options.providerAddress);
            const networkFee = route?.fee.find(item => item.name === 'Network Fee');

            if ((resultType === 'INPUT_LIMIT_ISSUE' || resultType === 'NO_ROUTE') && route) {
                const { amountRestriction } = route;
                if (amountRestriction?.min && fromToken.weiAmount.lte(amountRestriction.min)) {
                    return {
                        trade: null,
                        error: new CrossChainMinAmountError(
                            Web3Pure.fromWei(amountRestriction.min, fromToken.decimals),
                            fromToken.symbol
                        )
                    };
                }

                if (amountRestriction?.max && fromToken.weiAmount.gte(amountRestriction.max)) {
                    return {
                        trade: null,
                        error: new CrossChainMaxAmountError(
                            Web3Pure.fromWei(amountRestriction.max, fromToken.decimals),
                            fromToken.symbol
                        )
                    };
                }
            }

            if (resultType === 'OK' && route) {
                const to = new PriceTokenAmount({
                    ...toToken.asStruct,
                    tokenAmount: Web3Pure.fromWei(route.outputAmount, toToken.decimals)
                });
                const cryptoFeeToken = await PriceTokenAmount.createFromToken({
                    ...nativeTokensList[fromBlockchain],
                    weiAmount: new BigNumber(parseInt((tx as EvmTransaction).value || '0')).minus(
                        fromToken.isNative ? fromToken.stringWeiAmount : 0
                    )
                });
                const gasData =
                    options.gasCalculation === 'enabled'
                        ? await RangoCrossChainTrade.getGasData(fromToken, toToken)
                        : null;
                const { bridgeType, itType } = this.parseTradeTypes(route as QuoteSimulationResult);
                const rangoTrade = new RangoCrossChainTrade(
                    {
                        from: fromToken,
                        to,
                        toTokenAmountMin: Web3Pure.fromWei(route.outputAmount, toToken.decimals),
                        priceImpact: fromToken.calculatePriceImpactPercent(toToken),
                        itType,
                        bridgeType,
                        slippageTolerance: options.slippageTolerance as number,
                        feeInfo: {
                            ...feeInfo,
                            cryptoFee: {
                                amount: Web3Pure.fromWei(
                                    networkFee?.amount || 0,
                                    networkFee?.token.decimals
                                ),
                                tokenSymbol:
                                    networkFee?.token.symbol ||
                                    nativeTokensList[fromBlockchain].symbol
                            }
                        },
                        cryptoFeeToken,
                        gasData
                    },
                    this.rango,
                    options.providerAddress
                );

                return { trade: rangoTrade };
            }

            return null;
        } catch (error: unknown) {
            const rubicSdkError = CrossChainTradeProvider.parseError(error);
            return { trade: null, error: rubicSdkError };
        }
    }

    private getRequestParams(
        fromToken: PriceTokenAmount,
        toToken: PriceTokenAmount,
        options: RequiredCrossChainOptions
    ): SwapRequest {
        const fromAddress = this.walletAddress || EvmWeb3Pure.EMPTY_ADDRESS;
        const toAddress = this.walletAddress || EvmWeb3Pure.EMPTY_ADDRESS;
        return {
            from: {
                blockchain:
                    RANGO_BLOCKCHAIN_NAME[
                        fromToken.blockchain as RangoCrossChainSupportedBlockchain
                    ],
                symbol: fromToken.symbol,
                address: fromToken.isNative ? null : fromToken.address
            },
            to: {
                blockchain:
                    RANGO_BLOCKCHAIN_NAME[toToken.blockchain as RangoCrossChainSupportedBlockchain],
                symbol: toToken.symbol,
                address: toToken.isNative ? null : toToken.address
            },
            amount: fromToken.weiAmount.toFixed(0),
            disableEstimate: true,
            slippage: (options.slippageTolerance * 100).toString(),
            fromAddress,
            toAddress,
            referrerAddress: null,
            referrerFee: null
        };
    }

    private parseTradeTypes(route: QuoteSimulationResult): {
        bridgeType: BridgeType | undefined;
        itType: { from: TradeType | undefined; to: TradeType | undefined };
    } {
        const { path, swapper } = route;

        if (!path) {
            return {
                itType: { from: undefined, to: undefined },
                bridgeType: RANGO_TRADE_BRIDGE_TYPE[swapper.id]
            };
        }

        const swapperId = path.find(
            item => item.swapperType === 'BRIDGE' || item.swapperType === 'AGGREGATOR'
        )?.swapper?.id;
        const dexes = path
            .filter(item => item.swapperType === 'DEX')
            .map((item: QuotePath) => item.swapper.id);
        const itType = {
            from: dexes[0] ? rangoProviders[dexes[0]] : undefined,
            to: dexes[1] ? rangoProviders[dexes[1]] : undefined
        };

        return { itType, bridgeType: RANGO_TRADE_BRIDGE_TYPE[swapperId as string] };
    }

    protected async getFeeInfo(
        fromBlockchain: Partial<EvmBlockchainName>,
        providerAddress: string
    ): Promise<FeeInfo> {
        return {
            fixedFee: {
                amount: await this.getFixedFee(
                    fromBlockchain,
                    providerAddress,
                    RANGO_CONTRACT_ADDRESSES[fromBlockchain as RangoCrossChainSupportedBlockchain]
                        .rubicRouter,
                    commonCrossChainAbi
                ),
                tokenSymbol: nativeTokensList[fromBlockchain].symbol
            },
            platformFee: {
                percent: await this.getFeePercent(
                    fromBlockchain,
                    providerAddress,
                    RANGO_CONTRACT_ADDRESSES[fromBlockchain as RangoCrossChainSupportedBlockchain]
                        .rubicRouter,
                    commonCrossChainAbi
                ),
                tokenSymbol: 'USDC'
            },
            cryptoFee: null
        };
    }
}
