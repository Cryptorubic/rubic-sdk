import {
    BLOCKCHAIN_NAME,
    BlockchainName,
    EvmBlockchainName,
    TronBlockchainName
} from 'src/core/blockchain/models/blockchain-name';
import { BlockchainsInfo } from 'src/core/blockchain/utils/blockchains-info';
import { HealthcheckError, RubicSdkError, TimeoutError } from 'src/common/errors';
import Web3 from 'web3';
import pTimeout from 'src/common/utils/p-timeout';
import {
    Web3PublicStorage,
    Web3PublicSupportedBlockchainName
} from 'src/core/blockchain/web3-public-service/models/web3-public-storage';
import { EvmWeb3Public } from 'src/core/blockchain/web3-public-service/web3-public/evm-web3-public/evm-web3-public';
import { TronWeb3Public } from 'src/core/blockchain/web3-public-service/web3-public/tron-web3-public/tron-web3-public';
import { Web3Public } from 'src/core/blockchain/web3-public-service/web3-public/web3-public';
import { TronWeb } from 'src/core/blockchain/constants/tron/tron-web';
import { RpcProviders } from 'src/core/sdk/models/rpc-provider';

export class Web3PublicService {
    private static readonly mainRpcDefaultTimeout = 10_000;

    private readonly web3PublicStorage: Web3PublicStorage;

    public getWeb3Public(blockchainName: EvmBlockchainName): EvmWeb3Public;
    public getWeb3Public(blockchainName: TronBlockchainName): TronWeb3Public;
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

    constructor(public readonly rpcProvider: RpcProviders) {
        this.web3PublicStorage = this.createWeb3PublicStorage();
    }

    private createWeb3PublicStorage(): Web3PublicStorage {
        return (Object.keys(this.rpcProvider) as BlockchainName[]).reduce((acc, blockchainName) => {
            if (BlockchainsInfo.isEvmBlockchainName(blockchainName)) {
                return {
                    ...acc,
                    [blockchainName]: this.createEvmWeb3PublicProxy(blockchainName)
                };
            }
            if (BlockchainsInfo.isTronBlockchainName(blockchainName)) {
                return {
                    ...acc,
                    [blockchainName]: this.createTronWeb3PublicProxy()
                };
            }
            return acc;
        }, {} as Web3PublicStorage);
    }

    private createEvmWeb3PublicProxy(blockchainName: EvmBlockchainName): EvmWeb3Public {
        const rpcProvider = this.rpcProvider[blockchainName]!;
        const evmWeb3Public = new EvmWeb3Public(new Web3(rpcProvider.rpcList[0]!), blockchainName);

        return this.createWeb3PublicProxy(blockchainName, evmWeb3Public);
    }

    private createTronWeb3PublicProxy(): TronWeb3Public {
        const rpcProvider = this.rpcProvider[BLOCKCHAIN_NAME.TRON]!;
        const tronWeb3Public = new TronWeb3Public(new TronWeb(rpcProvider.rpcList[0]!));

        return this.createWeb3PublicProxy(BLOCKCHAIN_NAME.TRON, tronWeb3Public);
    }

    private createWeb3PublicProxy<T extends Web3Public = Web3Public>(
        blockchainName: Web3PublicSupportedBlockchainName,
        web3Public: T
    ): T {
        const rpcProvider = this.rpcProvider[blockchainName]!;

        return new Proxy(web3Public, {
            get(target: T, prop: keyof Web3Public) {
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
                            const rpcString = typeof curRpc === 'string' ? curRpc : curRpc.fullHost;
                            if (
                                e instanceof TimeoutError ||
                                e instanceof HealthcheckError ||
                                e.message?.toLowerCase().includes(rpcString.toLowerCase())
                            ) {
                                if (curRpc === rpcProvider.rpcList[0]) {
                                    rpcProvider.rpcList.shift();
                                    if (!rpcProvider.rpcList.length) {
                                        throw new RubicSdkError(
                                            `There is no working rpc left for ${blockchainName}.`
                                        );
                                    }
                                    const nextRpc = rpcProvider.rpcList![0]!;
                                    web3Public.setProvider(nextRpc);
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
