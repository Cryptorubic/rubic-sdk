import BigNumber from 'bignumber.js';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import Web3 from 'web3';

import { EvmWeb3Public } from '../evm-web3-public/evm-web3-public';

export class SeiWeb3Public extends EvmWeb3Public {
    constructor(protected readonly web3: Web3, blockchainName: EvmBlockchainName) {
        super(web3, blockchainName);
        this.web3 = web3;
        const seiProvider = new Web3.providers.HttpProvider('https://evm-rpc.sei-apis.com');
        this.setProvider(seiProvider);
    }

    private async getTransactionCount(walletAddress: string): Promise<number> {
        return await this.web3.eth.getTransactionCount(walletAddress);
    }

    public async isLinkedAddress(walletAddress: string, tokenAddress: string): Promise<boolean> {
        const balance = await this.getBalance(walletAddress, tokenAddress);
        const transactionCount = await this.getTransactionCount(walletAddress);
        return balance.gt(BigNumber(0)) && transactionCount > 0 ? true : false;
    }
}
