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

import { Uniswapv2InstantTrade } from '@features/swap/models/instant-trade';
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

interface CalculatedTrade {
    toAmount: BigNumber;
}

interface ItCalculatedTrade extends CalculatedTrade {
    instantTrade: Uniswapv2InstantTrade;
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
            throw Error(`Not supported blockchain: ${fromBlockchain}`);
        }
        if (!CrossChain.isSupportedBlockchain(toBlockchain)) {
            throw Error(`Not supported blockchain: ${toBlockchain}`);
        }

        const fromSlippage = 1 - options.fromSlippageTolerance;
        const fromTrade = await this.calculateBestFormTrade(
            fromBlockchain,
            fromToken,
            fromAmount,
            fromSlippage
        );

        const toTransitTokenAmount = await this.getToTransitTokenAmount(fromTrade, fromSlippage);

        const toSlippage = 1 - options.toSlippageTolerance;
        const toTrade = await this.calculateBestToTrade(
            toBlockchain,
            toTransitTokenAmount,
            toToken,
            toSlippage
        );

        const [{ cryptoFeeToken, gasData }, minMaxAmountsErrors] = await Promise.all([
            (async () => {
                const cryptoFeeToken = await fromTrade.contract.getCryptoFeeToken(toTrade.contract);
                const gasData = await CrossChainTrade.getGasData(
                    fromTrade,
                    toTrade,
                    cryptoFeeToken
                );
                return {
                    cryptoFeeToken,
                    gasData
                };
            })(),
            this.getMinMaxAmountsErrors(fromTrade)
        ]);

        return new CrossChainTrade(
            fromTrade,
            toTrade,
            cryptoFeeToken,
            minMaxAmountsErrors,
            gasData
        );
    }

    private async calculateBestFormTrade(
        blockchain: SupportedCrossChainBlockchain,
        fromToken: Token,
        fromAmount: BigNumber,
        slippage: number
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

        return this.getBestContractTrade(blockchain, slippage, promises);
    }

    private async getToTransitTokenAmount(fromTrade: ContractTrade, fromSlippage: number) {
        const feeInPercents = await fromTrade.contract.getFeeInPercents();
        const fromTransitTokenAmount = fromTrade.toAmountMin;

        let toTransitTokenAmount = fromTransitTokenAmount
            .multipliedBy(100 - feeInPercents)
            .dividedBy(100);

        if (fromTrade instanceof ItContractTrade) {
            toTransitTokenAmount = toTransitTokenAmount.multipliedBy(fromSlippage);
        }
        return toTransitTokenAmount;
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
        slippage: number,
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
                .filter(value => value !== null)
                .sort((a, b) => b!.trade.toAmount.comparedTo(a!.trade.toAmount));

            if (!sortedResults.length) {
                throw (results[0] as PromiseRejectedResult).reason;
            }
            return sortedResults[0]!;
        });
        const bestContract = calculatedContractTrade.contract;

        if ('instantTrade' in calculatedContractTrade.trade) {
            return new ItContractTrade(
                blockchain,
                bestContract,
                slippage,
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

        const token = await PriceTokenAmount.createTokenFromToken({
            ...fromToken,
            weiAmount: new BigNumber(Web3Pure.toWei(fromAmount, fromToken.decimals))
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
                    return fromTransitTokenAmount.plus(1).dividedBy(fromTrade.slippage);
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
}
