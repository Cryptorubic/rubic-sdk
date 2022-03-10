import { CrossChainSupportedBlockchain } from '@features/cross-chain/constants/cross-chain-supported-blockchains';
import { CrossChainContractData } from '@features/cross-chain/cross-chain-contract-data/cross-chain-contract-data';
import { CrossChainContractTrade } from '@features/cross-chain/cross-chain-contract-trade/cross-chain-contract-trade';
import BigNumber from 'bignumber.js';
import { PriceTokenAmount } from 'src/core';
import { OneinchTrade } from '@features/instant-trades/dexes/common/oneinch-common/oneinch-trade';
import { UniswapV3AbstractTrade } from '@features/instant-trades/dexes/common/uniswap-v3-abstract/uniswap-v3-abstract-trade';
import { UniswapV2AbstractTrade } from '@features/instant-trades/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import { CrossChainSupportedInstantTrade } from '@features/cross-chain/models/cross-chain-supported-instant-trade';
import { CrossChainInstantTrade } from '@features/cross-chain/cross-chain-contract-trade/it-cross-chain-contract-trade/cross-chain-instant-trade/models/cross-chain-instant-trade';
import { CrossChainOneinchTrade } from '@features/cross-chain/cross-chain-contract-trade/it-cross-chain-contract-trade/cross-chain-instant-trade/cross-chain-oneinch-trade';
import { CrossChainUniswapV3Trade } from '@features/cross-chain/cross-chain-contract-trade/it-cross-chain-contract-trade/cross-chain-instant-trade/cross-chain-uniswap-v3-trade';
import { CrossChainUniswapV2Trade } from '@features/cross-chain/cross-chain-contract-trade/it-cross-chain-contract-trade/cross-chain-instant-trade/cross-chain-uniswap-v2-trade';
import { CrossChainAlgebraTrade } from '@features/cross-chain/cross-chain-contract-trade/it-cross-chain-contract-trade/cross-chain-instant-trade/cross-chain-algebra-trade';

export class ItCrossChainContractTrade extends CrossChainContractTrade {
    public readonly fromToken: PriceTokenAmount;

    public readonly toToken: PriceTokenAmount;

    public readonly toTokenAmountMin: BigNumber;

    private readonly crossChainInstantTrade: CrossChainInstantTrade;

    constructor(
        blockchain: CrossChainSupportedBlockchain,
        contract: CrossChainContractData,
        providerIndex: number,
        public readonly slippageTolerance: number,
        private readonly instantTrade: CrossChainSupportedInstantTrade
    ) {
        super(blockchain, contract, providerIndex);

        this.fromToken = this.instantTrade.from;
        this.toToken = this.instantTrade.to;
        this.toTokenAmountMin = this.toToken.tokenAmount.multipliedBy(1 - this.slippageTolerance);

        if (this.instantTrade instanceof UniswapV2AbstractTrade) {
            this.crossChainInstantTrade = new CrossChainUniswapV2Trade(this.instantTrade);
        } else if (this.instantTrade instanceof OneinchTrade) {
            this.crossChainInstantTrade = new CrossChainOneinchTrade(this.instantTrade);
        } else if (this.instantTrade instanceof UniswapV3AbstractTrade) {
            this.crossChainInstantTrade = new CrossChainUniswapV3Trade(this.instantTrade);
        } else {
            this.crossChainInstantTrade = new CrossChainAlgebraTrade(this.instantTrade);
        }
    }

    protected getFirstPath(): string[] | string {
        return this.crossChainInstantTrade.getFirstPath();
    }

    protected getSecondPath(): string[] {
        return this.crossChainInstantTrade.getSecondPath();
    }

    protected modifyArgumentsForProvider(
        methodArguments: unknown[][],
        walletAddress: string
    ): Promise<void> {
        return this.crossChainInstantTrade.modifyArgumentsForProvider(
            methodArguments,
            walletAddress
        );
    }
}
