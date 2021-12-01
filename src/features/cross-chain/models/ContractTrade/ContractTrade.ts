import { SupportedCrossChainBlockchain } from '@features/cross-chain/constants/SupportedCrossChainBlockchain';
import { CrossChainContract } from '@features/cross-chain/cross-chain-contract/cross-chain-contract';
import BigNumber from 'bignumber.js';
import { PriceTokenAmount } from '@core/blockchain/tokens/price-token-amount';

export abstract class ContractTrade {
    public abstract get fromToken(): PriceTokenAmount;

    public abstract get toToken(): PriceTokenAmount;

    public abstract get toAmount(): BigNumber;

    public abstract get toAmountWei(): BigNumber;

    public abstract get toAmountMin(): BigNumber;

    public abstract get path(): string[];

    protected constructor(
        public readonly blockchain: SupportedCrossChainBlockchain,
        public readonly contract: CrossChainContract
    ) {}
}
