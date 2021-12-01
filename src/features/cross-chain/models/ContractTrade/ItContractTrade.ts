import { SupportedCrossChainBlockchain } from '@features/cross-chain/constants/SupportedCrossChainBlockchain';
import { CrossChainContract } from '@features/cross-chain/cross-chain-contract/cross-chain-contract';
import { Uniswapv2InstantTrade } from '@features/swap/models/instant-trade';
import { ContractTrade } from '@features/cross-chain/models/ContractTrade/ContractTrade';
import BigNumber from 'bignumber.js';
import { PriceTokenAmount } from '@core/blockchain/tokens/price-token-amount';

export class ItContractTrade extends ContractTrade {
    public get fromToken(): PriceTokenAmount {
        return this.instantTrade.from;
    }

    public get toToken(): PriceTokenAmount {
        return this.instantTrade.to;
    }

    public get toAmount(): BigNumber {
        return this.instantTrade.to.tokenAmount;
    }

    public get toAmountWei(): BigNumber {
        return this.instantTrade.to.weiAmount;
    }

    public get toAmountMin(): BigNumber {
        return this.toAmount.multipliedBy(this.slippage);
    }

    public get path(): string[] {
        return this.instantTrade.path;
    }

    constructor(
        public readonly blockchain: SupportedCrossChainBlockchain,
        public readonly contract: CrossChainContract,
        public readonly slippage: number,
        private readonly instantTrade: Uniswapv2InstantTrade
    ) {
        super(blockchain, contract);
    }
}
