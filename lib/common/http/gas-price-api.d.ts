import { BLOCKCHAIN_NAME } from '../../core/blockchain/models/BLOCKCHAIN_NAME';
import BigNumber from 'bignumber.js';
import { HttpClient } from '../models/http-client';
declare const supportedBlockchains: readonly [import("../../core/blockchain/models/BLOCKCHAIN_NAME").MAINNET_BLOCKCHAIN_NAME.ETHEREUM, import("../../core/blockchain/models/BLOCKCHAIN_NAME").MAINNET_BLOCKCHAIN_NAME.AVALANCHE];
declare type SupportedBlockchain = typeof supportedBlockchains[number];
export declare class GasPriceApi {
    private readonly httpClient;
    /**
     * Gas price request interval in seconds.
     */
    private static readonly requestInterval;
    static isSupportedBlockchain(blockchain: BLOCKCHAIN_NAME): blockchain is SupportedBlockchain;
    /**
     * Gas price functions for different networks.
     */
    private readonly gasPriceFunctions;
    constructor(httpClient: HttpClient);
    /**
     * Gas price in Wei for selected blockchain.
     * @param blockchain Blockchain to get gas price from.
     * @return Promise<BigNumber> Average gas price in Wei.
     */
    getGasPrice(blockchain: BLOCKCHAIN_NAME): Promise<string>;
    /**
     * Gas price in Eth units for selected blockchain.
     * @param blockchain Blockchain to get gas price from.
     * @return Promise<BigNumber> Average gas price in Eth units.
     */
    getGasPriceInEthUnits(blockchain: BLOCKCHAIN_NAME): Promise<BigNumber>;
    /**
     * Gets Ethereum gas price from different APIs, sorted by priority.
     * @return Promise<BigNumber> Average gas price in Wei.
     */
    private fetchEthGas;
    /**
     * Gets Avalanche gas price.
     * @return Promise<BigNumber> Average gas price in Wei.
     */
    private fetchAvalancheGas;
}
export {};
