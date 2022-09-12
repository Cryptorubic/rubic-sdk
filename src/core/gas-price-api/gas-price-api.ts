import pTimeout from 'src/common/utils/p-timeout';
import { BLOCKCHAIN_NAME, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { Injector } from 'src/core/sdk/injector';
import BigNumber from 'bignumber.js';
import { HttpClient } from 'src/core/sdk/models/http-client';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { Cache } from 'src/common/utils/decorators';

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
    public getGasPrice(blockchain: EvmBlockchainName): Promise<string> {
        if (blockchain === BLOCKCHAIN_NAME.ETHEREUM) {
            return this.fetchEthGas();
        }
        return this.fetchGas(blockchain);
    }

    /**
     * Gets gas price in Eth units for selected blockchain.
     * @param blockchain Blockchain to get gas price from.
     */
    public async getGasPriceInEthUnits(blockchain: EvmBlockchainName): Promise<BigNumber> {
        return Web3Pure.fromWei(await this.getGasPrice(blockchain));
    }

    /**
     * Gets Ethereum gas price from different APIs, sorted by priority.
     * @returns Average gas price in Wei.
     */
    @Cache({
        maxAge: GasPriceApi.requestInterval
    })
    private async fetchEthGas(): Promise<string> {
        const requestTimeout = 3000;

        try {
            const response: { medium: { maxFeePerGas: string } } = await pTimeout(
                this.httpClient.get('https://gas-price-api.1inch.io/v1.2/1'),
                requestTimeout
            );
            return response.medium.maxFeePerGas;
        } catch (_err) {}

        try {
            const response: { average: number } = await pTimeout(
                this.httpClient.get('https://ethgasstation.info/api/ethgasAPI.json'),
                requestTimeout
            );
            return new BigNumber(response.average / 10).multipliedBy(10 ** 9).toFixed(0);
        } catch (_err) {}

        const web3Public = Injector.web3PublicService.getWeb3Public(BLOCKCHAIN_NAME.ETHEREUM);
        return web3Public.getGasPrice();
    }

    /**
     * Gets gas price from web3.
     * @returns Average gas price in Wei.
     */
    @Cache({
        maxAge: GasPriceApi.requestInterval
    })
    private fetchGas(blockchain: EvmBlockchainName): Promise<string> {
        const web3Public = Injector.web3PublicService.getWeb3Public(blockchain);
        return web3Public.getGasPrice();
    }
}
