import { CrossChainTradeProvider } from '@rsdk-features/cross-chain/providers/common/cross-chain-trade-provider';
import { CROSS_CHAIN_TRADE_TYPE } from 'src/features';
import { BlockchainName, BlockchainsInfo, PriceToken, Web3Pure } from 'src/core';
import { RequiredCrossChainOptions } from '@rsdk-features/cross-chain/models/cross-chain-options';

import {
    SymbiosisCrossChainSupportedBlockchain,
    symbiosisCrossChainSupportedBlockchains
} from '@rsdk-features/cross-chain/providers/symbiosis-trade-provider/constants/symbiosis-cross-chain-supported-blockchain';
import { CrossChainIsUnavailableError, RubicSdkError } from 'src/common';
import { Injector } from '@rsdk-core/sdk/injector';
import { SymbiosisCrossChainTrade } from '@rsdk-features/cross-chain/providers/symbiosis-trade-provider/symbiosis-cross-chain-trade';
import { PriceTokenAmount } from '@rsdk-core/blockchain/tokens/price-token-amount';
import { WrappedCrossChainTrade } from '@rsdk-features/cross-chain/providers/common/models/wrapped-cross-chain-trade';
import { DeBridgeCrossChainSupportedBlockchain } from 'src/features/cross-chain/providers/debridge-trade-provider/constants/debridge-cross-chain-supported-blockchain';
import { TransactionRequest } from 'src/features/cross-chain/providers/debridge-trade-provider/models/transaction-request';
import { TransactionResponse } from 'src/features/cross-chain/providers/debridge-trade-provider/models/transaction-response';
import { DebridgeCrossChainTrade } from 'src/features/cross-chain/providers/debridge-trade-provider/debridge-cross-chain-trade';
import { DE_BRIDGE_CONTRACT_ADDRESS } from 'src/features/cross-chain/providers/debridge-trade-provider/constants/contract-address';
import { DE_BRIDGE_CONTRACT_ABI } from 'src/features/cross-chain/providers/debridge-trade-provider/constants/contract-abi';
import { EMPTY_ADDRESS } from 'src/core/blockchain/constants/empty-address';

export class DebridgeCrossChainTradeProvider extends CrossChainTradeProvider {
    public static isSupportedBlockchain(
        blockchain: BlockchainName
    ): blockchain is SymbiosisCrossChainSupportedBlockchain {
        return symbiosisCrossChainSupportedBlockchains.some(
            supportedBlockchain => supportedBlockchain === blockchain
        );
    }

    private readonly apiEndpoint = 'https://deswap.debridge.finance/v1.0/transaction';

    public readonly type = CROSS_CHAIN_TRADE_TYPE.DEBRIDGE;

    protected get walletAddress(): string {
        return Injector.web3Private.address;
    }

    public async calculate(
        from: PriceTokenAmount,
        toToken: PriceToken,
        options: RequiredCrossChainOptions
    ): Promise<Omit<WrappedCrossChainTrade, 'tradeType'> | null> {
        const fromBlockchain = from.blockchain;
        const toBlockchain = toToken.blockchain;
        if (
            !DebridgeCrossChainTradeProvider.isSupportedBlockchain(fromBlockchain) ||
            !DebridgeCrossChainTradeProvider.isSupportedBlockchain(toBlockchain)
        ) {
            return null;
        }

        try {
            const fromAddress = options.fromAddress || this.walletAddress;
            if (!fromAddress) {
                throw new RubicSdkError(
                    'From address or wallet address must not be empty in Debridge'
                );
            }

            await this.checkContractState(fromBlockchain);

            const feePercent = await this.getFeePercent(fromBlockchain, options.providerAddress);
            const feeAmount = Web3Pure.toWei(
                from.tokenAmount.multipliedBy(feePercent).dividedBy(100),
                from.decimals,
                1
            );
            const tokenAmountIn = from.weiAmount.minus(feeAmount).toFixed(0);

            const slippageTolerance = options.slippageTolerance * 100;

            const requestParams: TransactionRequest = {
                srcChainId: BlockchainsInfo.getBlockchainByName(fromBlockchain).id,
                srcChainTokenIn: from.address,
                srcChainTokenInAmount: tokenAmountIn,
                slippage: slippageTolerance,
                dstChainId: BlockchainsInfo.getBlockchainByName(toBlockchain).id,
                dstChainTokenOut: toToken.address,
                dstChainTokenOutRecipient: fromAddress
            };

            const { tx, estimation } = await Injector.httpClient.get<TransactionResponse>(
                this.apiEndpoint,
                {
                    params: requestParams as unknown as {}
                }
            );

            const to = new PriceTokenAmount({
                ...toToken.asStruct,
                tokenAmount: Web3Pure.fromWei(
                    estimation.dstChainTokenOut.amount,
                    estimation.dstChainTokenOut.decimals
                )
            });

            const gasData =
                options.gasCalculation === 'enabled'
                    ? await SymbiosisCrossChainTrade.getGasData(from, to, tx)
                    : null;

            const transitToken = estimation.dstChainTokenIn;

            return {
                trade: new DebridgeCrossChainTrade(
                    {
                        from,
                        to,
                        transactionRequest: tx,
                        gasData,
                        // @TODO price impact
                        priceImpact: 0,
                        slippage: options.slippageTolerance,
                        fee: Web3Pure.fromWei(feeAmount),
                        feeSymbol: from.symbol,
                        feePercent,
                        networkFee: Web3Pure.fromWei(
                            estimation.executionFee.actualAmount,
                            estimation.executionFee.token.decimals
                        ),
                        networkFeeSymbol: estimation.executionFee.token.symbol,
                        transitAmount: Web3Pure.fromWei(
                            transitToken.minAmount,
                            transitToken.decimals
                        )
                    },
                    options.providerAddress
                )
            };
        } catch (err: unknown) {
            const rubicSdkError = CrossChainTradeProvider.parseError(err);

            // if (err instanceof SymbiosisError && err.message) {
            //     rubicSdkError = await this.checkMinMaxErrors(err, from);
            // }

            return {
                trade: null,
                error: rubicSdkError
            };
        }
    }

