import { BlockchainName, Token, Web3Pure } from 'src/core';
import { CrossChainContractData } from '@rsdk-features/cross-chain/providers/common/celer-rubic/cross-chain-contract-data';
import { CrossChainContractTrade } from '@rsdk-features/cross-chain/providers/common/celer-rubic/cross-chain-contract-trade';
import {
    compareAddresses,
    CrossChainIsUnavailableError,
    InsufficientLiquidityError
} from 'src/common';
import { RubicItCrossChainContractTrade } from '@rsdk-features/cross-chain/providers/rubic-trade-provider/rubic-cross-chain-contract-trade/rubic-it-cross-chain-contract-trade/rubic-it-cross-chain-contract-trade';
import BigNumber from 'bignumber.js';
import { CrossChainSupportedInstantTradeProvider } from '@rsdk-features/cross-chain/providers/common/celer-rubic/models/cross-chain-supported-instant-trade';
import { PriceTokenAmount } from '@rsdk-core/blockchain/tokens/price-token-amount';
import { MinMaxAmountsErrors } from '@rsdk-features/cross-chain/models/min-max-amounts-errors';
import { MinMaxAmounts } from '@rsdk-features/cross-chain/models/min-max-amounts';
import { PriceToken } from '@rsdk-core/blockchain/tokens/price-token';
import { ItCalculatedTrade } from '@rsdk-features/cross-chain/providers/common/celer-rubic/models/it-calculated-trade';
import { CrossChainTradeProvider } from '@rsdk-features/cross-chain/providers/common/cross-chain-trade-provider';

export abstract class CelerRubicCrossChainTradeProvider extends CrossChainTradeProvider {
    protected abstract contracts(blockchain: BlockchainName): CrossChainContractData;

    protected async getItCalculatedTrade(
        contract: CrossChainContractData,
        providerIndex: number,
        from: PriceTokenAmount,
        toToken: PriceToken,
        slippageTolerance: number
    ): Promise<ItCalculatedTrade> {
        const provider = contract.getProvider(providerIndex);
        const instantTrade = await provider.calculate(from, toToken, {
            gasCalculation: 'disabled',
            slippageTolerance
        });
        return {
            toAmount: instantTrade.to.tokenAmount,
            providerIndex,
            instantTrade
        };
    }

    protected async getToTransitTokenAmount(
        toBlockchain: BlockchainName,
        transitToken: PriceTokenAmount,
        transitTokenMinAmount: BigNumber,
        contract: CrossChainContractData
    ): Promise<{
        toTransitTokenAmount: BigNumber;
        transitFeeToken: PriceTokenAmount;
        feeInPercents: number;
    }> {
        const feeInPercents = await this.contracts(toBlockchain).getFeeInPercents(contract);
        const transitFeeToken = new PriceTokenAmount({
            ...transitToken.asStruct,
            tokenAmount: transitTokenMinAmount.multipliedBy(feeInPercents).dividedBy(100)
        });

        const toTransitTokenAmount = transitTokenMinAmount.minus(transitFeeToken.tokenAmount);

        return {
            toTransitTokenAmount,
            transitFeeToken,
            feeInPercents
        };
    }

    protected async checkMinMaxAmountsErrors(
        fromTrade: CrossChainContractTrade
    ): Promise<MinMaxAmountsErrors> {
        const slippageTolerance =
            fromTrade instanceof RubicItCrossChainContractTrade ? fromTrade.slippage : undefined;
        const { minAmount: minTransitTokenAmount, maxAmount: maxTransitTokenAmount } =
            await this.getMinMaxTransitTokenAmounts(
                fromTrade.blockchain,
                slippageTolerance,
                fromTrade.fromToken
            );
        const fromTransitTokenAmount = fromTrade.toToken.tokenAmount;

        if (fromTransitTokenAmount.lt(minTransitTokenAmount)) {
            const minAmount = await this.getTokenAmountForExactTransitTokenAmount(
                fromTrade,
                minTransitTokenAmount
            );
            if (!minAmount?.isFinite()) {
                throw new InsufficientLiquidityError();
            }
            return {
                minAmount
            };
        }

        if (fromTransitTokenAmount.gt(maxTransitTokenAmount)) {
            const maxAmount = await this.getTokenAmountForExactTransitTokenAmount(
                fromTrade,
                maxTransitTokenAmount
            );
            return {
                maxAmount
            };
        }

        return {};
    }

    protected async getMinMaxTransitTokenAmounts(
        fromBlockchain: BlockchainName,
        slippageTolerance?: number,
        fromToken?: PriceToken
    ): Promise<MinMaxAmounts> {
        const fromContract = this.contracts(fromBlockchain);
        const fromTransitToken = await fromContract.getTransitToken(fromToken);

        const getAmount = async (type: 'min' | 'max'): Promise<BigNumber> => {
            const fromTransitTokenAmountAbsolute = await fromContract.getMinOrMaxTransitTokenAmount(
                type,
                fromTransitToken.address
            );
            const fromTransitTokenAmount = Web3Pure.fromWei(
                fromTransitTokenAmountAbsolute,
                fromTransitToken.decimals
            );

            if (type === 'min') {
                if (slippageTolerance) {
                    return fromTransitTokenAmount.dividedBy(1 - slippageTolerance);
                }
            }
            return fromTransitTokenAmount;
        };

        const [minAmount, maxAmount] = await Promise.all([getAmount('min'), getAmount('max')]);
        return {
            minAmount,
            maxAmount
        };
    }

    private async getTokenAmountForExactTransitTokenAmount(
        fromTrade: CrossChainContractTrade,
        transitTokenAmount: BigNumber
    ): Promise<BigNumber> {
        const transitToken = await fromTrade.contract.getTransitToken(fromTrade.fromToken);
        if (
            compareAddresses(fromTrade.fromToken.address, transitToken.address) ||
            transitTokenAmount.eq(0)
        ) {
            return transitTokenAmount;
        }

        return this.getTokenAmountForExactTransitTokenAmountByProvider(
            fromTrade.fromToken,
            transitToken,
            transitTokenAmount,
            fromTrade.provider
        );
    }

    protected getTokenAmountForExactTransitTokenAmountByProvider(
        fromToken: Token,
        transitToken: Token,
        transitTokenAmount: BigNumber,
        provider: CrossChainSupportedInstantTradeProvider
    ) {
        return provider.calculateExactOutputAmount(
            new PriceToken({
                ...fromToken,
                price: new BigNumber(NaN)
            }),
            new PriceTokenAmount({
                ...transitToken,
                tokenAmount: transitTokenAmount,
                price: new BigNumber(NaN)
            }),
            {
                gasCalculation: 'disabled'
            }
        );
    }

    protected abstract getBestItContractTrade(
        blockchain: BlockchainName,
        from: PriceTokenAmount,
        toToken: PriceToken,
        slippageTolerance: number
    ): Promise<CrossChainContractTrade>;

    protected async checkContractsState(
        fromTrade: CrossChainContractTrade,
        toTrade: CrossChainContractTrade
    ): Promise<void> {
        const [sourceContractPaused, targetContractPaused] = await Promise.all([
            fromTrade.contract.isPaused(),
            toTrade.contract.isPaused()
        ]);

        if (sourceContractPaused || targetContractPaused) {
            throw new CrossChainIsUnavailableError();
        }
    }
}
