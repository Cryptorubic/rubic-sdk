import { getCrossChainContract } from '@features/cross-chain/constants/cross-chain-contracts';
import { CrossChainContract } from '@features/cross-chain/cross-chain-contract/cross-chain-contract';
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
import { ContractTrade } from '@features/cross-chain/models/ContractTrade/ContractTrade';
import { DirectContractTrade } from '@features/cross-chain/models/ContractTrade/DirectContractTrade';
import { ItContractTrade } from '@features/cross-chain/models/ContractTrade/ItContractTrade';
import { CrossChainTrade } from '@features/cross-chain/cross-chain-trade/cross-chain-trade';
import { Injector } from '@core/sdk/injector';
import { MinMaxAmountsErrors } from '@features/cross-chain/cross-chain-trade/models/min-max-amounts-errors';
import { InsufficientLiquidityError } from '@common/errors/swap/insufficient-liquidity.error';
import { MinMaxAmounts } from '@features/cross-chain/models/min-max-amounts';
import { Web3Public } from '@core/blockchain/web3-public/web3-public';
import { GasData } from '@features/cross-chain/models/gas-data';
import { NotSupportedBlockchain } from '@common/errors/swap/not-supported-blockchain';
import { notNull } from '@common/utils/object';
import { PriceToken } from '@core/blockchain/tokens/price-token';
import { RubicSdkError } from '@common/errors/rubic-sdk.error';
import { combineOptions } from '@common/utils/options';
import { UniswapV2AbstractTrade } from '@features/swap/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import { getPriceTokensFromInputTokens } from '@common/utils/tokens';

interface CalculatedTrade {
    toAmount: BigNumber;
}

interface ItCalculatedTrade extends CalculatedTrade {
    instantTrade: UniswapV2AbstractTrade;
}

interface DirectCalculatedTrade extends CalculatedTrade {
    token: PriceTokenAmount;
}

interface CalculatedContractTrade {
    contract: CrossChainContract;
    trade: ItCalculatedTrade | DirectCalculatedTrade;
}

export class CrossChainManager {
    public static isSupportedBlockchain(
        blockchain: BLOCKCHAIN_NAME
    ): blockchain is CrossChainSupportedBlockchain {
        return crossChainSupportedBlockchains.some(
            supportedBlockchain => supportedBlockchain === blockchain
        );
    }

    private readonly contracts: (blockchain: CrossChainSupportedBlockchain) => CrossChainContract[];

    private readonly getWeb3Public: (blockchain: BLOCKCHAIN_NAME) => Web3Public;

    constructor() {
        this.contracts = getCrossChainContract;
        this.getWeb3Public = Injector.web3PublicService.getWeb3Public;
    }

    public async calculateTrade(
        fromToken:
            | Token
            | {
                  address: string;
                  blockchain: BLOCKCHAIN_NAME;
              },
        fromAmount: string,
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

        const { from, to } = await getPriceTokensFromInputTokens(fromToken, fromAmount, toToken);

        return this.calculateTradeFromTokens(from, to, this.getFullOptions(options));
    }

    private getFullOptions(options?: CrossChainOptions): Required<CrossChainOptions> {
        return combineOptions(options, {
            fromSlippageTolerance: 0.02,
            toSlippageTolerance: 0.02
        });
    }

