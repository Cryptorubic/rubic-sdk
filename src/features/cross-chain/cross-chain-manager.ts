import { getCrossChainContract } from '@features/cross-chain/constants/cross-chain-contracts';
import { CrossChainContractData } from '@features/cross-chain/cross-chain-contract-data/cross-chain-contract-data';
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
import { CrossChainContractTrade } from '@features/cross-chain/cross-chain-contract-trade/cross-chain-contract-trade';
import { DirectCrossChainContractTrade } from '@features/cross-chain/cross-chain-contract-trade/direct-cross-chain-contract-trade';
import { ItCrossChainContractTrade } from '@features/cross-chain/cross-chain-contract-trade/it-cross-chain-contract-trade/it-cross-chain-contract-trade';
import { CrossChainTrade } from '@features/cross-chain/cross-chain-trade/cross-chain-trade';
import { MinMaxAmountsErrors } from '@features/cross-chain/cross-chain-trade/models/min-max-amounts-errors';
import { InsufficientLiquidityError } from '@common/errors/swap/insufficient-liquidity.error';
import { MinMaxAmounts } from '@features/cross-chain/models/min-max-amounts';
import { NotSupportedBlockchain } from '@common/errors/swap/not-supported-blockchain';
import { notNull } from '@common/utils/object';
import { PriceToken } from '@core/blockchain/tokens/price-token';
import { RubicSdkError } from '@common/errors/rubic-sdk.error';
import { combineOptions } from '@common/utils/options';
import { getPriceTokensFromInputTokens } from '@common/utils/tokens';
import {
    CrossChainSupportedInstantTrade,
    CrossChainSupportedInstantTradeProvider
} from '@features/cross-chain/models/cross-chain-supported-instant-trade';
import { CrossChainMaxAmountError } from '@common/errors/cross-chain/cross-chain-max-amount-error';
import { CrossChainMinAmountError } from '@common/errors/cross-chain/cross-chain-min-amount-error';

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

    private readonly defaultSlippageTolerance = 0.02;

    constructor(private readonly providerAddress: string) {
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
            fromSlippageTolerance: this.defaultSlippageTolerance,
            toSlippageTolerance: this.defaultSlippageTolerance,
            gasCalculation: 'enabled'
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
                price: new BigNumber(1)
            }),
            new PriceToken({
                ...(await this.contracts(toBlockchain).getTransitToken()),
                price: new BigNumber(1)
            })
        ]);

        const { fromSlippageTolerance, toSlippageTolerance } = options;

        const fromTrade = await this.calculateBestTrade(
            fromBlockchain,
            from,
            fromTransitToken,
            fromSlippageTolerance
        );
        await this.checkMinMaxAmountsErrors(fromTrade);

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

        const cryptoFeeToken = await fromTrade.contract.getCryptoFeeToken(toTrade.contract);
        const gasData =
            options.gasCalculation === 'enabled'
                ? await CrossChainTrade.getGasData(fromTrade, toTrade, cryptoFeeToken)
                : null;

        return new CrossChainTrade(
            {
                fromTrade,
                toTrade,
                cryptoFeeToken,
                transitFeeToken,
                gasData
            },
            this.providerAddress
        );
    }

    private async calculateBestTrade(
        blockchain: CrossChainSupportedBlockchain,
        from: PriceTokenAmount,
        toToken: PriceToken,
        slippageTolerance: number
    ): Promise<CrossChainContractTrade> {
        if (compareAddresses(from.address, toToken.address)) {
            const contract = this.contracts(blockchain);
            if (!from.price.isFinite()) {
                from = new PriceTokenAmount({ ...from.asStructWithAmount, price: toToken.price });
            }

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

        const feeInPercents = await this.contracts(toBlockchain).getFeeInPercents(
            fromTrade.contract
        );
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

    private async checkMinMaxAmountsErrors(
        fromTrade: CrossChainContractTrade
    ): Promise<MinMaxAmountsErrors> {
        const slippageTolerance =
            fromTrade instanceof ItCrossChainContractTrade
                ? fromTrade.slippageTolerance
                : undefined;
        const { minAmount: minTransitTokenAmount, maxAmount: maxTransitTokenAmount } =
            await this.getMinMaxTransitTokenAmounts(fromTrade.blockchain, slippageTolerance);
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

    public async getMinMaxAmounts(
        fromToken:
            | Token
            | {
                  address: string;
                  blockchain: BLOCKCHAIN_NAME;
              },
        slippageTolerance?: number
    ): Promise<MinMaxAmounts> {
        const from = fromToken instanceof Token ? fromToken : await Token.createToken(fromToken);
        return this.getMinMaxAmountsDifficult(
            from,
            slippageTolerance || this.defaultSlippageTolerance
        );
    }

    private async getMinMaxAmountsDifficult(
        fromToken: Token,
        slippageTolerance: number
    ): Promise<MinMaxAmounts> {
        const fromBlockchain = fromToken.blockchain;
        if (!CrossChainManager.isSupportedBlockchain(fromBlockchain)) {
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
        fromBlockchain: CrossChainSupportedBlockchain,
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

        if (type === 'min') {
            return sortedAmounts[0];
        }
        return sortedAmounts[sortedAmounts.length - 1];
    }

    private async getMinMaxTransitTokenAmounts(
        fromBlockchain: CrossChainSupportedBlockchain,
        slippageTolerance?: number
    ): Promise<MinMaxAmounts> {
        const fromContract = this.contracts(fromBlockchain);
        const fromTransitToken = await fromContract.getTransitToken();

        const getAmount = async (type: 'min' | 'max'): Promise<BigNumber> => {
            const fromTransitTokenAmountAbsolute = await fromContract.getMinOrMaxTransitTokenAmount(
                type
            );
            const fromTransitTokenAmount = Web3Pure.fromWei(
                fromTransitTokenAmountAbsolute,
                fromTransitToken.decimals
            );

            if (type === 'min') {
                if (slippageTolerance) {
                    return fromTransitTokenAmount.dividedBy(1 - slippageTolerance);
                }
                return fromTransitTokenAmount;
            }
            return fromTransitTokenAmount;
        };

        return Promise.all([getAmount('min'), getAmount('max')]).then(([minAmount, maxAmount]) => ({
            minAmount,
            maxAmount
        }));
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

        return this.getTokenAmountForExactTransitTokenAmountByProvider(
            fromTrade.fromToken,
            transitToken,
            transitTokenAmount,
            fromTrade.provider
        );
    }

    private getTokenAmountForExactTransitTokenAmountByProvider(
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
}
