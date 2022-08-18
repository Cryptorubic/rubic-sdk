import BigNumber from 'bignumber.js';
import {
    EvmTransaction,
    MetaResponse,
    QuotePath,
    QuoteSimulationResult,
    RangoClient,
    SwapRequest
} from 'rango-sdk-basic/lib';
import { CrossChainIsUnavailableError } from 'src/common';
import { BlockchainName, Web3Pure } from 'src/core';
import { PriceTokenAmount } from '@rsdk-core/blockchain/tokens/price-token-amount';
import { NATIVE_TOKEN_ADDRESS } from 'src/core/blockchain/constants/native-token-address';
import { nativeTokensList } from 'src/core/blockchain/constants/native-tokens';
import { Injector } from 'src/core/sdk/injector';
import { FeeInfo } from 'src/features/cross-chain/providers/common/models/fee';
import { EMPTY_ADDRESS } from 'src/core/blockchain/constants/empty-address';
import { CrossChainMinAmountError } from 'src/common/errors/cross-chain/cross-chain-min-amount.error';
import { CrossChainMaxAmountError } from 'src/common/errors/cross-chain/cross-chain-max-amount.error';
import { TradeType } from 'src/features/instant-trades';
import { rangoProviders } from 'src/features/instant-trades/dexes/common/rango/constants/rango-providers';
import { RequiredCrossChainOptions } from '../../models/cross-chain-options';
import { CROSS_CHAIN_TRADE_TYPE } from '../../models/cross-chain-trade-type';
import { commonCrossChainAbi } from '../common/constants/common-cross-chain-abi';
import { CrossChainTradeProvider } from '../common/cross-chain-trade-provider';
import { WrappedCrossChainTrade } from '../common/models/wrapped-cross-chain-trade';
import { RANGO_CONTRACT_ADDRESSES } from './constants/contract-address';
import { RANGO_API_KEY } from './constants/rango-api-key';
import {
    RangoCrossChainSupportedBlockchain,
    rangoCrossChainSupportedBlockchains
} from './constants/rango-cross-chain-supported-blockchain';
import { RangoCrossChainTrade } from './rango-cross-chain-trade';
import { RangoTradeSubtype } from './models/rango-providers';

export class RangoCrossChainTradeProvider extends CrossChainTradeProvider {
    public readonly type = CROSS_CHAIN_TRADE_TYPE.RANGO;

    public readonly rango = new RangoClient(RANGO_API_KEY);

    public meta: MetaResponse | null = null;

