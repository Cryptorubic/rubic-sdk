import { CrossChainContract } from '@features/cross-chain/cross-chain-contract/CrossChainContract';
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
import { UniswapV2LikeProvider } from '@features/swap/providers/common/uniswap-v2/uniswap-v2-like-provider';

import { Uniswapv2InstantTrade } from '@features/swap/models/instant-trade';
import { PriceTokenAmount } from '@core/blockchain/tokens/price-token-amount';
import { Web3Pure } from '@core/blockchain/web3-pure/web3-pure';
import { ContractTrade } from '@features/cross-chain/models/ContractTrade/ContractTrade';
import { DirectContractTrade } from '@features/cross-chain/models/ContractTrade/DirectContractTrade';
import { ItContractTrade } from '@features/cross-chain/models/ContractTrade/ItContractTrade';
import { CrossChainTrade } from '@features/cross-chain/cross-chain-trade/cross-chain-trade';

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

    private contracts: Record<SupportedCrossChainBlockchain, CrossChainContract[]>;

    constructor() {
        this.contracts = crossChainContracts;
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

        return new CrossChainTrade(fromTrade, toTrade);
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
                    trade: await this.getCalculatedTrade(
                        contract.uniswapV2Provider,
                        fromToken,
                        toToken,
                        fromAmount
                    )
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
                    trade: await this.getCalculatedTrade(
                        contract.uniswapV2Provider,
                        fromToken,
                        toToken,
                        fromAmount
                    )
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
                calculatedContractTrade.trade.instantTrade,
                slippage
            );
        }

        return new DirectContractTrade(
            blockchain,
            bestContract,
            calculatedContractTrade.trade.token
        );
    }

    private async getCalculatedTrade(
        uniswapV2Provider: UniswapV2LikeProvider,
        fromToken: Token,
        toToken: Token,
        fromAmount: BigNumber
    ): Promise<ItCalculatedTrade | DirectCalculatedTrade> {
        if (!compareAddresses(fromToken.address, toToken.address)) {
            const instantTrade = await uniswapV2Provider.calculateTrade(
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
}
