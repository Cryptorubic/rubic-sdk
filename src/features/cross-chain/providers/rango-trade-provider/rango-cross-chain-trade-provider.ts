import BigNumber from 'bignumber.js';
import {
    EvmTransaction,
    MetaResponse,
    QuotePath,
    QuoteSimulationResult,
    RangoClient,
    SwapRequest
} from 'rango-sdk-basic/lib';
import { BlockchainName, BlockchainsInfo, Web3Pure } from 'src/core';
import { PriceTokenAmount } from '@rsdk-core/blockchain/tokens/price-token-amount';
import { nativeTokensList } from 'src/core/blockchain/constants/native-tokens';
import { Injector } from 'src/core/sdk/injector';
import { FeeInfo } from 'src/features/cross-chain/providers/common/models/fee';
import { EMPTY_ADDRESS } from 'src/core/blockchain/constants/empty-address';
import { CrossChainMinAmountError } from 'src/common/errors/cross-chain/cross-chain-min-amount.error';
import { CrossChainMaxAmountError } from 'src/common/errors/cross-chain/cross-chain-max-amount.error';
import { TradeType } from 'src/features/instant-trades';
import { rangoProviders } from 'src/features/instant-trades/dexes/common/rango/constants/rango-providers';
import { UnsupportedReceiverAddressError } from 'src/common/errors/cross-chain/unsupported-receiver-address.error';
import { CalculationResult } from 'src/features/cross-chain/providers/common/models/calculation-result';
import { getFromWithoutFee } from 'src/features/cross-chain/utils/get-from-without-fee';
import { RequiredCrossChainOptions } from '../../models/cross-chain-options';
import { CROSS_CHAIN_TRADE_TYPE } from '../../models/cross-chain-trade-type';
import { commonCrossChainAbi } from '../common/constants/common-cross-chain-abi';
import { CrossChainTradeProvider } from '../common/cross-chain-trade-provider';
import { RANGO_CONTRACT_ADDRESSES } from './constants/contract-address';
import { RANGO_API_KEY } from './constants/rango-api-key';
import {
    RangoCrossChainSupportedBlockchain,
    rangoCrossChainSupportedBlockchains
} from './constants/rango-cross-chain-supported-blockchain';
import { RangoCrossChainTrade } from './rango-cross-chain-trade';
import { RANGO_TRADE_BRIDGE_TYPE } from './models/rango-providers';
import { BridgeType } from '../../constants/bridge-type';
import { RANGO_BLOCKCHAIN_NAME } from './constants/rango-blockchain-name';

export class RangoCrossChainTradeProvider extends CrossChainTradeProvider {
    public readonly type = CROSS_CHAIN_TRADE_TYPE.RANGO;

    public readonly rango = new RangoClient(RANGO_API_KEY);

    public meta: MetaResponse | null = null;

    public get walletAddress(): string {
        return Injector.web3Private.address;
    }

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

    public async calculate(
        from: PriceTokenAmount,
        toToken: PriceTokenAmount,
        options: RequiredCrossChainOptions
    ): Promise<CalculationResult> {
        if (options.receiverAddress) {
            throw new UnsupportedReceiverAddressError();
        }

        const fromBlockchain = from.blockchain as RangoCrossChainSupportedBlockchain;
        const toBlockchain = toToken.blockchain as RangoCrossChainSupportedBlockchain;

        if (!this.isSupportedBlockchains(fromBlockchain, toBlockchain)) {
            return null;
        }

        await this.checkContractState(
            fromBlockchain,
            RANGO_CONTRACT_ADDRESSES[fromBlockchain].rubicRouter
        );

        const price = await from.getAndUpdateTokenPrice();
        const amountUsdPrice = from.tokenAmount.multipliedBy(price);

        if (price && amountUsdPrice.lt(101)) {
            return {
                trade: null,
                error: new CrossChainMinAmountError(
                    new BigNumber(101).dividedBy(price),
                    from.symbol
                )
            };
        }

        try {
            const feeInfo = await this.getFeeInfo(fromBlockchain, options.providerAddress);
            const fromWithoutFee = getFromWithoutFee(from, feeInfo);
            const request = this.getRequestParams(fromWithoutFee, toToken, options);

            const { route, resultType, tx } = await this.rango.swap(request);

            const networkFee = route?.fee.find(item => item.name === 'Network Fee');

            if ((resultType === 'INPUT_LIMIT_ISSUE' || resultType === 'NO_ROUTE') && route) {
                return this.parseMinMaxAmountErrors(from, route);
            }

            if (resultType === 'OK' && route) {
                const to = new PriceTokenAmount({
                    ...toToken.asStruct,
                    tokenAmount: Web3Pure.fromWei(route.outputAmount, toToken.decimals)
                });

                const cryptoFeeToken = await PriceTokenAmount.createFromToken({
                    ...BlockchainsInfo.getBlockchainByName(fromBlockchain).nativeCoin,
                    weiAmount: new BigNumber(parseInt((tx as EvmTransaction).value || '0')).minus(
                        from.isNative ? from.stringWeiAmount : 0
                    )
                });

                const gasData =
                    options.gasCalculation === 'enabled'
                        ? await RangoCrossChainTrade.getGasData(from, toToken)
                        : null;

                const { bridgeType, itType } = this.parseTradeTypes(route as QuoteSimulationResult);

                const rangoTrade = new RangoCrossChainTrade(
                    {
                        from,
                        to,
                        toTokenAmountMin: Web3Pure.fromWei(route.outputAmount, toToken.decimals),
                        priceImpact: from.calculatePriceImpactPercent(toToken),
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
                    options.providerAddress || EMPTY_ADDRESS
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
        const fromAddress = this.walletAddress || EMPTY_ADDRESS;
        const toAddress = this.walletAddress || EMPTY_ADDRESS;
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

    private parseMinMaxAmountErrors(
        fromToken: PriceTokenAmount,
        route: QuoteSimulationResult
    ): CalculationResult {
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

        return null;
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
        fromBlockchain: Partial<BlockchainName>,
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
