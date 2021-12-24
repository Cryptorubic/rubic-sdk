import { RubicSdkError } from '@common/errors/rubic-sdk.error';
import { BLOCKCHAIN_NAME } from '@core/blockchain/models/BLOCKCHAIN_NAME';
import { Web3Public } from '@core/blockchain/web3-public/web3-public';
import { RpcProvider } from '@core/sdk/models/configuration';
import pTimeout, { TimeoutError } from 'p-timeout';
import Web3 from 'web3';

export class Web3PublicService {
    private static readonly mainRpcDefaultTimeout: 10_000;

    private static readonly healthCheckDefaultTimeout: 4_000;

    public static async createWeb3PublicService(
        rpcList: Partial<Record<BLOCKCHAIN_NAME, RpcProvider>>
    ): Promise<Web3PublicService> {
        const web3PublicService = new Web3PublicService(rpcList);
        await web3PublicService.createAndCheckWeb3Public();
        return web3PublicService;
    }

    private web3PublicStorage: Partial<Record<BLOCKCHAIN_NAME, Web3Public>> = {};

    constructor(private rpcList: Partial<Record<BLOCKCHAIN_NAME, RpcProvider>>) {}

    public getWeb3Public(blockchainName: BLOCKCHAIN_NAME): Web3Public {
        const web3Public = this.web3PublicStorage[blockchainName];
        if (!web3Public) {
            throw new RubicSdkError(
                `Provider for ${blockchainName} was not initialized. Pass rpc link for this blockchain to sdk configuration object.`
            );
        }

        return web3Public;
    }

    private async createAndCheckWeb3Public(): Promise<void> {
        const promises = Object.entries(this.rpcList).map(async ([blockchainName, rpcConfig]) => {
            const web3Public = this.createWeb3Public(rpcConfig, blockchainName as BLOCKCHAIN_NAME);
            if (!rpcConfig.spareRpc) {
                return web3Public;
            }

            const healthcheckResult = await web3Public.healthCheck(
                rpcConfig.healthCheckTimeout || Web3PublicService.healthCheckDefaultTimeout
            );
            if (healthcheckResult) {
                return web3Public;
            }

            return this.createWeb3Public(
                { mainRpc: rpcConfig.spareRpc },
                blockchainName as BLOCKCHAIN_NAME
            );
        });

        const results = await Promise.all(promises);
        Object.keys(this.rpcList).forEach(
            (blockchainName, index) =>
                (this.web3PublicStorage[blockchainName as BLOCKCHAIN_NAME] = results[index])
        );
    }

    private createWeb3Public(
        rpcProvider: RpcProvider,
        blockchainName: BLOCKCHAIN_NAME
    ): Web3Public {
        const web3Public = new Web3Public(new Web3(rpcProvider.mainRpc), blockchainName);
        let nodeReplaced = false;

        return new Proxy(web3Public, {
            get(target: Web3Public, prop: keyof Web3Public) {
                if (prop === 'setProvider' || prop === 'healthCheck') {
                    return target[prop].bind(target);
                }

                if (typeof target[prop] === 'function') {
                    return async (...params: unknown[]) => {
                        const callMethod = () => (target[prop] as Function).call(target, ...params);
                        if (!nodeReplaced && rpcProvider.spareRpc) {
                            try {
                                return await pTimeout(
                                    callMethod(),
                                    rpcProvider.mainPrcTimeout ||
                                        Web3PublicService.mainRpcDefaultTimeout
                                );
                            } catch (e) {
                                if (e instanceof TimeoutError) {
                                    web3Public.setProvider(rpcProvider.spareRpc);
                                    nodeReplaced = true;
                                    return callMethod();
                                }
                                throw e;
                            }
                        }
                        return callMethod();
                    };
                }

                return target[prop];
            }
        });
    }
}