    private get walletAddress(): string {
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

    public isSupportedToken(token: PriceTokenAmount): boolean {
        if (this.meta) {
            if (token.address === NATIVE_TOKEN_ADDRESS) {
                return true;
            }

            return this.meta.tokens.some(
                item =>
                    item.address?.toLocaleLowerCase() === token.address.toLowerCase() &&
                    item.blockchain === token.blockchain
            );
        }
        return false;
    }

    public async fetchRangoMetadata(): Promise<void> {
        if (!this.meta) {
            this.meta = await this.rango.meta();
        }
    }

    private parseTradeTypes(route: QuoteSimulationResult): {
        subType: RangoTradeSubtype;
        itType: { from: TradeType | undefined; to: TradeType | undefined };
    } {
        const { path, swapper } = route;

        if (!path) {
            return {
                itType: { from: undefined, to: undefined },
                subType: swapper.id as RangoTradeSubtype
            };
        }

        const subType = path?.find(
            item => item.swapperType === 'BRIDGE' || item.swapperType === 'AGGREGATOR'
        )?.swapper?.id;

        const dexes = path
            .filter(item => item.swapperType === 'DEX')
            .map((item: QuotePath) => item.swapper.id);

        const itType = {
            from: dexes[0] ? rangoProviders[dexes[0]] : undefined,
            to: dexes[1] ? rangoProviders[dexes[1]] : undefined
        };

        return { itType, subType: subType as RangoTradeSubtype };
    }

    public async calculate(
        fromToken: PriceTokenAmount,
        toToken: PriceTokenAmount,
        options: RequiredCrossChainOptions
    ): Promise<Omit<WrappedCrossChainTrade, 'tradeType'> | null> {
        await this.fetchRangoMetadata();

        const fromBlockchain = fromToken.blockchain as RangoCrossChainSupportedBlockchain;
        const toBlockchain = toToken.blockchain as RangoCrossChainSupportedBlockchain;

        if (
            !this.isSupportedBlockchains(fromBlockchain, toBlockchain) ||
            !this.isSupportedToken(fromToken) ||
            !this.isSupportedToken(toToken)
        ) {
            return { trade: null };
        }

        await this.checkContractState(fromBlockchain);

        const request = this.getRequestParams(fromToken, toToken, options);

        try {
            const { route, resultType, tx } = await this.rango.swap(request);

            const feeInfo = await this.getFeeInfo(fromBlockchain, options.providerAddress);
            const networkFee = route?.fee.find(item => item.name === 'Network Fee');

            if ((resultType === 'INPUT_LIMIT_ISSUE' || resultType === 'NO_ROUTE') && route) {
                // if (error?.includes('Insufficient balance')) {
                //     return { trade: null, error: new InsufficientFundsError() };
                // }

                const { amountRestriction } = route;
                if (amountRestriction?.min && fromToken.weiAmount.lt(amountRestriction.min)) {
                    return {
                        trade: null,
                        error: new CrossChainMinAmountError(
                            Web3Pure.fromWei(amountRestriction.min, fromToken.decimals),
                            fromToken.symbol
                        )
                    };
                }

                if (amountRestriction?.max && fromToken.weiAmount.gt(amountRestriction.max)) {
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
                const { subType, itType } = this.parseTradeTypes(route as QuoteSimulationResult);
                const rangoTrade = new RangoCrossChainTrade(
                    {
                        from: fromToken,
                        to,
                        toTokenAmountMin: new BigNumber(route.outputAmount),
                        feeInfo: {
                            ...feeInfo,
                            cryptoFee: {
                                amount: Web3Pure.fromWei(
                                    networkFee?.amount as string,
                                    networkFee?.token.decimals
                                ),
                                tokenSymbol: networkFee?.token.symbol as string
                            }
                        },
                        priceImpact: 0,
                        itType,
                        subType,
                        slippageTolerance: options.slippageTolerance as number,
                        ...((tx as EvmTransaction)?.gasLimit
                            ? {
                                  gasData: {
                                      gasLimit: new BigNumber(
                                          parseInt((tx as EvmTransaction)?.gasLimit as string)
                                      ),
                                      gasPrice: new BigNumber(
                                          (tx as EvmTransaction)?.gasPrice as string
                                      )
                                  }
                              }
                            : { gasData: null })
                    },
                    this.rango,
                    options.providerAddress || EMPTY_ADDRESS
                );

                return { trade: rangoTrade };
            }

            return { trade: null };
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
                blockchain: fromToken.blockchain,
                symbol: fromToken.symbol,
                address: fromToken.isNative ? null : fromToken.address
            },
            to: {
                blockchain: toToken.blockchain,
                symbol: toToken.symbol,
                address: toToken.isNative ? null : toToken.address
            },
            amount: fromToken.weiAmount.toFixed(0),
            disableEstimate: false,
            slippage: (options.slippageTolerance * 100).toString(),
            fromAddress,
            toAddress,
            referrerAddress: null,
            referrerFee: null
        };
    }

    private async checkContractState(fromBlockchain: RangoCrossChainSupportedBlockchain) {
        const web3PublicService = Injector.web3PublicService.getWeb3Public(fromBlockchain);

        const isPaused = await web3PublicService.callContractMethod<number>(
            RANGO_CONTRACT_ADDRESSES[fromBlockchain].rubicRouter,
            commonCrossChainAbi,
            'paused'
        );

        if (isPaused) {
            throw new CrossChainIsUnavailableError();
        }
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
