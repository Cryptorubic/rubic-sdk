import { CrossChainContractTrade } from 'src/features/cross-chain/providers/common/celer-rubic/cross-chain-contract-trade';
import { RubicItCrossChainContractTrade } from 'src/features/cross-chain/providers/rubic-trade-provider/rubic-cross-chain-contract-trade/rubic-it-cross-chain-contract-trade/rubic-it-cross-chain-contract-trade';
import { ItCalculatedTrade } from 'src/features/cross-chain/providers/common/celer-rubic/models/it-calculated-trade';
import { BlockchainName, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { CrossChainMaxAmountError } from 'src/common/errors/cross-chain/cross-chain-max-amount.error';
import { PriceToken, PriceTokenAmount, Token } from 'src/common/tokens';
import { CrossChainIsUnavailableError, InsufficientLiquidityError } from 'src/common/errors';
import { MinMaxAmounts } from 'src/features/cross-chain/models/min-max-amounts';
import { CrossChainSupportedInstantTradeProvider } from 'src/features/cross-chain/providers/common/celer-rubic/models/cross-chain-supported-instant-trade';
import { CrossChainMinAmountError } from 'src/common/errors/cross-chain/cross-chain-min-amount.error';
import { CrossChainContractData } from 'src/features/cross-chain/providers/common/celer-rubic/cross-chain-contract-data';
import { CrossChainTradeProvider } from 'src/features/cross-chain/providers/common/cross-chain-trade-provider';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { compareAddresses } from 'src/common/utils/blockchain';
import BigNumber from 'bignumber.js';

export abstract class CelerRubicCrossChainTradeProvider extends CrossChainTradeProvider {
    protected abstract contracts(blockchain: BlockchainName): CrossChainContractData;

    protected async getItCalculatedTrade(
        contract: CrossChainContractData,
        providerIndex: number,
        from: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>,
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
    ): Promise<void | never> {
        const slippageTolerance =
            fromTrade instanceof RubicItCrossChainContractTrade ? fromTrade.slippage : undefined;
        const { minAmount, maxAmount } = await this.getMinMaxTransitTokenAmounts(
            fromTrade.blockchain,
            slippageTolerance,
            fromTrade.fromToken
        );
        const minTransitTokenAmount = minAmount?.eq(0) ? new BigNumber(0) : minAmount;
        const maxTransitTokenAmount = maxAmount?.eq(0)
            ? new BigNumber(Number.MAX_VALUE)
            : maxAmount;

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
    }

    protected async getMinMaxTransitTokenAmounts(
        fromBlockchain: EvmBlockchainName,
        slippageTolerance?: number,
        fromToken?: PriceToken<EvmBlockchainName>
    ): Promise<MinMaxAmounts> {
        const fromContract = this.contracts(fromBlockchain);
        const fromTransitToken = await fromContract.getTransitToken(fromToken);

        const [minTransitAmountAbsolute, maxTransitAmountAbsolute] =
            await fromContract.getMinMaxTransitTokenAmounts(fromTransitToken.address);

        const getAmount = (type: 'min' | 'max'): BigNumber => {
            const fromTransitAmount = Web3Pure.fromWei(
                type === 'min' ? minTransitAmountAbsolute : maxTransitAmountAbsolute,
                fromTransitToken.decimals
            );

            if (type === 'min') {
                if (slippageTolerance) {
                    return fromTransitAmount.dividedBy(1 - slippageTolerance);
                }
            }
            return fromTransitAmount;
        };

        return {
            minAmount: getAmount('min'),
            maxAmount: getAmount('max')
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
        fromToken: Token<EvmBlockchainName>,
        transitToken: Token<EvmBlockchainName>,
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
        fromContract: CrossChainContractData,
        toContract: CrossChainContractData
    ): Promise<void> {
        const [sourceContractPaused, targetContractPaused] = await Promise.all([
            fromContract.isPaused(),
            toContract.isPaused()
        ]);

        if (sourceContractPaused || targetContractPaused) {
            throw new CrossChainIsUnavailableError();
        }
    }
}
