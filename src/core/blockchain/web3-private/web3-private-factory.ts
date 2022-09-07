import { RubicSdkError } from '@rsdk-common/errors/rubic-sdk.error';
import { WalletConnectionConfiguration } from '@rsdk-core/blockchain/models/wallet-connection-configuration';
import { Web3Private } from '@rsdk-core/blockchain/web3-private/web3-private';
import { WalletProvider } from '@rsdk-core/sdk/models/configuration';
import Web3 from 'web3';
import { provider } from 'web3-core';

export class Web3PrivateFactory {
    private web3: Web3 | undefined;

    private address: string | undefined;

    public static async createWeb3Private(walletProvider?: WalletProvider): Promise<Web3Private> {
        if (!walletProvider) {
            return Web3PrivateFactory.createWeb3PrivateEmptyProxy();
        }

        const web3PrivateFactory = new Web3PrivateFactory(
            walletProvider.core,
            walletProvider.address
        );
        return web3PrivateFactory.createWeb3Private();
    }

    private static createWeb3PrivateEmptyProxy(): Promise<Web3Private> {
        return Promise.resolve(
            new Proxy({} as Web3Private, {
                get(_, prop) {
                    // Promise resolving procedure checks if `then` property exists in resolved object
                    // https://promisesaplus.com/
                    if (prop === 'then') {
                        return;
                    }

                    if (prop === 'address') {
                        return;
                    }

                    throw new RubicSdkError(
                        'Cant call web3Private method because walletProvider was not configurated. Try to pass walletProvider to sdk configuration'
                    );
                }
            })
        );
    }

    constructor(private readonly core: provider | Web3, private readonly walletAddress: string) {}

    public async createWeb3Private(): Promise<Web3Private> {
        this.createWeb3();
        this.parseAddress();
        return this.createWeb3PrivateInstance();
    }

    private createWeb3(): void {
        let web3 = this.core;
        if (!(this.core instanceof Web3)) {
            web3 = new Web3(this.core);
        }
        this.web3 = web3 as Web3;
    }

    private parseAddress(): void {
        if (!this.web3) {
            throw new RubicSdkError('Web3 is not initialized');
        }

        this.address = this.web3.utils.toChecksumAddress(this.walletAddress);
    }

    private createWeb3PrivateInstance(): Web3Private {
        const walletConfiguration: WalletConnectionConfiguration = {
            web3: this.web3!!,
            address: this.address!!
        };

        return new Web3Private(walletConfiguration);
    }
}
