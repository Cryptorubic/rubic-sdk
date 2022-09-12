import { BlockchainName, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { RpcListProvider } from 'src/core/blockchain/web3-public-service/constants/rpc-list-provider';
import { BlockchainsInfo } from 'src/core/blockchain/utils/blockchains-info';
import { HealthcheckError, RubicSdkError, TimeoutError } from 'src/common/errors';
import Web3 from 'web3';
import pTimeout from 'src/common/utils/p-timeout';
import { Web3PublicStorage } from 'src/core/blockchain/web3-public-service/models/web3-public-storage';
import { RpcProvider } from 'src/core/sdk/models/configuration';
import { EvmWeb3Public } from 'src/core/blockchain/web3-public-service/web3-public/evm-web3-public';

export class Web3PublicService {
    private static readonly mainRpcDefaultTimeout = 10_000;

    public readonly rpcListProvider: Partial<Record<BlockchainName, RpcListProvider>>;

    private readonly web3PublicStorage: Web3PublicStorage = {};

    public getWeb3Public(blockchainName: EvmBlockchainName): EvmWeb3Public;
    public getWeb3Public(blockchainName: BlockchainName): never;
    public getWeb3Public(blockchainName: BlockchainName) {
        const web3Public = this.web3PublicStorage[blockchainName as keyof Web3PublicStorage];
        if (!web3Public) {
            throw new RubicSdkError(
                `Provider for ${blockchainName} was not initialized. Pass rpc link for this blockchain to sdk configuration object.`
            );
        }
        return web3Public;
    }

    constructor(rpcList: Partial<Record<BlockchainName, RpcProvider>>) {
        this.rpcListProvider = this.parseRpcList(rpcList);

        (Object.keys(this.rpcListProvider) as BlockchainName[]).forEach(blockchainName => {
            if (BlockchainsInfo.isEvmBlockchainName(blockchainName)) {
                this.web3PublicStorage[blockchainName] =
                    this.createEvmWeb3PublicProxy(blockchainName);
            }
        });
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
            const rpcProvider: RpcListProvider = {
                rpcList: list,
                mainRpcTimeout: rpcConfig.mainRpcTimeout
            };

            return {
                ...acc,
                [blockchainName]: rpcProvider
            };
        }, {});
    }

    private createEvmWeb3PublicProxy(blockchainName: BlockchainName): EvmWeb3Public {
        const rpcProvider = this.rpcListProvider[blockchainName]!;
        const evmWeb3Public = new EvmWeb3Public(new Web3(rpcProvider.rpcList[0]!), blockchainName);

        return new Proxy(evmWeb3Public, {
            get(target: EvmWeb3Public, prop: keyof EvmWeb3Public) {
                if (prop === 'setProvider') {
                    return target[prop].bind(target);
                }

                if (typeof target[prop] === 'function') {
                    return async function method(...params: unknown[]): Promise<unknown> {
                        const curRpc = rpcProvider.rpcList[0]!;

                        const methodParams = structuredClone(params);
                        const callMethod = () => (target[prop] as Function).call(target, ...params);
                        try {
                            const result = await pTimeout(
                                callMethod(),
                                rpcProvider.mainRpcTimeout ||
                                    Web3PublicService.mainRpcDefaultTimeout
                            );
                            if (prop === 'healthCheck' && result === false) {
                                throw new HealthcheckError();
                            }
                            return result;
                        } catch (e) {
                            if (
                                e instanceof TimeoutError ||
                                e instanceof HealthcheckError ||
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
                                    evmWeb3Public.setProvider(nextRpc);
                                    console.debug(
                                        `Rpc provider for ${blockchainName} is changed to ${nextRpc}.`
                                    );
                                }

                                return method(...methodParams);
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
