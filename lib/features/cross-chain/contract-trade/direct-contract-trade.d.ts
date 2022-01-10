import { CrossChainSupportedBlockchain } from '../constants/cross-chain-supported-blockchains';
import { CrossChainContractData } from '../contract-data/cross-chain-contract-data';
import { PriceTokenAmount } from '../../../core/blockchain/tokens/price-token-amount';
import { ContractTrade } from './contract-trade';
import BigNumber from 'bignumber.js';
export declare class DirectContractTrade extends ContractTrade {
    private readonly token;
    readonly fromToken: PriceTokenAmount;
    readonly toToken: PriceTokenAmount;
    readonly toTokenAmountMin: BigNumber;
    readonly path: PriceTokenAmount[];
    constructor(blockchain: CrossChainSupportedBlockchain, contract: CrossChainContractData, token: PriceTokenAmount);
    protected getFirstPath(): string[];
    protected getSecondPath(): string[];
}
