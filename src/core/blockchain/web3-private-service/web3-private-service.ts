import { RubicSdkError } from 'src/common/errors';
import {
    BlockchainName,
    EvmBlockchainName,
    TronBlockchainName
} from 'src/core/blockchain/models/blockchain-name';
import { CHAIN_TYPE } from 'src/core/blockchain/models/chain-type';
import { BlockchainsInfo } from 'src/core/blockchain/utils/blockchains-info/blockchains-info';
import { CreateWeb3Private } from 'src/core/blockchain/web3-private-service/models/create-web3-private';
import { Web3PrivateSupportedBlockchain } from 'src/core/blockchain/web3-private-service/models/web-private-supported-blockchain';
import {
    Web3PrivateSupportedChainType,
    web3PrivateSupportedChainTypes
} from 'src/core/blockchain/web3-private-service/models/web-private-supported-chain-type';
import { Web3PrivateStorage } from 'src/core/blockchain/web3-private-service/models/web3-private-storage';
import { EmptyWeb3Private } from 'src/core/blockchain/web3-private-service/web3-private/empty-web3-private';
import { EvmWeb3Private } from 'src/core/blockchain/web3-private-service/web3-private/evm-web3-private/evm-web3-private';
import { TronWeb3Private } from 'src/core/blockchain/web3-private-service/web3-private/tron-web3-private/tron-web3-private';
import { Web3Private } from 'src/core/blockchain/web3-private-service/web3-private/web3-private';
import {
    EvmWalletProviderCore,
    TronWalletProviderCore,
    WalletProvider,
    WalletProviderCore
} from 'src/core/sdk/models/wallet-provider';
import Web3 from 'web3';

export class Web3PrivateService {
    public static isSupportedChainType(
        chainType: CHAIN_TYPE
    ): chainType is Web3PrivateSupportedChainType {
        return web3PrivateSupportedChainTypes.some(
            supportedChainType => supportedChainType === chainType
        );
    }

    private web3PrivateStorage: Web3PrivateStorage;

    private readonly createWeb3Private: CreateWeb3Private = {
        [CHAIN_TYPE.EVM]: this.createEvmWeb3Private.bind(this),
        [CHAIN_TYPE.TRON]: this.createTronWeb3Private.bind(this)
    };

    constructor(walletProvider?: WalletProvider) {
        this.web3PrivateStorage = this.createWeb3PrivateStorage(walletProvider);
    }

    public getWeb3Private(chainType: CHAIN_TYPE.EVM): EvmWeb3Private;
    public getWeb3Private(chainType: CHAIN_TYPE.TRON): TronWeb3Private;
    public getWeb3Private(chainType: CHAIN_TYPE): never;
    public getWeb3Private(chainType: CHAIN_TYPE) {
        if (!Web3PrivateService.isSupportedChainType(chainType)) {
            throw new RubicSdkError(`Chain type ${chainType} is not supported in web3 private`);
        }

        const web3Private = this.web3PrivateStorage[chainType];
        if (!web3Private) {
            return new EmptyWeb3Private();
        }
        return web3Private;
    }

    public getWeb3PrivateByBlockchain(blockchain: EvmBlockchainName): EvmWeb3Private;
    public getWeb3PrivateByBlockchain(blockchain: TronBlockchainName): TronWeb3Private;
    public getWeb3PrivateByBlockchain(blockchain: Web3PrivateSupportedBlockchain): Web3Private;
    public getWeb3PrivateByBlockchain(blockchain: BlockchainName): never;
    public getWeb3PrivateByBlockchain(blockchain: BlockchainName) {
        return this.getWeb3Private(BlockchainsInfo.getChainType(blockchain));
    }

    private createWeb3PrivateStorage(walletProvider?: WalletProvider): Web3PrivateStorage {
        return web3PrivateSupportedChainTypes.reduce((acc, chainType) => {
            const walletProviderCore = walletProvider?.[chainType];
            if (!walletProviderCore) {
                return acc;
            }
            return {
                ...acc,
                [chainType]: this.createWeb3Private[chainType](walletProviderCore)
            };
        }, {} as Web3PrivateStorage);
    }

    private createEvmWeb3Private(evmWalletProviderCore: EvmWalletProviderCore): EvmWeb3Private {
        let { core } = evmWalletProviderCore;
        if (!(core instanceof Web3)) {
            core = new Web3(core);
        }
        const web3 = core as Web3;
        if (!web3) {
            throw new RubicSdkError('Web3 is not initialized');
        }

        const address = web3.utils.toChecksumAddress(evmWalletProviderCore.address);

        return new EvmWeb3Private({
            core: web3,
            address
        });
    }

    private createTronWeb3Private(tronWalletProviderCore: TronWalletProviderCore): TronWeb3Private {
        return new TronWeb3Private(tronWalletProviderCore);
    }

    public updateWeb3PrivateStorage(walletProvider: WalletProvider) {
        this.web3PrivateStorage = this.createWeb3PrivateStorage(walletProvider);
    }

    public updateWeb3Private(
        chainType: Web3PrivateSupportedChainType,
        walletProviderCore: WalletProviderCore
    ) {
        this.web3PrivateStorage = {
            ...this.web3PrivateStorage,
            [chainType]: this.createWeb3Private[chainType](walletProviderCore)
        };
    }

    public updateWeb3PrivateAddress(chainType: Web3PrivateSupportedChainType, address: string) {
        this.web3PrivateStorage[chainType]?.setAddress(address);
    }
}
