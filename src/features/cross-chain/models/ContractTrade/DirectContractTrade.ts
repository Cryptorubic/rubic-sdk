import { SupportedCrossChainBlockchain } from '@features/cross-chain/constants/SupportedCrossChainBlockchain';
import { CrossChainContract } from '@features/cross-chain/cross-chain-contract/cross-chain-contract';
import { PriceTokenAmount } from '@core/blockchain/tokens/price-token-amount';
import { ContractTrade } from '@features/cross-chain/models/ContractTrade/ContractTrade';
import BigNumber from 'bignumber.js';

export class DirectContractTrade extends ContractTrade {
    public readonly fromToken: PriceTokenAmount = this.token;

    public readonly toToken: PriceTokenAmount = this.token;

    public readonly toAmount: BigNumber = this.token.tokenAmount;

    public readonly toAmountWei: BigNumber = this.token.weiAmount;

    public readonly toAmountMin: BigNumber = this.toAmount;

    public readonly path: string[] = [this.token.address];

    constructor(
        public readonly blockchain: SupportedCrossChainBlockchain,
        public readonly contract: CrossChainContract,
        private readonly token: PriceTokenAmount
    ) {
        super(blockchain, contract);
    }
}
