import pTimeout from '@common/utils/p-timeout';
import { BLOCKCHAIN_NAME } from '@core/blockchain/models/BLOCKCHAIN_NAME';
import { Injector } from '@core/sdk/injector';
import { Cache } from 'src/common';
import BigNumber from 'bignumber.js';
import { RubicSdkError } from '@common/errors/rubic-sdk.error';
import { HttpClient } from '@common/models/http-client';
import { Web3Pure } from '@core/blockchain/web3-pure/web3-pure';

const supportedBlockchains = [BLOCKCHAIN_NAME.ETHEREUM, BLOCKCHAIN_NAME.AVALANCHE] as const;

type SupportedBlockchain = typeof supportedBlockchains[number];

export class GasPriceApi {
    /**
     * Gas price request interval in seconds.
     */
    private static readonly requestInterval = 15_000;

    public static isSupportedBlockchain(
        blockchain: BLOCKCHAIN_NAME
    ): blockchain is SupportedBlockchain {
        return supportedBlockchains.some(supBlockchain => supBlockchain === blockchain);
    }

    /**
     * Gas price functions for different networks.
     */
    private readonly gasPriceFunctions: Record<SupportedBlockchain, () => Promise<string>>;

    constructor(private readonly httpClient: HttpClient) {
        this.gasPriceFunctions = {
            [BLOCKCHAIN_NAME.ETHEREUM]: this.fetchEthGas.bind(this),
            [BLOCKCHAIN_NAME.AVALANCHE]: this.fetchAvalancheGas.bind(this)
        };
    }

    /**
     * Gas price in Wei for selected blockchain.
     * @param blockchain Blockchain to get gas price from.
     * @return Promise<BigNumber> Average gas price in Wei.
     */
    public getGasPrice(blockchain: BLOCKCHAIN_NAME): Promise<string> {
        if (!GasPriceApi.isSupportedBlockchain(blockchain)) {
            throw new RubicSdkError(`Blockchain ${blockchain} is not supported by gas-price-api`);
        }
        return this.gasPriceFunctions[blockchain]();
    }

    /**
     * Gas price in Eth units for selected blockchain.
     * @param blockchain Blockchain to get gas price from.
     * @return Promise<BigNumber> Average gas price in Eth units.
     */
    public async getGasPriceInEthUnits(blockchain: BLOCKCHAIN_NAME): Promise<BigNumber> {
        return Web3Pure.fromWei(await this.getGasPrice(blockchain));
    }

    /**
     * Gets Ethereum gas price from different APIs, sorted by priority.
     * @return Promise<BigNumber> Average gas price in Wei.
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
     * Gets Avalanche gas price.
     * @return Promise<BigNumber> Average gas price in Wei.
     */
    @Cache({
        maxAge: GasPriceApi.requestInterval
    })
    private fetchAvalancheGas(): Promise<string> {
        const web3Public = Injector.web3PublicService.getWeb3Public(BLOCKCHAIN_NAME.AVALANCHE);
        return web3Public.getGasPrice();
    }
}
