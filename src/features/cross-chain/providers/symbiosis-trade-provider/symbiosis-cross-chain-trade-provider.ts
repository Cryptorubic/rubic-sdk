import { SYMBIOSIS_CONTRACT_ADDRESS } from 'src/features/cross-chain/providers/symbiosis-trade-provider/constants/contract-address';
import { ZappyProvider } from 'src/features/instant-trades/dexes/telos/zappy/trisolaris-aurora-provider';
import {
    BLOCKCHAIN_NAME,
    BlockchainName,
    EvmBlockchainName
} from 'src/core/blockchain/models/blockchain-name';
import { OolongSwapProvider } from 'src/features/instant-trades/dexes/boba/oolong-swap/oolong-swap-provider';
import { WrappedCrossChainTrade } from 'src/features/cross-chain/providers/common/models/wrapped-cross-chain-trade';
import { OneinchEthereumProvider } from 'src/features/instant-trades/dexes/ethereum/oneinch-ethereum/oneinch-ethereum-provider';
import { OneinchBscProvider } from 'src/features/instant-trades/dexes/bsc/oneinch-bsc/oneinch-bsc-provider';
import {
    CrossChainMaxAmountError,
    RubicSdkError,
    CrossChainMinAmountError,
    TooLowAmountError
} from 'src/common/errors';
import { FeeInfo } from 'src/features/cross-chain/providers/common/models/fee';
import { OneinchPolygonProvider } from 'src/features/instant-trades/dexes/polygon/oneinch-polygon/oneinch-polygon-provider';
import { RequiredCrossChainOptions } from 'src/features/cross-chain/models/cross-chain-options';
import {
    SymbiosisCrossChainSupportedBlockchain,
    symbiosisCrossChainSupportedBlockchains
} from 'src/features/cross-chain/providers/symbiosis-trade-provider/constants/symbiosis-cross-chain-supported-blockchain';
import {
    ErrorCode,
    Symbiosis,
    Token as SymbiosisToken,
    TokenAmount as SymbiosisTokenAmount,
    Error as SymbiosisError,
    TokenAmount,
    Token,
    Percent
} from 'symbiosis-js-sdk';
import { symbiosisTransitTokens } from 'src/features/cross-chain/providers/symbiosis-trade-provider/constants/symbiosis-transit-tokens';
import { OneinchAvalancheProvider } from 'src/features/instant-trades/dexes/avalanche/oneinch-avalanche/oneinch-avalanche-provider';
import { evmCommonCrossChainAbi } from 'src/features/cross-chain/providers/common/emv-cross-chain-trade/constants/evm-common-cross-chain-abi';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { nativeTokensList } from 'src/common/tokens/constants/native-tokens';
import { SymbiosisCrossChainTrade } from 'src/features/cross-chain/providers/symbiosis-trade-provider/symbiosis-cross-chain-trade';
import { getSymbiosisConfig } from 'src/features/cross-chain/providers/symbiosis-trade-provider/constants/symbiosis-config';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { InstantTradeProvider } from 'src/features/instant-trades/instant-trade-provider';
import { oneinchApiParams } from 'src/features/instant-trades/dexes/common/oneinch-common/constants';
import { CROSS_CHAIN_TRADE_TYPE } from 'src/features/cross-chain/models/cross-chain-trade-type';
import { CrossChainTradeProvider } from 'src/features/cross-chain/providers/common/cross-chain-trade-provider';
import { compareAddresses } from 'src/common/utils/blockchain';
import BigNumber from 'bignumber.js';
import { TransactionRequest } from '@ethersproject/abstract-provider';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';

export class SymbiosisCrossChainTradeProvider extends CrossChainTradeProvider {
    public static isSupportedBlockchain(
        blockchain: BlockchainName
    ): blockchain is SymbiosisCrossChainSupportedBlockchain {
        return symbiosisCrossChainSupportedBlockchains.some(
            supportedBlockchain => supportedBlockchain === blockchain
        );
    }

    public readonly type = CROSS_CHAIN_TRADE_TYPE.SYMBIOSIS;

    private readonly symbiosis = new Symbiosis(getSymbiosisConfig(), 'rubic');

