import { SupportedCrossChainBlockchain } from '@features/cross-chain/constants/SupportedCrossChainBlockchains';
import { CrossChainContract } from '@features/cross-chain/cross-chain-contract/CrossChainContract';
import { Uniswapv2InstantTrade } from '@features/swap/models/instant-trade';
import { ContractTrade } from '@features/cross-chain/models/ContractTrade/ContractTrade';
import BigNumber from 'bignumber.js';

export class ItContractTrade extends ContractTrade {
    public get toAmount(): BigNumber {
        return this.instantTrade.to.tokenAmount;
    }

    public get toAmountMin(): BigNumber {
        return this.toAmount.multipliedBy(this.slippage);
    }

    constructor(
        public readonly blockchain: SupportedCrossChainBlockchain,
        public readonly contract: CrossChainContract,
        private readonly slippage: number,
        private readonly instantTrade: Uniswapv2InstantTrade
    ) {
        super(blockchain, contract);
    }
}
