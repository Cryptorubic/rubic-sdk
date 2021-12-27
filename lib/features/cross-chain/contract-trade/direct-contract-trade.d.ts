import { CrossChainSupportedBlockchain } from '../constants/cross-chain-supported-blockchains';
import { ContractData } from '../contract-data/contract-data';
import { PriceTokenAmount } from '../../../core/blockchain/tokens/price-token-amount';
import { ContractTrade } from './contract-trade';
import BigNumber from 'bignumber.js';
import { Token } from '../../../core/blockchain/tokens/token';
export declare class DirectContractTrade extends ContractTrade {
    private readonly token;
    get fromToken(): PriceTokenAmount;
    get toToken(): PriceTokenAmount;
    get toTokenAmountMin(): BigNumber;
    get path(): ReadonlyArray<Token>;
    constructor(blockchain: CrossChainSupportedBlockchain, contract: ContractData, token: PriceTokenAmount);
    getFirstPath(): string[];
    getSecondPath(): string[];
}
