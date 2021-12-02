import { SupportedCrossChainBlockchain } from '@features/cross-chain/constants/SupportedCrossChainBlockchain';
import { CrossChainContract } from '@features/cross-chain/cross-chain-contract/cross-chain-contract';
import BigNumber from 'bignumber.js';
import { PriceTokenAmount } from '@core/blockchain/tokens/price-token-amount';
import { DeepReadonly } from '@common/utils/types/deep-readonly';

export abstract class ContractTrade {
    public abstract readonly fromToken: DeepReadonly<PriceTokenAmount>;

    public abstract readonly toToken: DeepReadonly<PriceTokenAmount>;

    public abstract readonly toAmount: DeepReadonly<BigNumber>;

    public abstract readonly toAmountWei: DeepReadonly<BigNumber>;

    public abstract readonly toAmountMin: DeepReadonly<BigNumber>;

    public abstract readonly path: DeepReadonly<string[]>;

    protected constructor(
        public readonly blockchain: SupportedCrossChainBlockchain,
        public readonly contract: CrossChainContract
    ) {}
}
