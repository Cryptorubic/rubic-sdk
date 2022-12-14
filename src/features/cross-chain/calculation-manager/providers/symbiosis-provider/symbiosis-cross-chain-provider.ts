import { TransactionRequest } from '@ethersproject/abstract-provider';
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
import { getFromWithoutFee } from 'src/features/common/utils/get-from-without-fee';
import { RequiredCrossChainOptions } from 'src/features/cross-chain/calculation-manager/models/cross-chain-options';
import { CROSS_CHAIN_TRADE_TYPE } from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { CrossChainProvider } from 'src/features/cross-chain/calculation-manager/providers/common/cross-chain-provider';
import { evmCommonCrossChainAbi } from 'src/features/cross-chain/calculation-manager/providers/common/emv-cross-chain-trade/constants/evm-common-cross-chain-abi';
import { CalculationResult } from 'src/features/cross-chain/calculation-manager/providers/common/models/calculation-result';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { SYMBIOSIS_CONTRACT_ADDRESS } from 'src/features/cross-chain/calculation-manager/providers/symbiosis-provider/constants/contract-address';
import {
    SymbiosisCrossChainSupportedBlockchain,
    symbiosisCrossChainSupportedBlockchains
} from 'src/features/cross-chain/calculation-manager/providers/symbiosis-provider/constants/symbiosis-cross-chain-supported-blockchain';
import { symbiosisTransitTokens } from 'src/features/cross-chain/calculation-manager/providers/symbiosis-provider/constants/symbiosis-transit-tokens';
import { getSymbiosisV1Config } from 'src/features/cross-chain/calculation-manager/providers/symbiosis-provider/constants/symbiosis-v1-config';
import { SwappingParams } from 'src/features/cross-chain/calculation-manager/providers/symbiosis-provider/models/swapping-params';
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
import { Symbiosis as SymbiosisV2, ZappingRenBTCExactIn } from 'symbiosis-js-sdk';
import {
    Error as SymbiosisError,
    ErrorCode,
    Percent,
    Symbiosis as SymbiosisV1,
    Token as SymbiosisToken,
    TokenAmount as SymbiosisTokenAmount,
    TokenAmount
} from 'symbiosis-js-sdk-v1';
import { SwapExactIn } from 'symbiosis-js-sdk-v1/dist/crosschain/baseSwapping';

export class SymbiosisCrossChainProvider extends CrossChainProvider {
    public readonly type = CROSS_CHAIN_TRADE_TYPE.SYMBIOSIS;

    private readonly symbiosisV1 = new SymbiosisV1(getSymbiosisV1Config(), 'rubic');

    private readonly symbiosisV2 = new SymbiosisV2('mainnet', 'rubic');

    private readonly onChainProviders: Record<
        SymbiosisCrossChainSupportedBlockchain,
        OnChainProvider
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
            await this.checkContractState(
                fromBlockchain as EvmBlockchainName,
                SYMBIOSIS_CONTRACT_ADDRESS[fromBlockchain].rubicRouter,
                evmCommonCrossChainAbi
            );

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

            const feeInfo = await this.getFeeInfo(fromBlockchain, options.providerAddress, from);
            const fromWithoutFee = getFromWithoutFee(
                from,
                feeInfo.rubicProxy?.platformFee?.percent
            );
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

            const { tokenAmountOut, priceImpact, transitTokenFee } = await this.getTrade(
                fromBlockchain,
                toBlockchain,
                {
                    tokenAmountIn,
                    tokenOut,
                    fromAddress,
                    receiverAddress,
                    refundAddress: fromAddress,
                    slippage: slippageTolerance,
                    deadline
                }
            );

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

