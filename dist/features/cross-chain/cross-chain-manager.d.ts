import { CrossChainSupportedBlockchain } from './constants/CrossChainSupportedBlockchains';
import { Token } from '../../core/blockchain/tokens/token';
import { CrossChainOptions } from './models/cross-chain-options';
import { BLOCKCHAIN_NAME } from '../../core/blockchain/models/BLOCKCHAIN_NAME';
import { PriceTokenAmount } from '../../core/blockchain/tokens/price-token-amount';
import { CrossChainTrade } from './cross-chain-trade/cross-chain-trade';
import { PriceToken } from '../../core/blockchain/tokens/price-token';
export declare class CrossChainManager {
    static isSupportedBlockchain(blockchain: BLOCKCHAIN_NAME): blockchain is CrossChainSupportedBlockchain;
    private readonly contracts;
    private readonly getWeb3Public;
    constructor();
    calculateTrade(fromToken: Token | {
        address: string;
        blockchain: BLOCKCHAIN_NAME;
    }, fromAmount: string, toToken: Token | string, options?: CrossChainOptions): Promise<CrossChainTrade>;
    private getFullOptions;
    calculateTradeFromTokens(from: PriceTokenAmount, toToken: PriceToken, options: CrossChainOptions): Promise<CrossChainTrade>;
    private calculateBestFromTrade;
    private getToTransitTokenAmount;
    private calculateBestToTrade;
    private getBestContractTrade;
    private getCalculatedTrade;
    private getMinMaxAmountsErrors;
    private getMinMaxTransitTokenAmounts;
    private getTokenAmountForExactTransitTokenAmount;
    private getCryptoFeeTokenAndGasData;
}