    public async calculateTradeFromTokens(
        from: PriceTokenAmount,
        toToken: PriceToken,
        options: CrossChainOptions
    ): Promise<CrossChainTrade> {
        const fromBlockchain = from.blockchain;
        const toBlockchain = toToken.blockchain;
        if (!CrossChainManager.isSupportedBlockchain(fromBlockchain)) {
            throw new NotSupportedBlockchain();
        }
        if (!CrossChainManager.isSupportedBlockchain(toBlockchain)) {
            throw new NotSupportedBlockchain();
        }

        const { fromSlippageTolerance } = options;
        const fromTrade = await this.calculateBestFromTrade(
            fromBlockchain,
            from,
            fromSlippageTolerance
        );

        const { toTransitTokenAmount, transitFeeToken } = await this.getToTransitTokenAmount(
            fromTrade
        );

        const { toSlippageTolerance } = options;
        const toTrade = await this.calculateBestToTrade(
            toBlockchain,
            toTransitTokenAmount,
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

    private async calculateBestFromTrade(
        blockchain: CrossChainSupportedBlockchain,
        from: PriceTokenAmount,
        slippageTolerance: number
    ): Promise<ContractTrade> {
        const promises: Promise<CalculatedContractTrade>[] = this.contracts(blockchain).map(
            async contract => {
                const toToken = await contract.getTransitToken();
                const toPriceToken = new PriceToken({ ...toToken, price: new BigNumber(NaN) });
                return {
                    contract,
                    trade: await this.getCalculatedTrade(
                        contract,
                        from,
                        toPriceToken,
                        slippageTolerance
                    )
                };
            }
        );

        return this.getBestContractTrade(blockchain, slippageTolerance, promises);
    }

    private async getToTransitTokenAmount(fromTrade: ContractTrade): Promise<{
        toTransitTokenAmount: BigNumber;
        transitFeeToken: PriceTokenAmount;
    }> {
        const fromTransitToken = fromTrade.toToken;
        const fromTransitTokenMinAmount = fromTrade.toAmountMin;

        const feeInPercents = await fromTrade.contract.getFeeInPercents();
        const transitFeeToken = new PriceTokenAmount({
            ...fromTransitToken.asStruct,
            tokenAmount: fromTransitTokenMinAmount.multipliedBy(feeInPercents)
        });

        const toTransitTokenAmount = fromTransitTokenMinAmount.minus(transitFeeToken.tokenAmount);

        return {
            toTransitTokenAmount,
            transitFeeToken
        };
    }

    private async calculateBestToTrade(
        blockchain: CrossChainSupportedBlockchain,
        fromAmount: BigNumber,
        toToken: PriceToken,
        slippageTolerance: number
    ): Promise<ContractTrade> {
        const promises: Promise<CalculatedContractTrade>[] = this.contracts(blockchain).map(
            async contract => {
                const fromToken = await contract.getTransitToken();
                const from = new PriceTokenAmount({
                    ...fromToken,
                    tokenAmount: fromAmount,
                    price: new BigNumber(NaN)
                });
                return {
                    contract,
                    trade: await this.getCalculatedTrade(contract, from, toToken, slippageTolerance)
                };
            }
        );

        return this.getBestContractTrade(blockchain, slippageTolerance, promises);
    }

    private async getBestContractTrade(
        blockchain: CrossChainSupportedBlockchain,
        slippageTolerance: number,
        promises: Promise<CalculatedContractTrade>[]
    ): Promise<ContractTrade> {
        const calculatedContractTrade = await Promise.allSettled(promises).then(async results => {
            const sortedResults = results
                .map(result => {
                    if (result.status === 'fulfilled') {
                        return result.value;
                    }
                    return null;
                })
                .filter(notNull)
                .sort((a, b) => b.trade.toAmount.comparedTo(a.trade.toAmount));

            if (!sortedResults.length) {
                throw (results[0] as PromiseRejectedResult).reason;
            }
            return sortedResults[0];
        });
        const bestContract = calculatedContractTrade.contract;

        if ('instantTrade' in calculatedContractTrade.trade) {
            return new ItContractTrade(
                blockchain,
                bestContract,
                slippageTolerance,
                calculatedContractTrade.trade.instantTrade
            );
        }

        return new DirectContractTrade(
            blockchain,
            bestContract,
            calculatedContractTrade.trade.token
        );
    }

    private async getCalculatedTrade(
        contract: CrossChainContract,
        from: PriceTokenAmount,
        toToken: PriceToken,
        slippageTolerance: number
    ): Promise<ItCalculatedTrade | DirectCalculatedTrade> {
        if (!compareAddresses(from.address, toToken.address)) {
            const instantTrade = await contract.uniswapV2Provider.calculate(from, toToken, {
                gasCalculation: 'disabled',
                slippageTolerance
            });
            return {
                toAmount: instantTrade.to.tokenAmount,
                instantTrade
            };
        }

        return {
            toAmount: from.tokenAmount,
            token: from
        };
    }

    private async getMinMaxAmountsErrors(fromTrade: ContractTrade): Promise<MinMaxAmountsErrors> {
        const fromTransitTokenAmount = fromTrade.toAmount;
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

    private async getMinMaxTransitTokenAmounts(fromTrade: ContractTrade): Promise<MinMaxAmounts> {
        const fromTransitToken = await fromTrade.contract.getTransitToken();

        const getAmount = async (type: 'minAmount' | 'maxAmount'): Promise<BigNumber> => {
            const fromTransitTokenAmountAbsolute =
                await fromTrade.contract.getMinOrMaxTransitTokenAmount(type);
            const fromTransitTokenAmount = Web3Pure.fromWei(
                fromTransitTokenAmountAbsolute,
                fromTransitToken.decimals
            );

            if (type === 'minAmount') {
                if (fromTrade instanceof ItContractTrade) {
                    return fromTransitTokenAmount.dividedBy(fromTrade.slippageTolerance);
                }
                return fromTransitTokenAmount;
            }
            return fromTransitTokenAmount.minus(1);
        };

        return Promise.all([getAmount('minAmount'), getAmount('maxAmount')]).then(
            ([minAmount, maxAmount]) => ({
                minAmount,
                maxAmount
            })
        );
    }

    private async getTokenAmountForExactTransitTokenAmount(
        fromTrade: ContractTrade,
        transitTokenAmount: BigNumber
    ): Promise<BigNumber> {
        const transitToken = await fromTrade.contract.getTransitToken();
        if (
            compareAddresses(fromTrade.fromToken.address, transitToken.address) ||
            transitTokenAmount.eq(0)
        ) {
            return transitTokenAmount;
        }

        const instantTrade = await fromTrade.contract.uniswapV2Provider.calculateExactOutput(
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
        return instantTrade.from.tokenAmount;
    }

    private async getCryptoFeeTokenAndGasData(
        fromTrade: ContractTrade,
        toTrade: ContractTrade
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