    private async getFeePercent(
        fromBlockchain: DeBridgeCrossChainSupportedBlockchain,
        providerAddress: string
    ): Promise<number> {
        const web3PublicService = Injector.web3PublicService.getWeb3Public(fromBlockchain);

        if (providerAddress !== EMPTY_ADDRESS) {
            return (
                (await web3PublicService.callContractMethod<number>(
                    DE_BRIDGE_CONTRACT_ADDRESS[fromBlockchain],
                    DE_BRIDGE_CONTRACT_ABI,
                    'availableIntegratorFee',
                    {
                        methodArguments: [providerAddress]
                    }
                )) / 10000
            );
        }

        return (
            (await web3PublicService.callContractMethod<number>(
                DE_BRIDGE_CONTRACT_ADDRESS[fromBlockchain],
                DE_BRIDGE_CONTRACT_ABI,
                'RubicPlatformFee'
            )) / 10000
        );
    }

    // private async checkMinMaxErrors(
    //     err: SymbiosisError,
    //     from: PriceTokenAmount
    // ): Promise<RubicSdkError> {
    //     if (err.code === ErrorCode.AMOUNT_TOO_LOW || err.code === ErrorCode.AMOUNT_LESS_THAN_FEE) {
    //         const index = err.message!.lastIndexOf('$');
    //         const transitTokenAmount = new BigNumber(err.message!.substring(index + 1));
    //         const minAmount = await this.getFromTokenAmount(from, transitTokenAmount, 'min');
    //
    //         return new CrossChainMinAmountError(minAmount, from);
    //     }
    //
    //     if (err?.code === ErrorCode.AMOUNT_TOO_HIGH) {
    //         const index = err.message!.lastIndexOf('$');
    //         const transitTokenAmount = new BigNumber(err.message!.substring(index + 1));
    //         const maxAmount = await this.getFromTokenAmount(from, transitTokenAmount, 'max');
    //
    //         return new CrossChainMaxAmountError(maxAmount, from);
    //     }
    //
    //     return new RubicSdkError(err.message);
    // }

    // private async getFromTokenAmount(
    //     from: PriceTokenAmount,
    //     transitTokenAmount: BigNumber,
    //     type: 'min' | 'max'
    // ): Promise<BigNumber> {
    //     const blockchain = from.blockchain as SymbiosisCrossChainSupportedBlockchain;
    //
    //     const transitToken = celerTransitTokens[blockchain];
    //     if (compareAddresses(from.address, transitToken.address)) {
    //         return transitTokenAmount;
    //     }
    //
    //     const amount = (
    //         await this.oneInchService[blockchain].calculate(
    //             new PriceTokenAmount({
    //                 ...transitToken,
    //                 price: new BigNumber(1),
    //                 tokenAmount: transitTokenAmount
    //             }),
    //             from,
    //             {
    //                 gasCalculation: 'disabled'
    //             }
    //         )
    //     ).to.tokenAmount;
    //     const approximatePercentDifference = 0.1;
    //
    //     if (type === 'min') {
    //         return amount.multipliedBy(1 + approximatePercentDifference);
    //     }
    //     return amount.multipliedBy(1 - approximatePercentDifference);
    // }

    private async checkContractState(fromBlockchain: DeBridgeCrossChainSupportedBlockchain) {
        const web3PublicService = Injector.web3PublicService.getWeb3Public(fromBlockchain);

        const isPaused = await web3PublicService.callContractMethod<number>(
            DE_BRIDGE_CONTRACT_ADDRESS[fromBlockchain],
            DE_BRIDGE_CONTRACT_ABI,
            'paused'
        );

        if (isPaused) {
            throw new CrossChainIsUnavailableError();
        }
    }
}
