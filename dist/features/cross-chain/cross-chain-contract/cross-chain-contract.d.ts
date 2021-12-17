import { BLOCKCHAIN_NAME } from '@core/blockchain/models/BLOCKCHAIN_NAME';
import { Token } from '@core/blockchain/tokens/token';
import { PriceTokenAmount } from '@core/blockchain/tokens/price-token-amount';
import BigNumber from 'bignumber.js';
import { UniswapV2AbstractProvider } from '@features/swap/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-provider';
export declare class CrossChainContract {
    private readonly blockchain;
    readonly address: string;
    readonly uniswapV2Provider: UniswapV2AbstractProvider;
    private readonly web3Public;
    constructor(blockchain: BLOCKCHAIN_NAME, address: string, uniswapV2Provider: UniswapV2AbstractProvider);
    getNumOfContract(): Promise<number>;
    getTransitToken(): Promise<Token>;
    getFeeInPercents(): Promise<number>;
    getCryptoFeeToken(toContract: CrossChainContract): Promise<PriceTokenAmount>;
    getMinOrMaxTransitTokenAmount(type: 'minAmount' | 'maxAmount'): Promise<string>;
    isContractPaused(): Promise<boolean>;
    getMaxGasPrice(): Promise<BigNumber>;
}
