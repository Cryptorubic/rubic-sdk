import { getCrossChainContract } from '@features/cross-chain/constants/cross-chain-contracts';
import { CrossChainContractData } from '@features/cross-chain/contract-data/cross-chain-contract-data';
import {
    CrossChainSupportedBlockchain,
    crossChainSupportedBlockchains
} from '@features/cross-chain/constants/cross-chain-supported-blockchains';
import { Token } from '@core/blockchain/tokens/token';
import BigNumber from 'bignumber.js';
import { CrossChainOptions } from '@features/cross-chain/models/cross-chain-options';
import { BLOCKCHAIN_NAME } from '@core/blockchain/models/BLOCKCHAIN_NAME';
import { compareAddresses } from '@common/utils/blockchain';
import { PriceTokenAmount } from '@core/blockchain/tokens/price-token-amount';
import { Web3Pure } from '@core/blockchain/web3-pure/web3-pure';
import { CrossChainContractTrade } from '@features/cross-chain/contract-trade/cross-chain-contract-trade';
import { DirectCrossChainContractTrade } from '@features/cross-chain/contract-trade/direct-cross-chain-contract-trade';
import { ItCrossChainContractTrade } from '@features/cross-chain/contract-trade/it-contract-trade/it-cross-chain-contract-trade';
import { CrossChainTrade } from '@features/cross-chain/cross-chain-trade/cross-chain-trade';
import { MinMaxAmountsErrors } from '@features/cross-chain/cross-chain-trade/models/min-max-amounts-errors';
import { InsufficientLiquidityError } from '@common/errors/swap/insufficient-liquidity.error';
import { MinMaxAmounts } from '@features/cross-chain/models/min-max-amounts';
import { GasData } from '@features/cross-chain/models/gas-data';
import { NotSupportedBlockchain } from '@common/errors/swap/not-supported-blockchain';
import { notNull } from '@common/utils/object';
import { PriceToken } from '@core/blockchain/tokens/price-token';
import { RubicSdkError } from '@common/errors/rubic-sdk.error';
import { combineOptions } from '@common/utils/options';
import { getPriceTokensFromInputTokens } from '@common/utils/tokens';
import { CrossChainSupportedInstantTrade } from '@features/cross-chain/models/cross-chain-supported-instant-trade';

interface ItCalculatedTrade {
    toAmount: BigNumber;
    providerIndex: number;
    instantTrade: CrossChainSupportedInstantTrade;
}

export class CrossChainManager {
    public static isSupportedBlockchain(
        blockchain: BLOCKCHAIN_NAME
    ): blockchain is CrossChainSupportedBlockchain {
        return crossChainSupportedBlockchains.some(
            supportedBlockchain => supportedBlockchain === blockchain
        );
    }

    private readonly contracts: (
        blockchain: CrossChainSupportedBlockchain
    ) => CrossChainContractData;

    constructor() {
        this.contracts = getCrossChainContract;
    }

    public async calculateTrade(
        fromToken:
            | Token
            | {
                  address: string;
                  blockchain: BLOCKCHAIN_NAME;
              },
        fromAmount: string | number,
        toToken:
            | Token
            | {
                  address: string;
                  blockchain: BLOCKCHAIN_NAME;
              },
        options?: CrossChainOptions
    ): Promise<CrossChainTrade> {
        if (toToken instanceof Token && fromToken.blockchain === toToken.blockchain) {
            throw new RubicSdkError('Blockchains of from and to tokens must be different.');
        }

        const { from, to } = await getPriceTokensFromInputTokens(
            fromToken,
            fromAmount.toString(),
            toToken
        );

        return this.calculateTradeFromTokens(from, to, this.getFullOptions(options));
    }

    private getFullOptions(options?: CrossChainOptions): Required<CrossChainOptions> {
        return combineOptions(options, {
            fromSlippageTolerance: 0.02,
            toSlippageTolerance: 0.02
        });
    }

    private async calculateTradeFromTokens(
        from: PriceTokenAmount,
        toToken: PriceToken,
        options: CrossChainOptions
    ): Promise<CrossChainTrade> {
        const fromBlockchain = from.blockchain;
        const toBlockchain = toToken.blockchain;
        if (
            !CrossChainManager.isSupportedBlockchain(fromBlockchain) ||
            !CrossChainManager.isSupportedBlockchain(toBlockchain)
        ) {
            throw new NotSupportedBlockchain();
        }

        const [fromTransitToken, toTransitToken] = await Promise.all([
            new PriceToken({
                ...(await this.contracts(fromBlockchain).getTransitToken()),
                price: new BigNumber(NaN)
            }),
            new PriceToken({
                ...(await this.contracts(toBlockchain).getTransitToken()),
                price: new BigNumber(NaN)
            })
        ]);

        const { fromSlippageTolerance, toSlippageTolerance } = options;

        const fromTrade = await this.calculateBestTrade(
            fromBlockchain,
            from,
            fromTransitToken,
            fromSlippageTolerance
        );

        const { toTransitTokenAmount, transitFeeToken } = await this.getToTransitTokenAmount(
            fromTrade,
            toBlockchain
        );

        const toTrade = await this.calculateBestTrade(
            toBlockchain,
            new PriceTokenAmount({ ...toTransitToken.asStruct, tokenAmount: toTransitTokenAmount }),
            toToken,
            toSlippageTolerance
        );

        const [{ cryptoFeeToken, gasData }, minMaxAmountsErrors] = await Promise.all([
            this.getCryptoFeeTokenAndGasData(fromTrade, toTrade),
            this.getMinMaxAmountsErrors(fromTrade)
        ]);

        return new CrossChainTrade({
            fromTrade,
            toTrade,
            cryptoFeeToken,
            transitFeeToken,
            minMaxAmountsErrors,
            gasData
        });
    }