            const transitToken = symbiosisTransitTokens[fromBlockchain];
            const transitAmount = compareAddresses(from.address, transitToken.address)
                ? from.tokenAmount
                : (
                      await this.onChainProviders[fromBlockchain].calculate(
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
                        transitAmount
                    },
                    options.providerAddress
                )
            };
        } catch (err: unknown) {
            let rubicSdkError = CrossChainProvider.parseError(err);

            if (err instanceof SymbiosisError && err.message) {
                rubicSdkError =
                    err.code === ErrorCode.AMOUNT_LESS_THAN_FEE
                        ? new TooLowAmountError()
                        : await this.checkMinMaxErrors(err, from, options.slippageTolerance);
            }

            return {
                trade: null,
                error: rubicSdkError
            };
        }
    }

    private async checkMinMaxErrors(
        err: SymbiosisError,
        from: PriceTokenAmount,
        slippage: number
    ): Promise<RubicSdkError> {
        if (err.code === ErrorCode.AMOUNT_TOO_LOW) {
            const index = err.message!.lastIndexOf('$');
            const transitTokenAmount = new BigNumber(err.message!.substring(index + 1));
            const minAmount = await this.getFromTokenAmount(from, transitTokenAmount, 'min');
            const minAmountWithSlippage = minAmount.dividedBy(1 - slippage);

            return new MinAmountError(minAmountWithSlippage, from.symbol);
        }

        if (err?.code === ErrorCode.AMOUNT_TOO_HIGH) {
            const index = err.message!.lastIndexOf('$');
            const transitTokenAmount = new BigNumber(err.message!.substring(index + 1));
            const maxAmount = await this.getFromTokenAmount(from, transitTokenAmount, 'max');

            return new MaxAmountError(maxAmount, from.symbol);
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
            await this.onChainProviders[blockchain].calculate(
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
            SYMBIOSIS_CONTRACT_ADDRESS[fromBlockchain].rubicRouter,
            evmCommonCrossChainAbi
        );

        const feePercent = await this.getFeePercent(
            fromBlockchain as EvmBlockchainName,
            providerAddress,
            SYMBIOSIS_CONTRACT_ADDRESS[fromBlockchain].rubicRouter,
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
        }
    ): Promise<{
        tokenAmountOut: SymbiosisTokenAmount;
        priceImpact: Percent;
        transitTokenFee: SymbiosisTokenAmount;
        transactionRequest: TransactionRequest;
    }> {
        let swapResult;

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

            swapResult = await this.getBestSwappingSwapResult(swappingParams);
        } else {
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
                swapResult = await this.getBestZappingSwapResult(zappingParams);
            } catch (err) {
                if (
                    err.code === ErrorCode.AMOUNT_TOO_LOW ||
                    err.code === ErrorCode.AMOUNT_LESS_THAN_FEE
                ) {
                    throw err;
                }

                swapResult = await this.getBestZappingSwapResult(zappingParams);
            }
        }

        return {
            tokenAmountOut: swapResult.tokenAmountOut,
            priceImpact: swapResult.priceImpact,
            transitTokenFee: swapResult.fee,
            transactionRequest: swapResult.transactionRequest
        };
    }

    private async getBestSwappingSwapResult(swappingParams: SwappingParams): Promise<SwapExactIn> {
        const swappingV1 = this.symbiosisV1.newSwapping();
        const swappingV2 = this.symbiosisV2.newSwapping();

        const [swapResultV1, swapResultV2] = await Promise.allSettled([
            swappingV1.exactIn(...swappingParams),
            swappingV2.exactIn(...swappingParams)
        ]);
        return this.chooseBestFulfilledResult(swapResultV1, swapResultV2);
    }

    private async getBestZappingSwapResult(
        zappingParams: ZappingParams
    ): Promise<ZappingRenBTCExactIn> {
        const zappingV1 = this.symbiosisV1.newZappingRenBTC();
        const zappingV2 = this.symbiosisV2.newZappingRenBTC();

        const [swapResultV1, swapResultV2] = await Promise.allSettled([
            zappingV1.exactIn(...zappingParams),
            zappingV2.exactIn(...zappingParams)
        ]);
        return this.chooseBestFulfilledResult(swapResultV1, swapResultV2);
    }

    private chooseBestFulfilledResult<T extends { tokenAmountOut: TokenAmount }>(
        result1: PromiseSettledResult<T>,
        result2: PromiseSettledResult<T>
    ): T | never {
        if (result1.status !== 'fulfilled') {
            if (result2.status !== 'fulfilled') {
                throw result1.reason;
            }
            return result2.value;
        }
        if (result2.status !== 'fulfilled') {
            return result1.value;
        }
        return result1.value.tokenAmountOut > result2.value.tokenAmountOut
            ? result1.value
            : result2.value;
    }
}
