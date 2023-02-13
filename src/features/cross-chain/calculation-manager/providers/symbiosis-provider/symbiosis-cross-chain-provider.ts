import BigNumber from 'bignumber.js';
import {
    MaxAmountError,
    MinAmountError,
    RubicSdkError,
    TooLowAmountError
} from 'src/common/errors';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { nativeTokensList } from 'src/common/tokens/constants/native-tokens';
import { TokenStruct } from 'src/common/tokens/token';
import { compareAddresses } from 'src/common/utils/blockchain';
import {
    BLOCKCHAIN_NAME,
    BlockchainName,
    EvmBlockchainName
} from 'src/core/blockchain/models/blockchain-name';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import { Web3PrivateSupportedBlockchain } from 'src/core/blockchain/web3-private-service/models/web-private-supported-blockchain';
import { getFromWithoutFee } from 'src/features/common/utils/get-from-without-fee';
import { RequiredCrossChainOptions } from 'src/features/cross-chain/calculation-manager/models/cross-chain-options';
import { CROSS_CHAIN_TRADE_TYPE } from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { rubicProxyContractAddress } from 'src/features/cross-chain/calculation-manager/providers/common/constants/rubic-proxy-contract-address';
import { CrossChainProvider } from 'src/features/cross-chain/calculation-manager/providers/common/cross-chain-provider';
import { evmCommonCrossChainAbi } from 'src/features/cross-chain/calculation-manager/providers/common/emv-cross-chain-trade/constants/evm-common-cross-chain-abi';
import { CalculationResult } from 'src/features/cross-chain/calculation-manager/providers/common/models/calculation-result';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { MultichainProxyCrossChainSupportedBlockchain } from 'src/features/cross-chain/calculation-manager/providers/multichain-provider/dex-multichain-provider/models/supported-blockchain';
import {
    SymbiosisCrossChainSupportedBlockchain,
    symbiosisCrossChainSupportedBlockchains
} from 'src/features/cross-chain/calculation-manager/providers/symbiosis-provider/constants/symbiosis-cross-chain-supported-blockchain';
import { symbiosisTransitTokens } from 'src/features/cross-chain/calculation-manager/providers/symbiosis-provider/constants/symbiosis-transit-tokens';
import { getSymbiosisV2Config } from 'src/features/cross-chain/calculation-manager/providers/symbiosis-provider/constants/symbiosis-v2-config';
import { SwappingParams } from 'src/features/cross-chain/calculation-manager/providers/symbiosis-provider/models/swapping-params';
import { SymbiosisTradeData } from 'src/features/cross-chain/calculation-manager/providers/symbiosis-provider/models/symbiosis-trade-data';
import { ZappingParams } from 'src/features/cross-chain/calculation-manager/providers/symbiosis-provider/models/zapping-params';
import { SymbiosisCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/symbiosis-provider/symbiosis-cross-chain-trade';
import { typedTradeProviders } from 'src/features/on-chain/calculation-manager/constants/trade-providers/typed-trade-providers';
import { ON_CHAIN_TRADE_TYPE } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { EvmOnChainTrade } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/evm-on-chain-trade';
import { OneinchAvalancheProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/avalanche/oneinch-avalanche/oneinch-avalanche-provider';
import { OolongSwapProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/boba/oolong-swap/oolong-swap-provider';
import { OneinchBscProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/bsc/oneinch-bsc/oneinch-bsc-provider';
import { OnChainProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/on-chain-provider/on-chain-provider';
import { oneinchApiParams } from 'src/features/on-chain/calculation-manager/providers/dexes/common/oneinch-abstract/constants';
import { OneinchEthereumProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/ethereum/oneinch-ethereum/oneinch-ethereum-provider';
import { OneinchPolygonProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/polygon/oneinch-polygon/oneinch-polygon-provider';
import { ZappyProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/telos/zappy/trisolaris-aurora-provider';
import { Error, ErrorCode, Symbiosis, Token, TokenAmount } from 'symbiosis-js-sdk';

export class SymbiosisCrossChainProvider extends CrossChainProvider {
    public readonly type = CROSS_CHAIN_TRADE_TYPE.SYMBIOSIS;

    private readonly symbiosis = new Symbiosis(getSymbiosisV2Config(), 'rubic');

    private readonly onChainProviders: Partial<
        Record<SymbiosisCrossChainSupportedBlockchain, OnChainProvider>
    > = {
        [BLOCKCHAIN_NAME.ETHEREUM]: new OneinchEthereumProvider(),
        [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: new OneinchBscProvider(),
        [BLOCKCHAIN_NAME.POLYGON]: new OneinchPolygonProvider(),
        [BLOCKCHAIN_NAME.AVALANCHE]: new OneinchAvalancheProvider(),
        [BLOCKCHAIN_NAME.BOBA]: new OolongSwapProvider(),
        [BLOCKCHAIN_NAME.TELOS]: new ZappyProvider(),
        [BLOCKCHAIN_NAME.BITCOIN]: new OneinchEthereumProvider()
    };

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
        if (fromBlockchain === BLOCKCHAIN_NAME.AVALANCHE) {
            return toBlockchain === BLOCKCHAIN_NAME.BOBA_AVALANCHE ||
                toBlockchain === BLOCKCHAIN_NAME.BOBA_BSC ||
                toBlockchain === BLOCKCHAIN_NAME.BOBA
                ? false
                : super.areSupportedBlockchains(fromBlockchain, toBlockchain);
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
        if (!this.areSupportedBlockchains(fromBlockchain, toBlockchain)) {
            return null;
        }

        try {
            const isBitcoinSwap = toBlockchain === BLOCKCHAIN_NAME.BITCOIN;

            const fromAddress =
                options.fromAddress ||
                this.getWalletAddress(fromBlockchain as Web3PrivateSupportedBlockchain) ||
                oneinchApiParams.nativeAddress;

            const tokenIn = new Token({
                chainId: blockchainId[fromBlockchain],
                address: from.isNative ? '' : from.address,
                decimals: from.decimals,
                isNative: from.isNative
            });

            const feeInfo = await this.getFeeInfo(fromBlockchain, options.providerAddress, from);
            const fromWithoutFee = getFromWithoutFee(
                from,
                feeInfo.rubicProxy?.platformFee?.percent
            );

            const transitToken = symbiosisTransitTokens[fromBlockchain];

            const onChainTrade = (await this.getOnChainTrade(
                fromWithoutFee,
                transitToken,
                [],
                (options.slippageTolerance - 0.005) / 2
            ))!;

            const receiverAddress = options.receiverAddress || fromAddress;

            const tokenAmountIn = new TokenAmount(tokenIn, from.stringWeiAmount);

            const tokenOut = isBitcoinSwap
                ? null
                : new Token({
                      chainId: blockchainId[toBlockchain],
                      address: toToken.isNative ? '' : toToken.address,
                      decimals: toToken.decimals,
                      isNative: toToken.isNative
                  });

            const deadline = Math.floor(Date.now() / 1000) + 60 * options.deadline;
            const slippageTolerance = options.slippageTolerance * 10000;
            // const bitcoinNullAddress = 'bc1qgkzct5j55x8vtf9vakdu6dzy3t8j8u93l043e9';
            // const receiverAddress = isBitcoinSwap ? bitcoinNullAddress : fromAddress;

            const {
                tokenAmountOut,
                priceImpact,
                fee: transitTokenFee
            } = await this.getTrade(fromBlockchain, toBlockchain, {
                tokenAmountIn,
                tokenOut,
                fromAddress,
                receiverAddress,
                refundAddress: fromAddress,
                slippage: slippageTolerance,
                deadline
            });

            const swapFunction = (fromUserAddress: string, receiver?: string) => {
                if (isBitcoinSwap && !receiver) {
                    throw new RubicSdkError('No receiver address provider for bitcoin swap.');
                }
                const refundAddress = isBitcoinSwap ? fromUserAddress : receiver || fromAddress;
                const receiverAddress = isBitcoinSwap ? receiver! : receiver || fromUserAddress;

                return this.getTrade(fromBlockchain, toBlockchain, {
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
                tokenAmount: new BigNumber(tokenAmountOut.toFixed())
            });

            const gasData =
                options.gasCalculation === 'enabled'
                    ? await SymbiosisCrossChainTrade.getGasData(from, to)
                    : null;

            let transitAmount: BigNumber;
            if (compareAddresses(from.address, transitToken.address)) {
                transitAmount = from.tokenAmount;
            } else if (this.onChainProviders[fromBlockchain]) {
                transitAmount = (
                    await this.onChainProviders[fromBlockchain]!.calculate(
                        from,
                        new PriceTokenAmount({
                            ...transitToken,
                            price: new BigNumber(1),
                            tokenAmount: new BigNumber(1)
                        }),
                        {
                            gasCalculation: 'disabled'
                        }
                    )
                ).to.tokenAmount;
            } else {
                transitAmount = from.tokenAmount;
            }

            return {
                trade: new SymbiosisCrossChainTrade(
                    {
                        from,
                        to,
                        swapFunction,
                        gasData,
                        priceImpact: parseFloat(priceImpact.toFixed()),
                        slippage: options.slippageTolerance,
                        feeInfo: {
                            ...feeInfo,
                            provider: {
                                cryptoFee: {
                                    amount: new BigNumber(transitTokenFee.toFixed()),
                                    tokenSymbol: transitTokenFee.token.symbol || ''
                                }
                            }
                        },
                        transitAmount,
                        onChainTrade,
                        transitToken
                    },
                    options.providerAddress
                )
            };
        } catch (err: unknown) {
            let rubicSdkError = CrossChainProvider.parseError(err);

            if ((err as { message: string })?.message?.includes('$')) {
                const symbiosisError = err as Error;
                rubicSdkError =
                    symbiosisError.code === ErrorCode.AMOUNT_LESS_THAN_FEE
                        ? new TooLowAmountError()
                        : await this.checkMinMaxErrors(
                              symbiosisError,
                              from as PriceTokenAmount<SymbiosisCrossChainSupportedBlockchain>,
                              options.slippageTolerance
                          );
            }

            return {
                trade: null,
                error: rubicSdkError
            };
        }
    }

    private async getOnChainTrade(
        from: PriceTokenAmount,
        transitToken: TokenStruct<BlockchainName>,
        _availableDexes: string[],
        slippageTolerance: number
    ): Promise<EvmOnChainTrade | null> {
        const fromBlockchain = from.blockchain as MultichainProxyCrossChainSupportedBlockchain;
        if (compareAddresses(from.address, transitToken.address)) {
            return null;
        }

        const dexes = Object.values(typedTradeProviders[fromBlockchain]).filter(
            el => el.type === ON_CHAIN_TRADE_TYPE.QUICK_SWAP
        );
        //     .filter(
        //     dex => dex.supportReceiverAddress
        // );
        const to = await PriceToken.createToken(transitToken);
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
            // .filter(onChainTrade =>
            //     availableDexes.some(availableDex =>
            //         compareAddresses(availableDex, onChainTrade.dexContractAddress)
            //     )
            // )
            .sort((a, b) => b.to.tokenAmount.comparedTo(a.to.tokenAmount));

        if (!onChainTrades.length) {
            return null;
        }
        return onChainTrades[0]!;
    }

    private async checkMinMaxErrors(
        err: Error,
        from: PriceTokenAmount<SymbiosisCrossChainSupportedBlockchain>,
        slippage: number
    ): Promise<RubicSdkError> {
        if (err.code === ErrorCode.AMOUNT_TOO_LOW) {
            const index = err.message!.lastIndexOf('$');
            const transitTokenAmount = new BigNumber(err.message!.substring(index + 1));
            if (this.onChainProviders[from.blockchain]) {
                const minAmount = await this.getFromTokenAmount(from, transitTokenAmount, 'min');
                const minAmountWithSlippage = minAmount.dividedBy(1 - slippage);

                return new MinAmountError(minAmountWithSlippage, from.symbol);
            }
            return new MinAmountError(transitTokenAmount, 'USDC');
        }

        if (err?.code === ErrorCode.AMOUNT_TOO_HIGH) {
            const index = err.message!.lastIndexOf('$');
            const transitTokenAmount = new BigNumber(err.message!.substring(index + 1));
            if (this.onChainProviders[from.blockchain]) {
                const maxAmount = await this.getFromTokenAmount(from, transitTokenAmount, 'max');

                return new MaxAmountError(maxAmount, from.symbol);
            }
            return new MaxAmountError(transitTokenAmount, 'USDC');
        }

        return new RubicSdkError(err.message);
    }

    private async getFromTokenAmount(
        from: PriceTokenAmount,
        transitTokenAmount: BigNumber,
        type: 'min' | 'max'
    ): Promise<BigNumber> {
        const blockchain = from.blockchain as SymbiosisCrossChainSupportedBlockchain;

        const transitToken = symbiosisTransitTokens[blockchain];
        if (compareAddresses(from.address, transitToken.address)) {
            return transitTokenAmount;
        }

        const amount = (
            await this.onChainProviders[blockchain]!.calculate(
                new PriceTokenAmount({
                    ...transitToken,
                    price: new BigNumber(1),
                    tokenAmount: transitTokenAmount
                }),
                from,
                {
                    gasCalculation: 'disabled'
                }
            )
        ).to.tokenAmount;
        const approximatePercentDifference = 0.1;

        if (type === 'min') {
            return amount.multipliedBy(1 + approximatePercentDifference);
        }
        return amount.multipliedBy(1 - approximatePercentDifference);
    }

    protected async getFeeInfo(
        fromBlockchain: SymbiosisCrossChainSupportedBlockchain,
        providerAddress: string,
        percentFeeToken: PriceTokenAmount
    ): Promise<FeeInfo> {
        const fixedFeeAmount = await this.getFixedFee(
            fromBlockchain as EvmBlockchainName,
            providerAddress,
            rubicProxyContractAddress[fromBlockchain],
            evmCommonCrossChainAbi
        );

        const feePercent = await this.getFeePercent(
            fromBlockchain as EvmBlockchainName,
            providerAddress,
            rubicProxyContractAddress[fromBlockchain],
            evmCommonCrossChainAbi
        );

        return {
            rubicProxy: {
                fixedFee: {
                    amount: fixedFeeAmount,
                    tokenSymbol: nativeTokensList[fromBlockchain].symbol
                },
                platformFee: {
                    percent: feePercent,
                    tokenSymbol: percentFeeToken.symbol
                }
            }
        };
    }

    private async getTrade(
        fromBlockchain: BlockchainName,
        toBlockchain: BlockchainName,
        swapParams: {
            tokenAmountIn: TokenAmount;
            tokenOut: Token | null;
            fromAddress: string;
            receiverAddress: string;
            refundAddress: string;
            slippage: number;
            deadline: number;
        }
    ): Promise<SymbiosisTradeData> {
        if (toBlockchain !== BLOCKCHAIN_NAME.BITCOIN && swapParams.tokenOut) {
            const swappingParams: SwappingParams = [
                swapParams.tokenAmountIn,
                swapParams.tokenOut,
                swapParams.fromAddress,
                swapParams.receiverAddress || swapParams.fromAddress,
                swapParams.fromAddress,
                swapParams.slippage,
                swapParams.deadline,
                true
            ];

            return this.getBestSwappingSwapResult(swappingParams);
        }

        const poolId =
            fromBlockchain === BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN
                ? blockchainId[BLOCKCHAIN_NAME.POLYGON]
                : blockchainId[BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN];
        const zappingParams: ZappingParams = [
            swapParams.tokenAmountIn,
            poolId,
            swapParams.fromAddress,
            swapParams.receiverAddress,
            swapParams.fromAddress,
            swapParams.slippage,
            swapParams.deadline,
            true
        ];

        try {
            return await this.getBestZappingSwapResult(zappingParams);
        } catch (err) {
            if (
                err.code === ErrorCode.AMOUNT_TOO_LOW ||
                err.code === ErrorCode.AMOUNT_LESS_THAN_FEE
            ) {
                throw err;
            }

            return this.getBestZappingSwapResult(zappingParams);
        }
    }

    private async getBestSwappingSwapResult(
        swappingParams: SwappingParams
    ): Promise<SymbiosisTradeData> {
        const swapping = this.symbiosis.newSwapping();
        return swapping.exactIn(...swappingParams);
    }

    private async getBestZappingSwapResult(
        zappingParams: ZappingParams
    ): Promise<SymbiosisTradeData> {
        const zapping = this.symbiosis.newZappingRenBTC();
        return zapping.exactIn(...zappingParams);
    }
}