    private readonly onChainProviders: Record<
        SymbiosisCrossChainSupportedBlockchain,
        InstantTradeProvider
    > = {
        [BLOCKCHAIN_NAME.ETHEREUM]: new OneinchEthereumProvider(),
        [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: new OneinchBscProvider(),
        [BLOCKCHAIN_NAME.POLYGON]: new OneinchPolygonProvider(),
        [BLOCKCHAIN_NAME.AVALANCHE]: new OneinchAvalancheProvider(),
        [BLOCKCHAIN_NAME.BOBA]: new OolongSwapProvider(),
        [BLOCKCHAIN_NAME.TELOS]: new ZappyProvider(),
        // [BLOCKCHAIN_NAME.AURORA]: new OneinchAuroraProvider()
        [BLOCKCHAIN_NAME.BITCOIN]: new OneinchEthereumProvider()
    };

    public isSupportedBlockchains(
        fromBlockchain: BlockchainName,
        toBlockchain: BlockchainName
    ): boolean {
        if (fromBlockchain === BLOCKCHAIN_NAME.BITCOIN) {
            return false;
        }
        return (
            SymbiosisCrossChainTradeProvider.isSupportedBlockchain(fromBlockchain) &&
            SymbiosisCrossChainTradeProvider.isSupportedBlockchain(toBlockchain)
        );
    }

    public async calculate(
        from: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken,
        options: RequiredCrossChainOptions
    ): Promise<Omit<WrappedCrossChainTrade, 'tradeType'> | null> {
        const fromBlockchain = from.blockchain as SymbiosisCrossChainSupportedBlockchain;
        const toBlockchain = toToken.blockchain as SymbiosisCrossChainSupportedBlockchain;
        if (!this.isSupportedBlockchains(fromBlockchain, toBlockchain)) {
            return null;
        }
        const isBitcoinSwap = toBlockchain === BLOCKCHAIN_NAME.BITCOIN;

        try {
            const fromAddress =
                options.fromAddress || this.walletAddress || oneinchApiParams.nativeAddress;
            await this.checkContractState(
                fromBlockchain as EvmBlockchainName,
                SYMBIOSIS_CONTRACT_ADDRESS[fromBlockchain].rubicRouter
            );

            const tokenIn = new SymbiosisToken({
                chainId: blockchainId[fromBlockchain],
                address: from.isNative ? '' : from.address,
                decimals: from.decimals,
                isNative: from.isNative
            });

            const feeInfo = await this.getFeeInfo(fromBlockchain, options.providerAddress, from);

            const feeAmount = Web3Pure.toWei(
                from.tokenAmount.multipliedBy(feeInfo.platformFee!.percent).dividedBy(100),
                from.decimals,
                1
            );
            const tokenInWithFee = from.weiAmount.minus(feeAmount).toFixed(0);

            const tokenAmountIn = new SymbiosisTokenAmount(tokenIn, tokenInWithFee);

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
                          })
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
                            cryptoFee: {
                                amount: new BigNumber(transitTokenFee.toFixed()),
                                tokenSymbol: transitTokenFee.token.symbol || ''
                            }
                        },
                        transitAmount
                    },
                    options.providerAddress
                )
            };
        } catch (err: unknown) {
            let rubicSdkError = CrossChainTradeProvider.parseError(err);

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

            return new CrossChainMinAmountError(minAmountWithSlippage, from.symbol);
        }

        if (err?.code === ErrorCode.AMOUNT_TOO_HIGH) {
            const index = err.message!.lastIndexOf('$');
            const transitTokenAmount = new BigNumber(err.message!.substring(index + 1));
            const maxAmount = await this.getFromTokenAmount(from, transitTokenAmount, 'max');

            return new CrossChainMaxAmountError(maxAmount, from.symbol);
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
            fixedFee: {
                amount: fixedFeeAmount,
                tokenSymbol: nativeTokensList[fromBlockchain].symbol
            },
            platformFee: {
                percent: feePercent,
                tokenSymbol: percentFeeToken.symbol
            },
            cryptoFee: null
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
    ): Promise<{
        tokenAmountOut: SymbiosisTokenAmount;
        priceImpact: Percent;
        transitTokenFee: SymbiosisTokenAmount;
        transactionRequest: TransactionRequest;
    }> {
        let swapResult;

        if (toBlockchain !== BLOCKCHAIN_NAME.BITCOIN && swapParams.tokenOut) {
            const swapping = this.symbiosis.newSwapping();
            swapResult = await swapping.exactIn(
                swapParams.tokenAmountIn,
                swapParams.tokenOut,
                swapParams.fromAddress,
                swapParams.fromAddress,
                swapParams.fromAddress,
                swapParams.slippage,
                swapParams.deadline,
                true
            );
        } else {
            const zapping = this.symbiosis.newZappingRenBTC();
            const poolId =
                fromBlockchain === BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN
                    ? blockchainId[BLOCKCHAIN_NAME.POLYGON]
                    : blockchainId[BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN];
            try {
                swapResult = await zapping.exactIn(
                    swapParams.tokenAmountIn,
                    poolId,
                    swapParams.fromAddress,
                    swapParams.receiverAddress,
                    swapParams.fromAddress,
                    swapParams.slippage,
                    swapParams.deadline,
                    true
                );
            } catch (err) {
                if (
                    err.code === ErrorCode.AMOUNT_TOO_LOW ||
                    err.code === ErrorCode.AMOUNT_LESS_THAN_FEE
                ) {
                    throw err;
                }
                swapResult = await zapping.exactIn(
                    swapParams.tokenAmountIn,
                    poolId,
                    swapParams.fromAddress,
                    swapParams.receiverAddress,
                    swapParams.fromAddress,
                    swapParams.slippage,
                    swapParams.deadline,
                    true
                );
            }
        }

        return {
            tokenAmountOut: swapResult.tokenAmountOut,
            priceImpact: swapResult.priceImpact,
            transitTokenFee: swapResult.fee,
            transactionRequest: swapResult.transactionRequest
        };
    }
}
