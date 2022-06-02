import BigNumber from 'bignumber.js';
import { MinMaxAmounts } from '@features/cross-chain/models/min-max-amounts';
import { getRubicCrossChainContract } from '@features/cross-chain/providers/rubic-trade-provider/constants/rubic-cross-chain-contracts';
import {
    RubicCrossChainSupportedBlockchain,
    rubicCrossChainSupportedBlockchains
} from '@features/cross-chain/providers/rubic-trade-provider/constants/rubic-cross-chain-supported-blockchains';
import { compareAddresses, notNull, NotSupportedBlockchain } from 'src/common';
import { CROSS_CHAIN_TRADE_TYPE } from 'src/features';
import { BlockchainName } from 'src/core';
import { PriceToken } from '@core/blockchain/tokens/price-token';
import { PriceTokenAmount } from '@core/blockchain/tokens/price-token-amount';
import { RubicCrossChainTrade } from '@features/cross-chain/providers/rubic-trade-provider/rubic-cross-chain-trade';
import { Token } from '@core/blockchain/tokens/token';
import { CrossChainOptions } from '@features/cross-chain/models/cross-chain-options';
import { CrossChainTrade } from '@features/cross-chain/providers/common/cross-chain-trade';
import { CrossChainTradeProvider } from '@features/cross-chain/providers/common/cross-chain-trade-provider';
import { RubicDirectCrossChainContractTrade } from '@features/cross-chain/providers/rubic-trade-provider/rubic-cross-chain-contract-trade/rubic-direct-cross-chain-contract-trade/rubic-direct-cross-chain-contract-trade';
import { RubicCrossChainContractTrade } from '@features/cross-chain/providers/rubic-trade-provider/rubic-cross-chain-contract-trade/rubic-cross-chain-contract-trade';
import { RubicItCrossChainContractTrade } from '@features/cross-chain/providers/rubic-trade-provider/rubic-cross-chain-contract-trade/rubic-it-cross-chain-contract-trade/rubic-it-cross-chain-contract-trade';
import { ItCalculatedTrade } from '@features/cross-chain/providers/common/models/it-calculated-trade';

export class RubicCrossChainTradeProvider extends CrossChainTradeProvider {
    public static isSupportedBlockchain(
        blockchain: BlockchainName
    ): blockchain is RubicCrossChainSupportedBlockchain {
        return rubicCrossChainSupportedBlockchains.some(
            supportedBlockchain => supportedBlockchain === blockchain
        );
    }

    public type = CROSS_CHAIN_TRADE_TYPE.RUBIC;

    protected readonly contracts = getRubicCrossChainContract;

    constructor() {
        super();
    }

    public async calculate(
        from: PriceTokenAmount,
        to: PriceToken,
        options: CrossChainOptions
    ): Promise<CrossChainTrade> {
        const fromBlockchain = from.blockchain;
        const toBlockchain = to.blockchain;
        if (
            !RubicCrossChainTradeProvider.isSupportedBlockchain(fromBlockchain) ||
            !RubicCrossChainTradeProvider.isSupportedBlockchain(toBlockchain)
        ) {
            throw new NotSupportedBlockchain();
        }

        const [fromTransitToken, toTransitToken] = await Promise.all([
            new PriceToken({
                ...(await this.contracts(fromBlockchain).getTransitToken()),
                price: new BigNumber(1)
            }),
            new PriceToken({
                ...(await this.contracts(toBlockchain).getTransitToken()),
                price: new BigNumber(1)
            })
        ]);

        const { fromSlippageTolerance, toSlippageTolerance, gasCalculation, providerAddress } =
            options;

        const fromTrade = await this.calculateBestTrade(
            fromBlockchain,
            from,
            fromTransitToken,
            fromSlippageTolerance
        );
        await this.checkMinMaxAmountsErrors(fromTrade);

        const { toTransitTokenAmount, transitFeeToken } = await this.getToTransitTokenAmount(
            toBlockchain,
            fromTrade.fromToken,
            fromTrade.toTokenAmountMin,
            fromTrade.contract
        );

        const toTrade = await this.calculateBestTrade(
            toBlockchain,
            new PriceTokenAmount({ ...toTransitToken.asStruct, tokenAmount: toTransitTokenAmount }),
            to,
            toSlippageTolerance
        );

        const cryptoFeeToken = await fromTrade.contract.getCryptoFeeToken(toTrade.contract);
        const gasData =
            gasCalculation === 'enabled'
                ? await RubicCrossChainTrade.getGasData(fromTrade, toTrade, cryptoFeeToken)
                : null;

        return new RubicCrossChainTrade(
            {
                fromTrade,
                toTrade,
                cryptoFeeToken,
                transitFeeToken,
                gasData
            },
            providerAddress
        );
    }

