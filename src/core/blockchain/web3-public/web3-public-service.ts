import { RubicSdkError } from '@rsdk-common/errors/rubic-sdk.error';
import { TimeoutError } from '@rsdk-common/errors/utils/timeout.error';
import pTimeout from '@rsdk-common/utils/p-timeout';
import { BlockchainName } from '@rsdk-core/blockchain/models/blockchain-name';
import { Web3Public } from '@rsdk-core/blockchain/web3-public/web3-public';
import { RpcProvider } from '@rsdk-core/sdk/models/configuration';
import Web3 from 'web3';
import { RpcListProvider } from 'src/core/blockchain/web3-public/constants/rpc-list-provider';

export class Web3PublicService {
    private static readonly mainRpcDefaultTimeout = 10_000;

    public static async createWeb3PublicService(
        rpcList: Partial<Record<BlockchainName, RpcProvider>>
    ): Promise<Web3PublicService> {
        const web3PublicService = new Web3PublicService(rpcList);
        await web3PublicService.createAndCheckWeb3Public();
        return web3PublicService;
    }

    public readonly rpcListProvider: Partial<Record<BlockchainName, RpcListProvider>>;

    private web3PublicStorage: Partial<Record<BlockchainName, Web3Public>> = {};

    constructor(rpcList: Partial<Record<BlockchainName, RpcProvider>>) {
        this.rpcListProvider = this.parseRpcList(rpcList);
    }

    private parseRpcList(
        rpcList: Partial<Record<BlockchainName, RpcProvider>>
    ): Partial<Record<BlockchainName, RpcListProvider>> {
        return Object.keys(rpcList).reduce((acc, blockchainName) => {
            const rpcConfig = rpcList[blockchainName as BlockchainName]!;
            let list: string[];
            if (rpcConfig.mainRpc) {
                list = [rpcConfig.mainRpc].concat(rpcConfig.spareRpc ? [rpcConfig.spareRpc] : []);
            } else {
                if (!rpcConfig.rpcList?.length) {
                    console.error(
                        `For ${blockchainName} you must provide either 'mainRpc' or 'rpcList' field`
                    );
                    return acc;
                }
                list = rpcConfig.rpcList;
            }
            const rpcProvider: RpcProvider = {
                rpcList: list,
                mainRpcTimeout: rpcConfig.mainRpcTimeout,
                healthCheckTimeout: rpcConfig.healthCheckTimeout
            };

            return {
                ...acc,
                [blockchainName]: rpcProvider
            };
        }, {});
    }

    public getWeb3Public(blockchainName: BlockchainName): Web3Public {
        const web3Public = this.web3PublicStorage[blockchainName];
        if (!web3Public) {
            throw new RubicSdkError(
                `Provider for ${blockchainName} was not initialized. Pass rpc link for this blockchain to sdk configuration object.`
            );
        }
        return web3Public;
    }

    private createAndCheckWeb3Public(): void {
        Object.keys(this.rpcListProvider).forEach(
            blockchainName =>
                (this.web3PublicStorage[blockchainName as BlockchainName] =
                    this.createWeb3PublicProxy(blockchainName as BlockchainName))
        );
    }

    private createWeb3PublicProxy(blockchainName: BlockchainName): Web3Public {
        const rpcProvider = this.rpcListProvider[blockchainName]!;
        const web3Public = new Web3Public(new Web3(rpcProvider.rpcList[0]!), blockchainName);

        return new Proxy(web3Public, {
            get(target: Web3Public, prop: keyof Web3Public) {
                if (prop === 'setProvider' || prop === 'healthCheck') {
                    return target[prop].bind(target);
                }

                if (typeof target[prop] === 'function') {
                    return async function method(...params: unknown[]): Promise<unknown> {
                        const curRpc = rpcProvider.rpcList[0]!;

                        const callMethod = () => (target[prop] as Function).call(target, ...params);
                        try {
                            return await pTimeout(
                                callMethod(),
                                rpcProvider.mainRpcTimeout ||
                                    Web3PublicService.mainRpcDefaultTimeout
                            );
                        } catch (e) {
                            if (
                                e instanceof TimeoutError ||
                                e.message?.toLowerCase().includes(curRpc.toLowerCase())
                            ) {
                                if (curRpc === rpcProvider.rpcList[0]) {
                                    rpcProvider.rpcList.shift();
                                    if (!rpcProvider.rpcList.length) {
                                        throw new RubicSdkError(
                                            `No working rpc is left for ${blockchainName}.`
                                        );
                                    }
                                    const nextRpc = rpcProvider.rpcList![0]!;
                                    web3Public.setProvider(nextRpc);
                                    console.debug(
                                        `Rpc provider for ${blockchainName} is changed to ${nextRpc}.`
                                    );
                                }

                                return method(...params);
                            }
                            throw e;
                        }
                    };
                }

                return target[prop];
            }
        });
    }
}
