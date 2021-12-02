import { SupportedCrossChainBlockchain } from '@features/cross-chain/constants/SupportedCrossChainBlockchain';
import { CrossChainContract } from '@features/cross-chain/cross-chain-contract/cross-chain-contract';
import { Uniswapv2InstantTrade } from '@features/swap/models/instant-trade';
import { ContractTrade } from '@features/cross-chain/models/ContractTrade/ContractTrade';
import BigNumber from 'bignumber.js';
import { PriceTokenAmount } from '@core/blockchain/tokens/price-token-amount';

export class ItContractTrade extends ContractTrade {
    public readonly fromToken: PriceTokenAmount = this.instantTrade.from;

    public readonly toToken: PriceTokenAmount = this.instantTrade.to;

    public readonly toAmount: BigNumber = this.instantTrade.to.tokenAmount;

    public readonly toAmountWei: BigNumber = this.instantTrade.to.weiAmount;

    public readonly toAmountMin: BigNumber = this.toAmount.multipliedBy(this.slippage);

    public readonly path: string[] = this.instantTrade.path;

    constructor(
        public readonly blockchain: SupportedCrossChainBlockchain,
        public readonly contract: CrossChainContract,
        public readonly slippage: number,
        private readonly instantTrade: Uniswapv2InstantTrade
    ) {
        super(blockchain, contract);
    }
}
