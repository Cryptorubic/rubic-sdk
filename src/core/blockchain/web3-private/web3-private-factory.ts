import { WrongChainIdError } from '@common/errors/provider/wrong-chain-id.error';
import { RubicError } from '@common/errors/rubic-error';
import { BlockchainsInfo } from '@core/blockchain/blockchains-info';
import { BLOCKCHAIN_NAME } from '@core/blockchain/models/BLOCKCHAIN_NAME';
import { WalletConnectionConfiguration } from '@core/blockchain/models/wallet-connection-configuration';
import { Web3Private } from '@core/blockchain/web3-private/web3-private';
import BigNumber from 'bignumber.js';
import Web3 from 'web3';
import { provider } from 'web3-core';

export class Web3PrivateFactory {
    private web3: Web3 | undefined;

    private address: string | undefined;

    private blockchainName: BLOCKCHAIN_NAME | undefined;

    public static async buildWeb3Private(
        core: provider | Web3,
        addrrss: string,
        chainId: number
    ): Promise<Web3Private> {
        const web3PrivateFactory = new Web3PrivateFactory(core, addrrss, chainId);
        return web3PrivateFactory.buildWeb3Private();
    }

    constructor(
        private readonly core: provider | Web3,
        private readonly walletAddrrss: string,
        private readonly chainId: number
    ) {}

    public async buildWeb3Private(): Promise<Web3Private> {
        this.createWeb3();
        await this.parseChainId();
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

    private async parseChainId(): Promise<void | never> {
        if (!this.web3) {
            throw new RubicError('Web3 is not initialized');
        }

        const realChainId = await this.web3.eth.getChainId();
        if (!new BigNumber(realChainId).eq(this.chainId)) {
            throw new WrongChainIdError();
        }

        const blockchainName = BlockchainsInfo.getBlockchainById(realChainId);
        if (!blockchainName) {
            throw new WrongChainIdError();
        }

        this.blockchainName = blockchainName.name;
    }

    private parseAddress(): void {
        if (!this.web3) {
            throw new RubicError('Web3 is not initialized');
        }

        this.address = this.web3.utils.toChecksumAddress(this.walletAddrrss);
    }

    private createWeb3PrivateInstance(): Web3Private {
        const walletConfiguration: WalletConnectionConfiguration = {
            web3: this.web3!!,
            address: this.address!!,
            blockchainName: this.blockchainName!!
        };

        return new Web3Private(walletConfiguration);
    }
}
