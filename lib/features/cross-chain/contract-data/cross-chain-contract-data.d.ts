import { BLOCKCHAIN_NAME } from '../../../core/blockchain/models/BLOCKCHAIN_NAME';
import { Token } from '../../../core/blockchain/tokens/token';
import { PriceTokenAmount } from '../../../core/blockchain/tokens/price-token-amount';
import BigNumber from 'bignumber.js';
import { ProviderData } from './models/provider-data';
import { UniswapV2AbstractProvider } from '../..';
/**
 * Class to work with readable methods of cross-chain contract.
 */
export declare class CrossChainContractData {
    private readonly blockchain;
    readonly address: string;
    readonly providersData: ProviderData[];
    private readonly web3Public;
    constructor(blockchain: BLOCKCHAIN_NAME, address: string, providersData: ProviderData[]);
    getProvider(providerIndex: number): UniswapV2AbstractProvider;
    getNumOfBlockchain(): Promise<number>;
    getTransitToken(): Promise<Token>;
    getFeeInPercents(): Promise<number>;
    getCryptoFeeToken(toContract: CrossChainContractData): Promise<PriceTokenAmount>;
    getMinOrMaxTransitTokenAmount(type: 'minAmount' | 'maxAmount'): Promise<string>;
    isPaused(): Promise<boolean>;
    getMaxGasPrice(): Promise<BigNumber>;
}
