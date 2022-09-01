import { CrossChainTradeProvider } from '@rsdk-features/cross-chain/providers/common/cross-chain-trade-provider';
import { CROSS_CHAIN_TRADE_TYPE, InstantTradeProvider } from 'src/features';
import { BLOCKCHAIN_NAME, BlockchainName, BlockchainsInfo, PriceToken, Web3Pure } from 'src/core';
import { RequiredCrossChainOptions } from '@rsdk-features/cross-chain/models/cross-chain-options';

import {
    SymbiosisCrossChainSupportedBlockchain,
    symbiosisCrossChainSupportedBlockchains
} from '@rsdk-features/cross-chain/providers/symbiosis-trade-provider/constants/symbiosis-cross-chain-supported-blockchain';
import { compareAddresses, RubicSdkError } from 'src/common';
import { Injector } from '@rsdk-core/sdk/injector';
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
import BigNumber from 'bignumber.js';
import { SymbiosisCrossChainTrade } from '@rsdk-features/cross-chain/providers/symbiosis-trade-provider/symbiosis-cross-chain-trade';
import { PriceTokenAmount } from '@rsdk-core/blockchain/tokens/price-token-amount';
import { SYMBIOSIS_CONTRACT_ADDRESS } from '@rsdk-features/cross-chain/providers/symbiosis-trade-provider/constants/contract-address';
import { OneinchEthereumProvider } from '@rsdk-features/instant-trades/dexes/ethereum/oneinch-ethereum/oneinch-ethereum-provider';
import { OneinchBscProvider } from '@rsdk-features/instant-trades/dexes/bsc/oneinch-bsc/oneinch-bsc-provider';
import { OneinchPolygonProvider } from '@rsdk-features/instant-trades/dexes/polygon/oneinch-polygon/oneinch-polygon-provider';
import { OneinchAvalancheProvider } from '@rsdk-features/instant-trades/dexes/avalanche/oneinch-avalanche/oneinch-avalanche-provider';
import { getSymbiosisConfig } from '@rsdk-features/cross-chain/providers/symbiosis-trade-provider/constants/symbiosis-config';
import { CrossChainMinAmountError } from '@rsdk-common/errors/cross-chain/cross-chain-min-amount.error';
import { CrossChainMaxAmountError } from '@rsdk-common/errors/cross-chain/cross-chain-max-amount.error';
import { WrappedCrossChainTrade } from '@rsdk-features/cross-chain/providers/common/models/wrapped-cross-chain-trade';
import { FeeInfo } from 'src/features/cross-chain/providers/common/models/fee';
import { nativeTokensList } from 'src/core/blockchain/constants/native-tokens';
import { commonCrossChainAbi } from 'src/features/cross-chain/providers/common/constants/common-cross-chain-abi';
import { OolongSwapProvider } from 'src/features/instant-trades/dexes/boba/oolong-swap/oolong-swap-provider';
import { symbiosisTransitTokens } from 'src/features/cross-chain/providers/symbiosis-trade-provider/constants/symbiosis-transit-tokens';
import { oneinchApiParams } from 'src/features/instant-trades/dexes/common/oneinch-common/constants';
import { ZappyProvider } from 'src/features/instant-trades/dexes/telos/zappy/trisolaris-aurora-provider';
import { TransactionRequest } from '@ethersproject/abstract-provider';

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

    protected get walletAddress(): string {
        return Injector.web3Private.address;
    }

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
        from: PriceTokenAmount,
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
                fromBlockchain,
                SYMBIOSIS_CONTRACT_ADDRESS[fromBlockchain].rubicRouter
            );

            const tokenIn = new SymbiosisToken({
                chainId: BlockchainsInfo.getBlockchainByName(fromBlockchain).id,
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
                      chainId: BlockchainsInfo.getBlockchainByName(toBlockchain).id,
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
                rubicSdkError = await this.checkMinMaxErrors(err, from, options.slippageTolerance);
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
        if (err.code === ErrorCode.AMOUNT_TOO_LOW || err.code === ErrorCode.AMOUNT_LESS_THAN_FEE) {
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
            fromBlockchain,
            providerAddress,
            SYMBIOSIS_CONTRACT_ADDRESS[fromBlockchain].rubicRouter,
            commonCrossChainAbi
        );

        const feePercent = await this.getFeePercent(
            fromBlockchain,
            providerAddress,
            SYMBIOSIS_CONTRACT_ADDRESS[fromBlockchain].rubicRouter,
            commonCrossChainAbi
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
                    ? BlockchainsInfo.getBlockchainByName(BLOCKCHAIN_NAME.POLYGON).id
                    : BlockchainsInfo.getBlockchainByName(BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN).id;
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
