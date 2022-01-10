import { Global } from '__tests__/utils/models/global';
import { BLOCKCHAIN_NAME, Configuration } from 'src/core';
import * as util from 'util';
import Web3 from 'web3';
import { HttpProvider } from 'web3-core';

export class Chain {
    public web3: Web3;

    constructor() {
        this.web3 = new Web3('http://127.0.0.1:8545/');
        this.web3.eth.accounts.wallet.add(
            ''
        );
    }

    public async getConfiguration(): Promise<Configuration> {
        const chainId = await this.web3.eth.getChainId();
        const accounts = await this.getAccounts();
        return {
            rpcProviders: {
                [BLOCKCHAIN_NAME.ETHEREUM]: {
                    mainRpc: 'http://127.0.0.1:8545/'
                }
            },
            walletProvider: {
                core: this.web3,
                chainId,
                address: accounts[0]
            }
        };
    }

    public async reset(blockchain: BLOCKCHAIN_NAME): Promise<void> {
        const jsonRpcUrl = (global as unknown as Global).sdkEnv.hardhatProviders[blockchain]
            ?.jsonRpcUrl;
        const blockNumber = (global as unknown as Global).sdkEnv.hardhatProviders[blockchain]
            ?.blockNumber;
        if (!jsonRpcUrl || !blockNumber) {
            throw new Error(`You must configure ${blockchain} provider in __tests__/env.js`);
        }

        await util.promisify(
            (this.web3.currentProvider as HttpProvider).send.bind(this.web3.currentProvider)
        )({
            method: 'hardhat_reset',
            params: [{ forking: { jsonRpcUrl, blockNumber } }],
            jsonrpc: '2.0',
            id: new Date().getTime()
        });
        // this.web3 = new Web3(hardhat.network.provider as unknown as provider);
    }

    public async getAccounts(): Promise<string[]> {
        return this.web3.eth.getAccounts();
    }
}
