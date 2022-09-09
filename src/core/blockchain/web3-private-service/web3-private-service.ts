import { RubicSdkError } from '@rsdk-common/errors/rubic-sdk.error';
import { Web3Private } from 'src/core/blockchain/web3-private-service/web3-private/web3-private';
import { WalletProvider } from '@rsdk-core/sdk/models/configuration';
import Web3 from 'web3';
import { CHAIN_TYPE } from 'src/core/blockchain/models/chain-type';
import { Web3PrivateStorage } from 'src/core/blockchain/web3-private-service/models/web3-private-storage';
import { BlockchainName, BlockchainsInfo } from 'src/core';

export class Web3PrivateService {
    private web3: Web3 | undefined;

    private address: string | undefined;

    private readonly web3PrivateStorage: Web3PrivateStorage;

    constructor(walletProvider?: WalletProvider) {
        this.web3PrivateStorage = this.createWeb3Private(walletProvider);
    }

    public getWeb3Private(chainType: CHAIN_TYPE): Web3Private {
        const web3Private = this.web3PrivateStorage[chainType as keyof Web3PrivateStorage];
        if (!web3Private) {
            throw new RubicSdkError(
                `web3 provider is not initialized for ${chainType} wallet type`
            );
        }
        return web3Private;
    }

    public getWeb3PrivateByBlockchain(blockchain: BlockchainName): Web3Private {
        return this.getWeb3Private(BlockchainsInfo.getChainType(blockchain));
    }

    private createWeb3Private(walletProvider?: WalletProvider): Web3PrivateStorage {
        if (!walletProvider) {
            return {};
        }

        const storage: Web3PrivateStorage = {};
        if (walletProvider[CHAIN_TYPE.EVM]) {
            const wallet = walletProvider[CHAIN_TYPE.EVM]!;

            let web3 = wallet.core;
            if (!(wallet.core instanceof Web3)) {
                web3 = new Web3(wallet.core);
            }
            this.web3 = web3 as Web3;
            if (!this.web3) {
                throw new RubicSdkError('Web3 is not initialized');
            }

            this.address = this.web3.utils.toChecksumAddress(wallet.address);

            storage[CHAIN_TYPE.EVM] = new Web3Private({
                web3: this.web3,
                address: this.address
            });
        }

        return storage;
    }
}
