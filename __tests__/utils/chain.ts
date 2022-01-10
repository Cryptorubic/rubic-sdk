import { Global } from '__tests__/utils/models/global';
import { BLOCKCHAIN_NAME, Configuration } from 'src/core';
import * as util from 'util';
import Web3 from 'web3';
import { HttpProvider } from 'web3-core';
import hardhat from 'hardhat';
import '@nomiclabs/hardhat-web3';

export class Chain {
    public static nodeUrl = 'http://localhost:8545';

    public static async reset(blockchainName: BLOCKCHAIN_NAME): Promise<Chain> {
        const { web3 } = hardhat;
        web3.setProvider(this.nodeUrl);

        const jsonRpcUrl = (global as unknown as Global).sdkEnv.providers[blockchainName]
            ?.jsonRpcUrl;
        const blockNumber = (global as unknown as Global).sdkEnv.providers[blockchainName]
            ?.blockNumber;
        if (!jsonRpcUrl || !blockNumber) {
            throw new Error(`You must configure ${blockchainName} provider in __tests__/env.js`);
        }

        await util.promisify(
            (web3.currentProvider as HttpProvider).send.bind(web3.currentProvider)
        )({
            method: 'hardhat_reset',
            params: [{ forking: { jsonRpcUrl, blockNumber } }],
            jsonrpc: '2.0',
            id: new Date().getTime()
        });

        const accounts = await web3.eth.getAccounts();

        return new Chain(web3, accounts);
    }

    private constructor(public web3: Web3, public accounts: string[]) {}

    public async getConfiguration(): Promise<Configuration> {
        const chainId = await this.web3.eth.getChainId();
        return {
            rpcProviders: {
                [BLOCKCHAIN_NAME.ETHEREUM]: {
                    mainRpc: Chain.nodeUrl
                }
            },
            walletProvider: {
                core: this.web3,
                chainId,
                address: this.accounts[0]
            }
        };
    }
}
