import { CrossChainTradeType } from 'src/features';
import { BlockchainName, Token, Web3Pure } from 'src/core';
import { CrossChainOptions } from '@features/cross-chain/models/cross-chain-options';
import { CrossChainTrade } from '@features/cross-chain/providers/common/cross-chain-trade';
import { CrossChainContractData } from '@features/cross-chain/providers/common/cross-chain-contract-data';
import { CrossChainContractTrade } from '@features/cross-chain/providers/common/cross-chain-contract-trade';
import { compareAddresses, InsufficientLiquidityError } from 'src/common';
import { RubicItCrossChainContractTrade } from '@features/cross-chain/providers/rubic-trade-provider/rubic-cross-chain-contract-trade/rubic-it-cross-chain-contract-trade/rubic-it-cross-chain-contract-trade';
import BigNumber from 'bignumber.js';
import { CrossChainSupportedInstantTradeProvider } from '@features/cross-chain/providers/common/models/cross-chain-supported-instant-trade';
import { PriceTokenAmount } from '@core/blockchain/tokens/price-token-amount';
import { MinMaxAmountsErrors } from '@features/cross-chain/models/min-max-amounts-errors';
import { CrossChainMinAmountError } from '@common/errors/cross-chain/cross-chain-min-amount-error';
import { CrossChainMaxAmountError } from '@common/errors/cross-chain/cross-chain-max-amount-error';
import { MinMaxAmounts } from '@features/cross-chain/models/min-max-amounts';
import { PriceToken } from '@core/blockchain/tokens/price-token';
import { ItCalculatedTrade } from '@features/cross-chain/providers/common/models/it-calculated-trade';

export abstract class CrossChainTradeProvider {
    public abstract type: CrossChainTradeType;

    protected abstract contracts(blockchain: BlockchainName): CrossChainContractData;

    public abstract calculate(
        from: PriceTokenAmount,
        to: PriceToken,
        options: CrossChainOptions
    ): Promise<CrossChainTrade>;

    protected abstract calculateBestTrade(
        blockchain: BlockchainName,
        from: PriceTokenAmount,
        toToken: PriceToken,
        slippageTolerance: number
    ): Promise<CrossChainContractTrade>;

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
    }> {
        const feeInPercents = await this.contracts(toBlockchain).getFeeInPercents(contract);
        const transitFeeToken = new PriceTokenAmount({
            ...transitToken.asStruct,
            tokenAmount: transitTokenMinAmount.multipliedBy(feeInPercents).dividedBy(100)
        });

        const toTransitTokenAmount = transitTokenMinAmount.minus(transitFeeToken.tokenAmount);

        return {
            toTransitTokenAmount,
            transitFeeToken
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
            throw new CrossChainMinAmountError(minAmount, fromTrade.fromToken.symbol);
        }

        if (fromTransitTokenAmount.gt(maxTransitTokenAmount)) {
            const maxAmount = await this.getTokenAmountForExactTransitTokenAmount(
                fromTrade,
                maxTransitTokenAmount
            );
            throw new CrossChainMaxAmountError(maxAmount, fromTrade.fromToken.symbol);
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
        lockchain: BlockchainName,
        from: PriceTokenAmount,
        toToken: PriceToken,
        slippageTolerance: number
    ): Promise<CrossChainContractTrade>;
}
