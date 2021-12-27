import { CrossChainSupportedBlockchain } from '../constants/cross-chain-supported-blockchains';
import { ContractData } from '../contract-data/contract-data';
import { ContractTrade } from './contract-trade';
import BigNumber from 'bignumber.js';
import { PriceTokenAmount } from '../../../core/blockchain/tokens/price-token-amount';
import { UniswapV2AbstractTrade } from '../../swap/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import { Token } from '../../../core/blockchain/tokens/token';
export declare class InstantTradeContractTrade extends ContractTrade {
    readonly slippageTolerance: number;
    private readonly instantTrade;
    get fromToken(): PriceTokenAmount;
    get toToken(): PriceTokenAmount;
    get toTokenAmountMin(): BigNumber;
    get path(): ReadonlyArray<Token>;
    constructor(blockchain: CrossChainSupportedBlockchain, contract: ContractData, providerIndex: number, slippageTolerance: number, instantTrade: UniswapV2AbstractTrade);
    getFirstPath(): string[];
    getSecondPath(): string[];
}
