import { SupportedCrossChainBlockchain } from '@features/cross-chain/constants/SupportedCrossChainBlockchains';
import { CrossChainContract } from '@features/cross-chain/cross-chain-contract/CrossChainContract';
import BigNumber from 'bignumber.js';

export abstract class ContractTrade {
    public abstract get toAmount(): BigNumber;

    public abstract get toAmountMin(): BigNumber;

    protected constructor(
        public readonly blockchain: SupportedCrossChainBlockchain,
        public readonly contract: CrossChainContract
    ) {}
}
