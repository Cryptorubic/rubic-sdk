import { CrossChainSupportedBlockchain } from './constants/cross-chain-supported-blockchains';
import { Token } from '../../core/blockchain/tokens/token';
import { CrossChainOptions } from './models/cross-chain-options';
import { BLOCKCHAIN_NAME } from '../../core/blockchain/models/BLOCKCHAIN_NAME';
import { CrossChainTrade } from './cross-chain-trade/cross-chain-trade';
export declare class CrossChainManager {
    static isSupportedBlockchain(blockchain: BLOCKCHAIN_NAME): blockchain is CrossChainSupportedBlockchain;
    private readonly contracts;
    constructor();
    calculateTrade(fromToken: Token | {
        address: string;
        blockchain: BLOCKCHAIN_NAME;
    }, fromAmount: string | number, toToken: Token | {
        address: string;
        blockchain: BLOCKCHAIN_NAME;
    }, options?: CrossChainOptions): Promise<CrossChainTrade>;
    private getFullOptions;
    private calculateTradeFromTokens;
    private calculateBestTrade;
    private getToTransitTokenAmount;
    private getCalculatedTrade;
    private getMinMaxAmountsErrors;
    private getMinMaxTransitTokenAmounts;
    private getTokenAmountForExactTransitTokenAmount;
    private getCryptoFeeTokenAndGasData;
}
