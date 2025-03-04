import { Connection } from '@solana/web3.js';
import cloneDeep from 'lodash.clonedeep';
import { HealthcheckError, RubicSdkError, TimeoutError } from 'src/common/errors';
import pTimeout from 'src/common/utils/p-timeout';
import {
    BitcoinBlockchainName,
    BLOCKCHAIN_NAME,
    BlockchainName,
    EVM_BLOCKCHAIN_NAME,
    EvmBlockchainName,
    SolanaBlockchainName,
    SuiBlockchainName,
    TonBlockchainName,
    TronBlockchainName
} from 'src/core/blockchain/models/blockchain-name';
import { rpcErrors } from 'src/core/blockchain/web3-public-service/constants/rpc-errors';
import { CreateWeb3Public } from 'src/core/blockchain/web3-public-service/models/create-web3-public-proxy';
import {
    Web3PublicStorage,
    Web3PublicSupportedBlockchain,
    web3PublicSupportedBlockchains
} from 'src/core/blockchain/web3-public-service/models/web3-public-storage';
import { BitcoinWeb3Public } from 'src/core/blockchain/web3-public-service/web3-public/bitcoin-web3-public/bitcoin-web3-public';
import { EvmWeb3Public } from 'src/core/blockchain/web3-public-service/web3-public/evm-web3-public/evm-web3-public';
import { SolanaWeb3Public } from 'src/core/blockchain/web3-public-service/web3-public/solana-web3-public/solana-web3-public';
import { SuiWeb3Public } from 'src/core/blockchain/web3-public-service/web3-public/sui-web3-public/sui-web3-public';
import { TronWeb3Public } from 'src/core/blockchain/web3-public-service/web3-public/tron-web3-public/tron-web3-public';
import { Web3Public } from 'src/core/blockchain/web3-public-service/web3-public/web3-public';
import { RpcProviders } from 'src/core/sdk/models/rpc-provider';
import { TronWeb } from 'tronweb';
import Web3 from 'web3';

import { TonWeb3Public } from './web3-public/ton-web3-public/ton-web3-public';

export class Web3PublicService {
    public static isSupportedBlockchain(
        blockchain: BlockchainName
    ): blockchain is Web3PublicSupportedBlockchain {
        return web3PublicSupportedBlockchains.some(
            supportedBlockchain => supportedBlockchain === blockchain
        );
    }

    private static readonly mainRpcDefaultTimeout = 10_000;

    private readonly web3PublicStorage: Web3PublicStorage;

    private readonly createWeb3Public: CreateWeb3Public;

    constructor(public readonly rpcProvider: RpcProviders) {
        this.createWeb3Public = this.setCreateWeb3Public();
        this.web3PublicStorage = this.createWeb3PublicStorage();
    }

    public getWeb3Public(blockchainName: EvmBlockchainName): EvmWeb3Public;
    public getWeb3Public(blockchainName: TronBlockchainName): TronWeb3Public;
    public getWeb3Public(blockchainName: SolanaBlockchainName): SolanaWeb3Public;
    public getWeb3Public(blockchainName: TonBlockchainName): TonWeb3Public;
    public getWeb3Public(blockchainName: BitcoinBlockchainName): BitcoinWeb3Public;
    public getWeb3Public(blockchainName: SuiBlockchainName): SuiWeb3Public;
    public getWeb3Public(blockchainName: Web3PublicSupportedBlockchain): Web3Public;
    public getWeb3Public(blockchainName: BlockchainName): never;
    public getWeb3Public(blockchainName: BlockchainName) {
        if (!Web3PublicService.isSupportedBlockchain(blockchainName)) {
            throw new RubicSdkError(
                `Blockchain ${blockchainName} is not supported in web3 public.`
            );
        }

        const web3Public = this.web3PublicStorage[blockchainName];
        if (!web3Public) {
            throw new RubicSdkError(
                `Provider for ${blockchainName} was not initialized. Pass rpc link for this blockchain to sdk configuration object.`
            );
        }
        return web3Public;
    }

    private setCreateWeb3Public(): CreateWeb3Public {
        return {
            ...(Object.values(EVM_BLOCKCHAIN_NAME) as EvmBlockchainName[]).reduce(
                (acc, evmBlockchainName) => ({
                    ...acc,
                    [evmBlockchainName]: this.createEvmWeb3PublicProxy.bind(this)
                }),
                {} as Record<
                    EvmBlockchainName,
                    (blockchainName?: EvmBlockchainName) => EvmWeb3Public
                >
            ),
            [BLOCKCHAIN_NAME.TRON]: this.createTronWeb3PublicProxy.bind(this),
            [BLOCKCHAIN_NAME.SOLANA]: this.createSolanaWeb3PublicProxy.bind(this),
            [BLOCKCHAIN_NAME.TON]: this.createTonWeb3Public.bind(this),
            [BLOCKCHAIN_NAME.BITCOIN]: this.createBitcoinWeb3Public.bind(this),
            [BLOCKCHAIN_NAME.SUI]: this.creatSuiWeb3Public.bind(this)
        };
    }

    private createWeb3PublicStorage(): Web3PublicStorage {
        return (Object.keys(this.rpcProvider) as BlockchainName[]).reduce((acc, blockchainName) => {
            if (!Web3PublicService.isSupportedBlockchain(blockchainName)) {
                console.debug(`Blockchain ${blockchainName} is not supported in web3 public.`);
                return acc;
            }
            return {
                ...acc,
                [blockchainName]: this.createWeb3Public[blockchainName](blockchainName)
            };
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

    private createSolanaWeb3PublicProxy(): SolanaWeb3Public {
        const rpcProvider = this.rpcProvider[BLOCKCHAIN_NAME.SOLANA]!;
        const solanaWeb3Public = new SolanaWeb3Public(
            new Connection(rpcProvider.rpcList[0]!, 'confirmed')
        );

        return this.createWeb3PublicProxy(BLOCKCHAIN_NAME.SOLANA, solanaWeb3Public);
    }

    private createTonWeb3Public(): TonWeb3Public {
        const tonWeb3Public = new TonWeb3Public();
        return tonWeb3Public;
    }

    private createBitcoinWeb3Public(): BitcoinWeb3Public {
        return new BitcoinWeb3Public();
    }

    private creatSuiWeb3Public(): SuiWeb3Public {
        const rpcProvider = this.rpcProvider[BLOCKCHAIN_NAME.SUI]!;
        return new SuiWeb3Public(rpcProvider.rpcList[0]!);
    }

    private createWeb3PublicProxy<T extends Web3Public = Web3Public>(
        blockchainName: Web3PublicSupportedBlockchain,
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
                        const curRpc = rpcProvider.rpcList[0];
                        if (!curRpc) {
                            throw new RubicSdkError(
                                `There is no working rpc left for ${blockchainName}.`
                            );
                        }

                        const methodParams = cloneDeep(params);
                        const callMethod = () => (target[prop] as Function).call(target, ...params);
                        try {
                            const result = await pTimeout(
                                callMethod(),
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
                                e.message?.toLowerCase().includes(rpcString.toLowerCase()) ||
                                rpcErrors.some(error => e.message?.toLowerCase().includes(error))
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
