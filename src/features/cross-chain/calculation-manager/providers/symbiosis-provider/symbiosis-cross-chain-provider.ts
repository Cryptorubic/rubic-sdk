import BigNumber from 'bignumber.js';
import {
    MaxAmountError,
    MinAmountError,
    RubicSdkError,
    TooLowAmountError
} from 'src/common/errors';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { nativeTokensList } from 'src/common/tokens/constants/native-tokens';
import { compareAddresses } from 'src/common/utils/blockchain';
import {
    BLOCKCHAIN_NAME,
    BlockchainName,
    EvmBlockchainName
} from 'src/core/blockchain/models/blockchain-name';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import { Web3PrivateSupportedBlockchain } from 'src/core/blockchain/web3-private-service/models/web-private-supported-blockchain';
import { RequiredCrossChainOptions } from 'src/features/cross-chain/calculation-manager/models/cross-chain-options';
import { CROSS_CHAIN_TRADE_TYPE } from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { rubicProxyContractAddress } from 'src/features/cross-chain/calculation-manager/providers/common/constants/rubic-proxy-contract-address';
import { CrossChainProvider } from 'src/features/cross-chain/calculation-manager/providers/common/cross-chain-provider';
import { evmCommonCrossChainAbi } from 'src/features/cross-chain/calculation-manager/providers/common/emv-cross-chain-trade/constants/evm-common-cross-chain-abi';
import { CalculationResult } from 'src/features/cross-chain/calculation-manager/providers/common/models/calculation-result';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import {
    SymbiosisCrossChainSupportedBlockchain,
    symbiosisCrossChainSupportedBlockchains
} from 'src/features/cross-chain/calculation-manager/providers/symbiosis-provider/constants/symbiosis-cross-chain-supported-blockchain';
import { symbiosisTransitTokens } from 'src/features/cross-chain/calculation-manager/providers/symbiosis-provider/constants/symbiosis-transit-tokens';
import { getSymbiosisV1Config } from 'src/features/cross-chain/calculation-manager/providers/symbiosis-provider/constants/symbiosis-v1-config';
import { getSymbiosisV2Config } from 'src/features/cross-chain/calculation-manager/providers/symbiosis-provider/constants/symbiosis-v2-config';
import { SwappingParams } from 'src/features/cross-chain/calculation-manager/providers/symbiosis-provider/models/swapping-params';
import { SymbiosisTradeData } from 'src/features/cross-chain/calculation-manager/providers/symbiosis-provider/models/symbiosis-trade-data';
import { ZappingParams } from 'src/features/cross-chain/calculation-manager/providers/symbiosis-provider/models/zapping-params';
import { SymbiosisCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/symbiosis-provider/symbiosis-cross-chain-trade';
import { OneinchAvalancheProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/avalanche/oneinch-avalanche/oneinch-avalanche-provider';
import { OolongSwapProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/boba/oolong-swap/oolong-swap-provider';
import { OneinchBscProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/bsc/oneinch-bsc/oneinch-bsc-provider';
import { OnChainProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/on-chain-provider/on-chain-provider';
import { oneinchApiParams } from 'src/features/on-chain/calculation-manager/providers/dexes/common/oneinch-abstract/constants';
import { OneinchEthereumProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/ethereum/oneinch-ethereum/oneinch-ethereum-provider';
import { OneinchPolygonProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/polygon/oneinch-polygon/oneinch-polygon-provider';
import { ZappyProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/telos/zappy/trisolaris-aurora-provider';
import { Symbiosis as SymbiosisV2 } from 'symbiosis-js-sdk';
import {
    Error as SymbiosisError,
    ErrorCode,
    Symbiosis as SymbiosisV1,
    Token as SymbiosisToken,
    TokenAmount as SymbiosisTokenAmount,
    TokenAmount
} from 'symbiosis-js-sdk-v1';

export class SymbiosisCrossChainProvider extends CrossChainProvider {
    public readonly type = CROSS_CHAIN_TRADE_TYPE.SYMBIOSIS;

    private readonly symbiosisV1 = new SymbiosisV1(getSymbiosisV1Config(), 'rubic');

    private readonly symbiosisV2 = new SymbiosisV2(getSymbiosisV2Config(), 'rubic');

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
            // await this.checkContractState(
            //     fromBlockchain as EvmBlockchainName,
            //     rubicProxyContractAddress[fromBlockchain],
            //     evmCommonCrossChainAbi
            // );

            const isBitcoinSwap = toBlockchain === BLOCKCHAIN_NAME.BITCOIN;

            const fromAddress =
                options.fromAddress ||
                this.getWalletAddress(fromBlockchain as Web3PrivateSupportedBlockchain) ||
                oneinchApiParams.nativeAddress;

            const tokenIn = new SymbiosisToken({
                chainId: blockchainId[fromBlockchain],
                address: from.isNative ? '' : from.address,
                decimals: from.decimals,
                isNative: from.isNative
            });

            // const feeInfo = await this.getFeeInfo(fromBlockchain, options.providerAddress, from);
            // const fromWithoutFee = getFromWithoutFee(
            //     from,
            //     feeInfo.rubicProxy?.platformFee?.percent
            // );
            const fromWithoutFee = from;
            const tokenAmountIn = new SymbiosisTokenAmount(tokenIn, fromWithoutFee.stringWeiAmount);

            const tokenOut = isBitcoinSwap
                ? null
                : new SymbiosisToken({
                      chainId: blockchainId[toBlockchain],
                      address: toToken.isNative ? '' : toToken.address,
                      decimals: toToken.decimals,
                      isNative: toToken.isNative
                  });

            const deadline = Math.floor(Date.now() / 1000) + 60 * options.deadline;
            const slippageTolerance = options.slippageTolerance * 10000;
            const bitcoinNullAddress = 'bc1qgkzct5j55x8vtf9vakdu6dzy3t8j8u93l043e9';
            const receiverAddress = isBitcoinSwap ? bitcoinNullAddress : fromAddress;

            const {
                tokenAmountOut,
                priceImpact,
                fee: transitTokenFee,
                version
            } = await this.getTrade(fromBlockchain, toBlockchain, {
                tokenAmountIn,
                tokenOut,
                fromAddress,
                receiverAddress,
                refundAddress: fromAddress,
                slippage: slippageTolerance,
                deadline
            });

            const swapFunction = (
                fromUserAddress: string,
                version: 'v1' | 'v2',
                receiver?: string
            ) => {
                if (isBitcoinSwap && !receiver) {
                    throw new RubicSdkError('No receiver address provider for bitcoin swap.');
                }
                const refundAddress = isBitcoinSwap ? fromUserAddress : receiver || fromAddress;
                const receiverAddress = isBitcoinSwap ? receiver! : receiver || fromUserAddress;

                return this.getTrade(
                    fromBlockchain,
                    toBlockchain,
                    {
                        tokenAmountIn,
                        tokenOut,
                        fromAddress: fromUserAddress,
                        receiverAddress,
                        refundAddress,
                        slippage: slippageTolerance,
                        deadline
                    },
                    version
                );
            };
            const to = new PriceTokenAmount({
                ...toToken.asStruct,
                tokenAmount: new BigNumber(tokenAmountOut.toFixed())
            });

            const gasData =
                options.gasCalculation === 'enabled'
                    ? await SymbiosisCrossChainTrade.getGasData(from, to)
                    : null;

            const transitToken = symbiosisTransitTokens[fromBlockchain];
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
                            provider: {
                                cryptoFee: {
                                    amount: new BigNumber(transitTokenFee.toFixed()),
                                    tokenSymbol: transitTokenFee.token.symbol || ''
                                }
                            }
                        },
                        transitAmount,
                        version
                    },
                    options.providerAddress
                )
            };
        } catch (err: unknown) {
            let rubicSdkError = CrossChainProvider.parseError(err);

            if ((err as { message: string })?.message?.includes('$')) {
                const symbiosisError = err as SymbiosisError;
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

    private async checkMinMaxErrors(
        err: SymbiosisError,
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

    protected override async getFeeInfo(
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
            tokenAmountIn: SymbiosisTokenAmount;
            tokenOut: SymbiosisToken | null;
            fromAddress: string;
            receiverAddress: string;
            refundAddress: string;
            slippage: number;
            deadline: number;
        },
        version?: 'v1' | 'v2'
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

            return this.getBestSwappingSwapResult(swappingParams, version);
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
            return await this.getBestZappingSwapResult(zappingParams, version);
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
        swappingParams: SwappingParams,
        version?: 'v1' | 'v2'
    ): Promise<SymbiosisTradeData> {
        const swappingV1 = this.symbiosisV1.newSwapping();
        const swappingV2 = this.symbiosisV2.newSwapping();

        if (version) {
            const swapping = version === 'v1' ? swappingV1 : swappingV2;
            return {
                ...(await swapping.exactIn(...swappingParams)),
                version
            };
        }

        const [swapResultV1, swapResultV2] = await Promise.allSettled([
            swappingV1.exactIn(...swappingParams),
            swappingV2.exactIn(...swappingParams)
        ]);
        return this.chooseBestFulfilledResult(swapResultV1, swapResultV2);
    }

    private async getBestZappingSwapResult(
        zappingParams: ZappingParams,
        version?: 'v1' | 'v2'
    ): Promise<SymbiosisTradeData> {
        const zappingV1 = this.symbiosisV1.newZappingRenBTC();
        const zappingV2 = this.symbiosisV2.newZappingRenBTC();

        if (version) {
            const zapping = version === 'v1' ? zappingV1 : zappingV2;
            return {
                ...(await zapping.exactIn(...zappingParams)),
                version
            };
        }

        const [swapResultV1, swapResultV2] = await Promise.allSettled([
            zappingV1.exactIn(...zappingParams),
            zappingV2.exactIn(...zappingParams)
        ]);
        return this.chooseBestFulfilledResult(swapResultV1, swapResultV2);
    }

    private chooseBestFulfilledResult<T extends { tokenAmountOut: TokenAmount }>(
        result1: PromiseSettledResult<T>,
        result2: PromiseSettledResult<T>
    ): (T & { version: 'v1' | 'v2' }) | never {
        if (result1.status !== 'fulfilled') {
            if (result2.status !== 'fulfilled') {
                if (
                    result1.reason.code === ErrorCode.AMOUNT_TOO_LOW ||
                    result1.reason.code === ErrorCode.AMOUNT_TOO_HIGH ||
                    result1.reason.code === ErrorCode.AMOUNT_LESS_THAN_FEE
                ) {
                    throw result1.reason;
                }
                throw result2.reason;
            }
            return { ...result2.value, version: 'v2' };
        }
        if (result2.status !== 'fulfilled') {
            return { ...result1.value, version: 'v1' };
        }
        return new BigNumber(result1.value.tokenAmountOut.toFixed()).gt(
            result2.value.tokenAmountOut.toFixed()
        )
            ? { ...result1.value, version: 'v1' }
            : { ...result2.value, version: 'v2' };
    }
}