    private async calculateBestTrade(
        blockchain: CrossChainSupportedBlockchain,
        from: PriceTokenAmount,
        toToken: PriceToken,
        slippageTolerance: number
    ): Promise<CrossChainContractTrade> {
        if (compareAddresses(from.address, toToken.address)) {
            const contract = this.contracts(blockchain);

            return new DirectCrossChainContractTrade(blockchain, contract, from);
        }

        return this.getBestItContractTrade(blockchain, from, toToken, slippageTolerance);
    }

    private async getBestItContractTrade(
        blockchain: CrossChainSupportedBlockchain,
        from: PriceTokenAmount,
        toToken: PriceToken,
        slippageTolerance: number
    ): Promise<ItCrossChainContractTrade> {
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

        return new ItCrossChainContractTrade(
            blockchain,
            contract,
            bestTrade.providerIndex,
            slippageTolerance,
            bestTrade.instantTrade
        );
    }

    private async getItCalculatedTrade(
        contract: CrossChainContractData,
        providerIndex: number,
        from: PriceTokenAmount,
        toToken: PriceToken,
        slippageTolerance: number
    ): Promise<ItCalculatedTrade> {
        const instantTrade = await contract.getProvider(providerIndex).calculate(from, toToken, {
            gasCalculation: 'disabled',
            slippageTolerance
        });
        return {
            toAmount: instantTrade.to.tokenAmount,
            providerIndex,
            instantTrade
        };
    }

    private async getToTransitTokenAmount(
        fromTrade: CrossChainContractTrade,
        toBlockchain: CrossChainSupportedBlockchain
    ): Promise<{
        toTransitTokenAmount: BigNumber;
        transitFeeToken: PriceTokenAmount;
    }> {
        const fromTransitToken = fromTrade.toToken;
        const fromTransitTokenMinAmount = fromTrade.toTokenAmountMin;

        const feeInPercents = await this.contracts(toBlockchain).getFeeInPercents();
        const transitFeeToken = new PriceTokenAmount({
            ...fromTransitToken.asStruct,
            tokenAmount: fromTransitTokenMinAmount.multipliedBy(feeInPercents).dividedBy(100)
        });

        const toTransitTokenAmount = fromTransitTokenMinAmount.minus(transitFeeToken.tokenAmount);

        return {
            toTransitTokenAmount,
            transitFeeToken
        };
    }

    private async getMinMaxAmountsErrors(
        fromTrade: CrossChainContractTrade
    ): Promise<MinMaxAmountsErrors> {
        const fromTransitTokenAmount = fromTrade.toToken.tokenAmount;
        const { minAmount: minTransitTokenAmount, maxAmount: maxTransitTokenAmount } =
            await this.getMinMaxTransitTokenAmounts(fromTrade);

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

    private async getMinMaxTransitTokenAmounts(
        fromTrade: CrossChainContractTrade
    ): Promise<MinMaxAmounts> {
        const fromTransitToken = await fromTrade.contract.getTransitToken();

        const getAmount = async (type: 'minAmount' | 'maxAmount'): Promise<BigNumber> => {
            const fromTransitTokenAmountAbsolute =
                await fromTrade.contract.getMinOrMaxTransitTokenAmount(type);
            const fromTransitTokenAmount = Web3Pure.fromWei(
                fromTransitTokenAmountAbsolute,
                fromTransitToken.decimals
            );

            if (type === 'minAmount') {
                if (fromTrade instanceof ItCrossChainContractTrade) {
                    return fromTransitTokenAmount.dividedBy(1 - fromTrade.slippageTolerance);
                }
                return fromTransitTokenAmount;
            }
            return fromTransitTokenAmount;
        };

        return Promise.all([getAmount('minAmount'), getAmount('maxAmount')]).then(
            ([minAmount, maxAmount]) => ({
                minAmount,
                maxAmount
            })
        );
    }

    private async getTokenAmountForExactTransitTokenAmount(
        fromTrade: CrossChainContractTrade,
        transitTokenAmount: BigNumber
    ): Promise<BigNumber> {
        const transitToken = await fromTrade.contract.getTransitToken();
        if (
            compareAddresses(fromTrade.fromToken.address, transitToken.address) ||
            transitTokenAmount.eq(0)
        ) {
            return transitTokenAmount;
        }

        const tokenAmount = await fromTrade.provider.calculateExactOutputAmount(
            fromTrade.fromToken,
            new PriceTokenAmount({
                ...transitToken,
                tokenAmount: transitTokenAmount,
                price: new BigNumber(NaN)
            }),
            {
                gasCalculation: 'disabled'
            }
        );
        return tokenAmount;
    }

    private async getCryptoFeeTokenAndGasData(
        fromTrade: CrossChainContractTrade,
        toTrade: CrossChainContractTrade
    ): Promise<{
        cryptoFeeToken: PriceTokenAmount;
        gasData: GasData | null;
    }> {
        const cryptoFeeToken = await fromTrade.contract.getCryptoFeeToken(toTrade.contract);
        const gasData = await CrossChainTrade.getGasData(fromTrade, toTrade, cryptoFeeToken);
        return {
            cryptoFeeToken,
            gasData
        };
    }
}
