import { CrossChainSupportedBlockchain } from '@features/cross-chain/constants/CrossChainSupportedBlockchains';
import { CrossChainContract } from '@features/cross-chain/cross-chain-contract/cross-chain-contract';
import BigNumber from 'bignumber.js';
import { PriceTokenAmount } from '@core/blockchain/tokens/price-token-amount';
import { Token } from '@core/blockchain/tokens/token';

export abstract class ContractTrade {
    public abstract get fromToken(): PriceTokenAmount;

    public abstract get toToken(): PriceTokenAmount;

    public abstract get toAmount(): BigNumber;

    public abstract get toAmountWei(): BigNumber;

    public abstract get toAmountMin(): BigNumber;

    public abstract get path(): ReadonlyArray<Token>;

    protected constructor(
        public readonly blockchain: CrossChainSupportedBlockchain,
        public readonly contract: CrossChainContract
    ) {}
}
