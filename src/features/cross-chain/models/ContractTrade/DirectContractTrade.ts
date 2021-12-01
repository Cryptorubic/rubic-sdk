import { SupportedCrossChainBlockchain } from '@features/cross-chain/constants/SupportedCrossChainBlockchain';
import { CrossChainContract } from '@features/cross-chain/cross-chain-contract/CrossChainContract';
import { PriceTokenAmount } from '@core/blockchain/tokens/price-token-amount';
import { ContractTrade } from '@features/cross-chain/models/ContractTrade/ContractTrade';
import BigNumber from 'bignumber.js';

export class DirectContractTrade extends ContractTrade {
    public get toAmount(): BigNumber {
        return this.token.tokenAmount;
    }

    public get toAmountMin(): BigNumber {
        return this.toAmount;
    }

    constructor(
        public readonly blockchain: SupportedCrossChainBlockchain,
        public readonly contract: CrossChainContract,
        private readonly token: PriceTokenAmount
    ) {
        super(blockchain, contract);
    }
}
