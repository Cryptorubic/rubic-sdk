import {
    RangoCrossChainSupportedBlockchain,
    rangoCrossChainSupportedBlockchains
} from 'src/features/cross-chain/calculation-manager/providers/rango-provider/constants/rango-cross-chain-supported-blockchain';
import { BlockchainName, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { MaxAmountError, MinAmountError, UnsupportedReceiverAddressError } from 'src/common/errors';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee';
import { RequiredCrossChainOptions } from 'src/features/cross-chain/calculation-manager/models/cross-chain-options';
import { RANGO_API_KEY } from 'src/features/cross-chain/calculation-manager/providers/rango-provider/constants/rango-api-key';
import {
    EvmTransaction,
    MetaResponse,
    QuotePath,
    QuoteSimulationResult,
    RangoClient,
    SwapRequest
} from 'rango-sdk-basic/lib';
import { RangoCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/rango-provider/rango-cross-chain-trade';
import { evmCommonCrossChainAbi } from 'src/features/cross-chain/calculation-manager/providers/common/emv-cross-chain-trade/constants/evm-common-cross-chain-abi';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { nativeTokensList } from 'src/common/tokens/constants/native-tokens';
import { RANGO_BLOCKCHAIN_NAME } from 'src/features/cross-chain/calculation-manager/providers/rango-provider/constants/rango-blockchain-name';
import { RANGO_CONTRACT_ADDRESSES } from 'src/features/cross-chain/calculation-manager/providers/rango-provider/constants/contract-address';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { BridgeType } from 'src/features/cross-chain/calculation-manager/providers/common/models/bridge-type';
import { rangoProviders } from 'src/features/cross-chain/calculation-manager/providers/rango-provider/constants/rango-providers';
import { RANGO_TRADE_BRIDGE_TYPE } from 'src/features/cross-chain/calculation-manager/providers/rango-provider/models/rango-providers';
import { CROSS_CHAIN_TRADE_TYPE } from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { CrossChainProvider } from 'src/features/cross-chain/calculation-manager/providers/common/cross-chain-provider';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure';
import BigNumber from 'bignumber.js';
import { OnChainTradeType } from 'src/features/on-chain/calculation-manager/providers/models/on-chain-trade-type';
import { CalculationResult } from 'src/features/cross-chain/calculation-manager/providers/common/models/calculation-result';
import { getFromWithoutFee } from 'src/features/cross-chain/calculation-manager/utils/get-from-without-fee';
import { RangoBridgeTypes } from './models/rango-bridge-types';

export class RangoCrossChainProvider extends CrossChainProvider {
    public readonly type = CROSS_CHAIN_TRADE_TYPE.RANGO;

    public readonly rango = new RangoClient(RANGO_API_KEY);

    public meta: MetaResponse | null = null;

    public isSupportedBlockchain(
        blockchain: BlockchainName
    ): blockchain is RangoCrossChainSupportedBlockchain {
        return rangoCrossChainSupportedBlockchains.some(
            supportedBlockchain => supportedBlockchain === blockchain
        );
    }

    public async calculate(
        from: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>,
        options: RequiredCrossChainOptions
    ): Promise<CalculationResult> {
        if (options.receiverAddress) {
            throw new UnsupportedReceiverAddressError();
        }

        const fromBlockchain = from.blockchain as RangoCrossChainSupportedBlockchain;
        const toBlockchain = toToken.blockchain as RangoCrossChainSupportedBlockchain;
        if (!this.areSupportedBlockchains(fromBlockchain, toBlockchain)) {
            return null;
        }

        await this.checkContractState(
            fromBlockchain,
            RANGO_CONTRACT_ADDRESSES[fromBlockchain].rubicRouter,
            evmCommonCrossChainAbi
        );

        const price = await from.getAndUpdateTokenPrice();
        const amountUsdPrice = from.tokenAmount.multipliedBy(price);

        if (price && amountUsdPrice.lt(101)) {
            return {
                trade: null,
                error: new MinAmountError(new BigNumber(101).dividedBy(price), from.symbol)
            };
        }

        try {
            const feeInfo = await this.getFeeInfo(fromBlockchain, options.providerAddress);
            const fromWithoutFee = getFromWithoutFee(from, feeInfo);
            const request = await this.getRequestParams(fromWithoutFee, toToken, options);

            const { route, resultType, tx } = await this.rango.swap(request);

            const networkFee = route?.fee.find(item => item.name === 'Network Fee');

            if ((resultType === 'INPUT_LIMIT_ISSUE' || resultType === 'NO_ROUTE') && route) {
                const { amountRestriction } = route;
                if (amountRestriction?.min && from.weiAmount.lte(amountRestriction.min)) {
                    return {
                        trade: null,
                        error: new MinAmountError(
                            Web3Pure.fromWei(amountRestriction.min, from.decimals),
                            from.symbol
                        )
                    };
                }

                if (amountRestriction?.max && from.weiAmount.gte(amountRestriction.max)) {
                    return {
                        trade: null,
                        error: new MaxAmountError(
                            Web3Pure.fromWei(amountRestriction.max, from.decimals),
                            from.symbol
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
                        from.isNative ? from.stringWeiAmount : 0
                    )
                });

                const gasData =
                    options.gasCalculation === 'enabled'
                        ? await RangoCrossChainTrade.getGasData(from, to)
                        : null;

                const { bridgeType, itType } = this.parseTradeTypes(route as QuoteSimulationResult);

                const rangoTrade = new RangoCrossChainTrade(
                    {
                        from,
                        to,
                        toTokenAmountMin: Web3Pure.fromWei(route.outputAmount, toToken.decimals),
                        priceImpact: from.calculatePriceImpactPercent(to),
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
                        gasData,
                        allowedSwappers: request.swappers as RangoBridgeTypes[]
                    },
                    this.rango,
                    options.providerAddress
                );

                return { trade: rangoTrade };
            }

            return null;
        } catch (error: unknown) {
            const rubicSdkError = CrossChainProvider.parseError(error);
            return { trade: null, error: rubicSdkError };
        }
    }

    private async getRequestParams(
        from: PriceTokenAmount,
        toToken: PriceToken,
        options: RequiredCrossChainOptions
    ): Promise<SwapRequest> {
        const allowedSwappers = options.rangoDisabledBridgeTypes
            ? (await this.rango.meta()).swappers.filter(
                  swapper =>
                      !options.rangoDisabledBridgeTypes?.includes(swapper.id as RangoBridgeTypes)
              )
            : undefined;
        const fromAddress =
            this.getWalletAddress(from.blockchain as RangoCrossChainSupportedBlockchain) ||
            EvmWeb3Pure.EMPTY_ADDRESS;
        const toAddress = fromAddress;
        return {
            from: {
                blockchain:
                    RANGO_BLOCKCHAIN_NAME[from.blockchain as RangoCrossChainSupportedBlockchain],
                symbol: from.symbol,
                address: from.isNative ? null : from.address
            },
            to: {
                blockchain:
                    RANGO_BLOCKCHAIN_NAME[toToken.blockchain as RangoCrossChainSupportedBlockchain],
                symbol: toToken.symbol,
                address: toToken.isNative ? null : toToken.address
            },
            amount: from.weiAmount.toFixed(0),
            disableEstimate: true,
            slippage: (options.slippageTolerance * 100).toString(),
            fromAddress,
            toAddress,
            referrerAddress: null,
            referrerFee: null,
            ...(allowedSwappers && { swappers: allowedSwappers.map(swapper => swapper.id) })
        };
    }

    private parseTradeTypes(route: QuoteSimulationResult): {
        bridgeType: BridgeType | undefined;
        itType: { from: OnChainTradeType | undefined; to: OnChainTradeType | undefined };
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
                    evmCommonCrossChainAbi
                ),
                tokenSymbol: nativeTokensList[fromBlockchain].symbol
            },
            platformFee: {
                percent: await this.getFeePercent(
                    fromBlockchain,
                    providerAddress,
                    RANGO_CONTRACT_ADDRESSES[fromBlockchain as RangoCrossChainSupportedBlockchain]
                        .rubicRouter,
                    evmCommonCrossChainAbi
                ),
                tokenSymbol: 'USDC'
            },
            cryptoFee: null
        };
    }
}
