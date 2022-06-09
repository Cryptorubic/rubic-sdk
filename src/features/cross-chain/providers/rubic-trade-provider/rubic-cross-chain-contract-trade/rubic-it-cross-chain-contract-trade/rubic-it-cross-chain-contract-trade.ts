import { BlockchainName, PriceTokenAmount } from 'src/core';
import { OneinchTrade } from '@features/instant-trades/dexes/common/oneinch-common/oneinch-trade';
import { UniswapV3AbstractTrade } from '@features/instant-trades/dexes/common/uniswap-v3-abstract/uniswap-v3-abstract-trade';
import { UniswapV2AbstractTrade } from '@features/instant-trades/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import { CrossChainInstantTrade } from '@features/cross-chain/providers/rubic-trade-provider/rubic-cross-chain-contract-trade/common/cross-chain-instant-trade';
import { CrossChainOneinchTrade } from '@features/cross-chain/providers/rubic-trade-provider/rubic-cross-chain-contract-trade/rubic-it-cross-chain-contract-trade/rubic-cross-chain-instant-trade/cross-chain-oneinch-trade';
import { CrossChainUniswapV3Trade } from '@features/cross-chain/providers/rubic-trade-provider/rubic-cross-chain-contract-trade/rubic-it-cross-chain-contract-trade/rubic-cross-chain-instant-trade/cross-chain-uniswap-v3-trade';
import { CrossChainUniswapV2Trade } from '@features/cross-chain/providers/rubic-trade-provider/rubic-cross-chain-contract-trade/rubic-it-cross-chain-contract-trade/rubic-cross-chain-instant-trade/cross-chain-uniswap-v2-trade';
import { CrossChainAlgebraTrade } from '@features/cross-chain/providers/rubic-trade-provider/rubic-cross-chain-contract-trade/rubic-it-cross-chain-contract-trade/rubic-cross-chain-instant-trade/cross-chain-algebra-trade';
import { CrossChainContractData } from '@features/cross-chain/providers/common/celer-rubic/cross-chain-contract-data';
import { RubicCrossChainContractTrade } from '@features/cross-chain/providers/rubic-trade-provider/rubic-cross-chain-contract-trade/rubic-cross-chain-contract-trade';
import { RubicCrossChainSupportedInstantTrade } from '@features/cross-chain/providers/rubic-trade-provider/rubic-cross-chain-contract-trade/rubic-it-cross-chain-contract-trade/rubic-cross-chain-instant-trade/rubic-cross-chain-supported-instant-trade';
import BigNumber from 'bignumber.js';

export class RubicItCrossChainContractTrade extends RubicCrossChainContractTrade {
    public readonly fromToken: PriceTokenAmount;

    public readonly toToken: PriceTokenAmount;

    public readonly toTokenAmountMin: BigNumber;

    private readonly crossChainInstantTrade: CrossChainInstantTrade;

    constructor(
        blockchain: BlockchainName,
        contract: CrossChainContractData,
        providerIndex: number,
        public readonly slippage: number,
        private readonly instantTrade: RubicCrossChainSupportedInstantTrade
    ) {
        super(blockchain, contract, providerIndex);
        this.fromToken = this.instantTrade.from;
        this.toToken = this.instantTrade.to;
        this.toTokenAmountMin = this.toToken.tokenAmount.multipliedBy(1 - this.slippage);
        this.crossChainInstantTrade = this.getTrade();
    }

    protected getFirstPath(): string[] | string {
        return this.crossChainInstantTrade.getFirstPath();
    }

    public getSecondPath(): string[] {
        return this.crossChainInstantTrade.getSecondPath();
    }

    protected modifyArgumentsForProvider(
        methodArguments: unknown[][],
        walletAddress: string,
        swapTokenWithFee: boolean
    ): Promise<void> {
        return this.crossChainInstantTrade.modifyArgumentsForProvider(
            methodArguments,
            walletAddress,
            swapTokenWithFee
        );
    }

    private getTrade(): CrossChainInstantTrade {
        if (this.instantTrade instanceof UniswapV2AbstractTrade) {
            return new CrossChainUniswapV2Trade(this.instantTrade);
        }
        if (this.instantTrade instanceof OneinchTrade) {
            return new CrossChainOneinchTrade(this.instantTrade);
        }
        if (this.instantTrade instanceof UniswapV3AbstractTrade) {
            return new CrossChainUniswapV3Trade(this.instantTrade);
        }
        return new CrossChainAlgebraTrade(this.instantTrade);
    }
}
