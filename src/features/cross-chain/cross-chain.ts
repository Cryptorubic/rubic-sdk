import { CrossChainContract } from '@features/cross-chain/cross-chain-contract/cross-chain-contract';
import {
    SupportedCrossChainBlockchain,
    supportedCrossChainBlockchain
} from '@features/cross-chain/constants/SupportedCrossChainBlockchain';
import { crossChainContracts } from '@features/cross-chain/constants/crossChainContracts';
import { Token } from '@core/blockchain/tokens/token';
import BigNumber from 'bignumber.js';
import { CrossChainOptions } from '@features/cross-chain/models/CrossChainOptions';
import { BLOCKCHAIN_NAME } from '@core/blockchain/models/BLOCKCHAIN_NAME';
import { compareAddresses } from '@common/utils/blockchain';
import { PriceTokenAmount } from '@core/blockchain/tokens/price-token-amount';
import { Web3Pure } from '@core/blockchain/web3-pure/web3-pure';
import { ContractTrade } from '@features/cross-chain/models/ContractTrade/ContractTrade';
import { DirectContractTrade } from '@features/cross-chain/models/ContractTrade/DirectContractTrade';
import { ItContractTrade } from '@features/cross-chain/models/ContractTrade/ItContractTrade';
import { CrossChainTrade } from '@features/cross-chain/cross-chain-trade/cross-chain-trade';
import { Injector } from '@core/sdk/injector';
import { MinMaxAmountsErrors } from '@features/cross-chain/cross-chain-trade/models/MinMaxAmountsErrors';
import { InsufficientLiquidityError } from '@common/errors/swap/insufficient-liquidity-error';
import { MinMaxAmounts } from '@features/cross-chain/models/MinMaxAmounts';
import { Web3Public } from '@core/blockchain/web3-public/web3-public';
import { GasData } from '@common/models/GasData';
import { NotSupportedBlockchain } from '@common/errors/swap/NotSupportedBlockchain';
import { notNull } from '@common/utils/object';
import { UniSwapV2Trade } from '@features/swap/trades/ethereum/uni-swap-v2/uni-swap-v2-trade';

interface CalculatedTrade {
    toAmount: BigNumber;
}

interface ItCalculatedTrade extends CalculatedTrade {
    instantTrade: UniSwapV2Trade;
}

interface DirectCalculatedTrade extends CalculatedTrade {
    token: PriceTokenAmount;
}

interface CalculatedContractTrade {
    contract: CrossChainContract;
    trade: ItCalculatedTrade | DirectCalculatedTrade;
}

export class CrossChain {
    public static isSupportedBlockchain(
        blockchain: BLOCKCHAIN_NAME
    ): blockchain is SupportedCrossChainBlockchain {
        return supportedCrossChainBlockchain.some(
            supportedBlockchain => supportedBlockchain === blockchain
        );
    }

    private readonly contracts: Record<SupportedCrossChainBlockchain, CrossChainContract[]>;

    private readonly getWeb3Public: (blockchain: BLOCKCHAIN_NAME) => Web3Public;

    constructor() {
        this.contracts = crossChainContracts;
        this.getWeb3Public = Injector.web3PublicService.getWeb3Public;
    }

    public async calculateTrade(
        fromToken: Token,
        toToken: Token,
        fromAmount: BigNumber,
        options: CrossChainOptions
    ): Promise<CrossChainTrade> {
        const fromBlockchain = fromToken.blockchain;
        const toBlockchain = toToken.blockchain;
        if (!CrossChain.isSupportedBlockchain(fromBlockchain)) {
            throw new NotSupportedBlockchain();
        }
        if (!CrossChain.isSupportedBlockchain(toBlockchain)) {
            throw new NotSupportedBlockchain();
        }

        const { fromSlippageTolerance } = options;
        const fromTrade = await this.calculateBestFormTrade(
            fromBlockchain,
            fromToken,
            fromAmount,
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

    private async calculateBestFormTrade(
        blockchain: SupportedCrossChainBlockchain,
        fromToken: Token,
        fromAmount: BigNumber,
        slippageTolerance: number
    ): Promise<ContractTrade> {
        const promises: Promise<CalculatedContractTrade>[] = this.contracts[blockchain].map(
            async contract => {
                const toToken = await contract.getTransitToken();
                return {
                    contract,
                    trade: await this.getCalculatedTrade(contract, fromToken, toToken, fromAmount)
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
        blockchain: SupportedCrossChainBlockchain,
        fromAmount: BigNumber,
        toToken: Token,
        slippage: number
    ): Promise<ContractTrade> {
        const promises: Promise<CalculatedContractTrade>[] = this.contracts[blockchain].map(
            async contract => {
                const fromToken = await contract.getTransitToken();
                return {
                    contract,
                    trade: await this.getCalculatedTrade(contract, fromToken, toToken, fromAmount)
                };
            }
        );

        return this.getBestContractTrade(blockchain, slippage, promises);
    }

    private async getBestContractTrade(
        blockchain: SupportedCrossChainBlockchain,
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
        fromToken: Token,
        toToken: Token,
        fromAmount: BigNumber
    ): Promise<ItCalculatedTrade | DirectCalculatedTrade> {
        if (!compareAddresses(fromToken.address, toToken.address)) {
            const instantTrade = await contract.uniswapV2Provider.calculateTrade(
                fromToken,
                fromAmount,
                toToken,
                'output',
                {
                    shouldCalculateGas: false,
                    rubicOptimisation: true
                }
            );
            return {
                toAmount: instantTrade.to.tokenAmount,
                instantTrade
            };
        }

        const token = await PriceTokenAmount.createFromToken({
            ...fromToken,
            tokenAmount: fromAmount
        });
        return {
            toAmount: fromAmount,
            token
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
        if (compareAddresses(fromTrade.fromToken.address, transitToken.address)) {
            return transitTokenAmount;
        }

        const amountAbsolute = transitTokenAmount.gt(0)
            ? await fromTrade.contract.uniswapV2Provider.getFromAmount(
                  fromTrade.fromToken,
                  transitToken,
                  transitTokenAmount
              )
            : 0;
        return Web3Pure.fromWei(amountAbsolute, fromTrade.fromToken.decimals);
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
