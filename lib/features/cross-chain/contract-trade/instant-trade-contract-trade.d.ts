import { CrossChainSupportedBlockchain } from '../constants/cross-chain-supported-blockchains';
import { CrossChainContractData } from '../contract-data/cross-chain-contract-data';
import { ContractTrade } from './contract-trade';
import { UniswapV2AbstractTrade } from '../../swap/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import BigNumber from 'bignumber.js';
import { PriceTokenAmount, Token } from '../../../core';
export declare class InstantTradeContractTrade extends ContractTrade {
    readonly slippageTolerance: number;
    private readonly instantTrade;
    readonly fromToken: PriceTokenAmount;
    readonly toToken: PriceTokenAmount;
    readonly toTokenAmountMin: BigNumber;
    readonly path: ReadonlyArray<Token>;
    constructor(blockchain: CrossChainSupportedBlockchain, contract: CrossChainContractData, providerIndex: number, slippageTolerance: number, instantTrade: UniswapV2AbstractTrade);
    protected getFirstPath(): string[];
    protected getSecondPath(): string[];
}
