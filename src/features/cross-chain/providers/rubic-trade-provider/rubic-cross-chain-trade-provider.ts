import {
    RubicCrossChainSupportedBlockchain,
    rubicCrossChainSupportedBlockchains
} from 'src/features/cross-chain/providers/rubic-trade-provider/constants/rubic-cross-chain-supported-blockchains';
import { RubicItCrossChainContractTrade } from 'src/features/cross-chain/providers/rubic-trade-provider/rubic-cross-chain-contract-trade/rubic-it-cross-chain-contract-trade/rubic-it-cross-chain-contract-trade';
import { ItCalculatedTrade } from 'src/features/cross-chain/providers/common/celer-rubic/models/it-calculated-trade';
import { notNull } from 'src/common/utils/object';
import { BlockchainName, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { WrappedCrossChainTrade } from 'src/features/cross-chain/providers/common/models/wrapped-cross-chain-trade';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { RequiredCrossChainOptions } from 'src/features/cross-chain/models/cross-chain-options';
import { RubicDirectCrossChainContractTrade } from 'src/features/cross-chain/providers/rubic-trade-provider/rubic-cross-chain-contract-trade/rubic-direct-cross-chain-contract-trade/rubic-direct-cross-chain-contract-trade';
import { RubicSdkError } from 'src/common/errors';
import { getRubicCrossChainContract } from 'src/features/cross-chain/providers/rubic-trade-provider/constants/rubic-cross-chain-contracts';
import { RubicCrossChainTrade } from 'src/features/cross-chain/providers/rubic-trade-provider/rubic-cross-chain-trade';
import { RubicCrossChainContractTrade } from 'src/features/cross-chain/providers/rubic-trade-provider/rubic-cross-chain-contract-trade/rubic-cross-chain-contract-trade';
import { CROSS_CHAIN_TRADE_TYPE } from 'src/features/cross-chain/models/cross-chain-trade-type';
import { CrossChainTradeProvider } from 'src/features/cross-chain/providers/common/cross-chain-trade-provider';
import { compareAddresses } from 'src/common/utils/blockchain';
import { CelerRubicCrossChainTradeProvider } from 'src/features/cross-chain/providers/common/celer-rubic/celer-rubic-cross-chain-trade-provider';
import BigNumber from 'bignumber.js';

export class RubicCrossChainTradeProvider extends CelerRubicCrossChainTradeProvider {
    public static isSupportedBlockchain(
        blockchain: BlockchainName
    ): blockchain is RubicCrossChainSupportedBlockchain {
        return rubicCrossChainSupportedBlockchains.some(
            supportedBlockchain => supportedBlockchain === blockchain
        );
    }

    public readonly type = CROSS_CHAIN_TRADE_TYPE.RUBIC;

    protected readonly contracts = getRubicCrossChainContract;

    constructor() {
        super();
    }

    public isSupportedBlockchains(
        fromBlockchain: BlockchainName,
        toBlockchain: BlockchainName
    ): boolean {
        return (
            RubicCrossChainTradeProvider.isSupportedBlockchain(fromBlockchain) &&
            RubicCrossChainTradeProvider.isSupportedBlockchain(toBlockchain)
        );
    }

    public async calculate(
        from: PriceTokenAmount<EvmBlockchainName>,
        to: PriceToken<EvmBlockchainName>,
        options: RequiredCrossChainOptions
    ): Promise<Omit<WrappedCrossChainTrade, 'tradeType'> | null> {
        const fromBlockchain = from.blockchain;
        const toBlockchain = to.blockchain;
        if (
            !RubicCrossChainTradeProvider.isSupportedBlockchain(fromBlockchain) ||
            !RubicCrossChainTradeProvider.isSupportedBlockchain(toBlockchain)
        ) {
            return null;
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

        await this.checkContractsState(
            this.contracts(fromBlockchain),
            this.contracts(toBlockchain)
        );

        const fromTrade = await this.calculateBestTrade(
            fromBlockchain,
            from,
            fromTransitToken,
            fromSlippageTolerance
        );

        const { toTransitTokenAmount, transitFeeToken, feeInPercents } =
            await this.getToTransitTokenAmount(
                toBlockchain,
                fromTrade.fromToken,
                fromTrade.toTokenAmountMin,
                fromTrade.contract
            );

        const toTrade = await this.calculateBestTrade(
            toBlockchain,
            new PriceTokenAmount({
                ...toTransitToken.asStruct,
                tokenAmount: toTransitTokenAmount
            }),
            to,
            toSlippageTolerance
        );

        const cryptoFeeToken = await fromTrade.contract.getCryptoFeeToken(toTrade.contract);
        const gasData =
            gasCalculation === 'enabled'
                ? await RubicCrossChainTrade.getGasData(fromTrade, toTrade, cryptoFeeToken)
                : null;

        const trade = new RubicCrossChainTrade(
            {
                fromTrade,
                toTrade,
                cryptoFeeToken,
                transitFeeToken,
                gasData,
                feeInPercents,
                feeInfo: {
                    fixedFee: { amount: new BigNumber(0), tokenSymbol: '' },
                    platformFee: { percent: feeInPercents, tokenSymbol: transitFeeToken.symbol },
                    cryptoFee: {
                        amount: cryptoFeeToken.tokenAmount,
                        tokenSymbol: cryptoFeeToken.symbol
                    }
                }
            },
            providerAddress
        );

        try {
            await this.checkMinMaxAmountsErrors(fromTrade);
        } catch (err: unknown) {
            return {
                trade,
                error: CrossChainTradeProvider.parseError(err)
            };
        }

        return {
            trade
        };
    }

    protected async calculateBestTrade(
        blockchain: RubicCrossChainSupportedBlockchain,
        from: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>,
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
        from: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>,
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
            throw new RubicSdkError('Best trade has to be defined');
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
