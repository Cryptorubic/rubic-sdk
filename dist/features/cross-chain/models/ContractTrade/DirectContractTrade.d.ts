import { CrossChainSupportedBlockchain } from '@features/cross-chain/constants/CrossChainSupportedBlockchains';
import { CrossChainContract } from '@features/cross-chain/cross-chain-contract/cross-chain-contract';
import { PriceTokenAmount } from '@core/blockchain/tokens/price-token-amount';
import { ContractTrade } from '@features/cross-chain/models/ContractTrade/ContractTrade';
import BigNumber from 'bignumber.js';
import { Token } from '@core/blockchain/tokens/token';
export declare class DirectContractTrade extends ContractTrade {
    readonly blockchain: CrossChainSupportedBlockchain;
    readonly contract: CrossChainContract;
    private readonly token;
    get fromToken(): PriceTokenAmount;
    get toToken(): PriceTokenAmount;
    get toAmount(): BigNumber;
    get toAmountWei(): BigNumber;
    get toAmountMin(): BigNumber;
    get path(): ReadonlyArray<Token>;
    constructor(blockchain: CrossChainSupportedBlockchain, contract: CrossChainContract, token: PriceTokenAmount);
}
