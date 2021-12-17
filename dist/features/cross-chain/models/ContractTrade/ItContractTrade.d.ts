import { CrossChainSupportedBlockchain } from '../../constants/CrossChainSupportedBlockchains';
import { CrossChainContract } from '../../cross-chain-contract/cross-chain-contract';
import { ContractTrade } from './ContractTrade';
import BigNumber from 'bignumber.js';
import { PriceTokenAmount } from '../../../../core/blockchain/tokens/price-token-amount';
import { UniswapV2AbstractTrade } from '../../../swap/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import { Token } from '../../../../core/blockchain/tokens/token';
export declare class ItContractTrade extends ContractTrade {
    readonly blockchain: CrossChainSupportedBlockchain;
    readonly contract: CrossChainContract;
    readonly slippageTolerance: number;
    private readonly instantTrade;
    get fromToken(): PriceTokenAmount;
    get toToken(): PriceTokenAmount;
    get toAmount(): BigNumber;
    get toAmountWei(): BigNumber;
    get toAmountMin(): BigNumber;
    get path(): ReadonlyArray<Token>;
    constructor(blockchain: CrossChainSupportedBlockchain, contract: CrossChainContract, slippageTolerance: number, instantTrade: UniswapV2AbstractTrade);
}
