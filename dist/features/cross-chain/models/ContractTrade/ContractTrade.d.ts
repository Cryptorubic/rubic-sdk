import { CrossChainSupportedBlockchain } from '@features/cross-chain/constants/CrossChainSupportedBlockchains';
import { CrossChainContract } from '@features/cross-chain/cross-chain-contract/cross-chain-contract';
import BigNumber from 'bignumber.js';
import { PriceTokenAmount } from '@core/blockchain/tokens/price-token-amount';
import { Token } from '@core/blockchain/tokens/token';
export declare abstract class ContractTrade {
    readonly blockchain: CrossChainSupportedBlockchain;
    readonly contract: CrossChainContract;
    abstract get fromToken(): PriceTokenAmount;
    abstract get toToken(): PriceTokenAmount;
    abstract get toAmount(): BigNumber;
    abstract get toAmountWei(): BigNumber;
    abstract get toAmountMin(): BigNumber;
    abstract get path(): ReadonlyArray<Token>;
    protected constructor(blockchain: CrossChainSupportedBlockchain, contract: CrossChainContract);
}