    private async getMinMaxAmountsDifficult(
        fromToken: Token,
        slippageTolerance: number
    ): Promise<MinMaxAmounts> {
        const fromBlockchain = fromToken.blockchain;
        if (!RubicCrossChainTradeProvider.isSupportedBlockchain(fromBlockchain)) {
            throw new NotSupportedBlockchain();
        }

        const transitToken = await this.contracts(fromBlockchain).getTransitToken();
        if (compareAddresses(fromToken.address, transitToken.address)) {
            return this.getMinMaxTransitTokenAmounts(fromBlockchain);
        }

        const { minAmount: minTransitTokenAmount, maxAmount: maxTransitTokenAmount } =
            await this.getMinMaxTransitTokenAmounts(fromBlockchain, slippageTolerance);
        const minAmount = await this.getMinOrMaxAmount(
            fromBlockchain,
            fromToken,
            transitToken,
            minTransitTokenAmount,
            'min'
        );
        const maxAmount = await this.getMinOrMaxAmount(
            fromBlockchain,
            fromToken,
            transitToken,
            maxTransitTokenAmount,
            'max'
        );

        return { minAmount, maxAmount };
    }

    private async getMinOrMaxAmount(
        fromBlockchain: RubicCrossChainSupportedBlockchain,
        fromToken: Token,
        transitToken: Token,
        transitTokenAmount: BigNumber,
        type: 'min' | 'max'
    ): Promise<BigNumber> {
        const fromContract = this.contracts(fromBlockchain);
        const promises = fromContract.providersData.map(providerData => {
            return this.getTokenAmountForExactTransitTokenAmountByProvider(
                fromToken,
                transitToken,
                transitTokenAmount,
                providerData.provider
            );
        });

        const sortedAmounts = (await Promise.allSettled(promises))
            .map(result => {
                if (result.status === 'fulfilled') {
                    return result.value;
                }
                return null;
            })
            .filter(notNull)
            .sort((a, b) => a.comparedTo(b));

        if (type === 'min' && sortedAmounts?.[0]) {
            return sortedAmounts[0];
        }

        const amount = sortedAmounts?.[sortedAmounts.length - 1];
        if (!amount) {
            throw new Error('[RUBIC SDK] Amount has to be defined.');
        }

        return amount;
    }

    protected async calculateBestTrade(
        blockchain: RubicCrossChainSupportedBlockchain,
        from: PriceTokenAmount,
        toToken: PriceToken,
        slippageTolerance: number
    ): Promise<RubicCrossChainContractTrade> {
        if (compareAddresses(from.address, toToken.address)) {
            const contract = this.contracts(blockchain);
            if (!from.price.isFinite()) {
                from = new PriceTokenAmount({ ...from.asStructWithAmount, price: toToken.price });
            }

            return new RubicDirectCrossChainContractTrade(blockchain, contract, from);
        }

        return this.getBestItContractTrade(blockchain, from, toToken, slippageTolerance);
    }

    protected async getBestItContractTrade(
        blockchain: RubicCrossChainSupportedBlockchain,
        from: PriceTokenAmount,
        toToken: PriceToken,
        slippageTolerance: number
    ): Promise<RubicItCrossChainContractTrade> {
        const contract = this.contracts(blockchain);
        const promises: Promise<ItCalculatedTrade>[] = contract.providersData.map(
            async (_, providerIndex) => {
                return this.getItCalculatedTrade(
                    contract,
                    providerIndex,
                    from,
                    toToken,
                    slippageTolerance
                );
            }
        );

        const bestTrade = await Promise.allSettled(promises).then(async results => {
            const sortedResults = results
                .map(result => {
                    if (result.status === 'fulfilled') {
                        return result.value;
                    }
                    return null;
                })
                .filter(notNull)
                .sort((a, b) => b.toAmount.comparedTo(a.toAmount));

            if (!sortedResults.length) {
                throw (results[0] as PromiseRejectedResult).reason;
            }
            return sortedResults[0];
        });

        if (!bestTrade) {
            throw new Error('[RUBIC SDK] Best trade has to be defined.');
        }

        return new RubicItCrossChainContractTrade(
            blockchain,
            contract,
            bestTrade.providerIndex,
            slippageTolerance,
            bestTrade.instantTrade
        );
    }
}
