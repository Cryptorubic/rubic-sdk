import { Cache } from 'src/common/utils/decorators';
import pTimeout from 'src/common/utils/p-timeout';
import { BLOCKCHAIN_NAME, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { HttpClient } from 'src/core/http-client/models/http-client';
import { Injector } from 'src/core/injector/injector';

import { GasPrice } from '../blockchain/web3-public-service/web3-public/evm-web3-public/models/gas-price';
import { EIP1559CompatibleBlockchains } from './constants/eip1559-compatible-blockchains';
import { OneInchGasResponse } from './models/1inch-gas-response';

/**
 * Uses different api or web3 to retrieve current gas price.
 */
export class GasPriceApi {
    /**
     * Gas price request interval in seconds.
     */
    private static readonly requestInterval = 15_000;

    constructor(private readonly httpClient: HttpClient) {}

    /**
     * Gets gas price in Wei for selected blockchain.
     * @param blockchain Blockchain to get gas price from.
     */
    public getGasPrice(blockchain: EvmBlockchainName): Promise<GasPrice> {
        if (blockchain === BLOCKCHAIN_NAME.ETHEREUM) {
            return this.fetchEthGas();
        }
        return this.fetchGas(blockchain);
    }

    /**
     * Gets gas price in Eth units for selected blockchain.
     * @param blockchain Blockchain to get gas price from.
     */
    public async getGasPriceInEthUnits(blockchain: EvmBlockchainName): Promise<GasPrice> {
        return await this.getGasPrice(blockchain);
    }

    /**
     * Gets Ethereum gas price from different APIs, sorted by priority.
     * @returns Average gas price in Wei.
     */
    @Cache({
        maxAge: GasPriceApi.requestInterval
    })
    private async fetchEthGas(): Promise<GasPrice> {
        const requestTimeout = 3000;

        try {
            const response: OneInchGasResponse = await pTimeout(
                this.httpClient.get('https://gas-price-api.1inch.io/v1.2/1'),
                requestTimeout
            );
            return {
                baseFee: response.baseFee,
                maxFeePerGas: response.high.maxFeePerGas,
                maxPriorityFeePerGas: response.high.maxPriorityFee
            };
        } catch (_err) {}

        const web3Public = Injector.web3PublicService.getWeb3Public(BLOCKCHAIN_NAME.ETHEREUM);
        return web3Public.getPriorityFeeGas();
    }

    /**
     * Gets gas price from web3.
     * @returns Average gas price in Wei.
     */
    @Cache({
        maxAge: GasPriceApi.requestInterval
    })
    private async fetchGas(blockchain: EvmBlockchainName): Promise<GasPrice> {
        const web3Public = Injector.web3PublicService.getWeb3Public(blockchain);
        if (EIP1559CompatibleBlockchains[blockchain]) {
            return await web3Public.getPriorityFeeGas();
        }
        return {
            gasPrice: await web3Public.getGasPrice()
        };
    }
}
