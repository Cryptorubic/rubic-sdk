import { Web3Private } from './web3-private';
import { WalletProvider } from '../../sdk/models/configuration';
import Web3 from 'web3';
import { provider } from 'web3-core';
export declare class Web3PrivateFactory {
    private readonly core;
    private readonly walletAddrrss;
    private readonly chainId;
    private web3;
    private address;
    private blockchainName;
    static createWeb3Private(walletProvider?: WalletProvider): Promise<Web3Private>;
    private static createWeb3PrivateEmptyProxy;
    constructor(core: provider | Web3, walletAddrrss: string, chainId: number);
    createWeb3Private(): Promise<Web3Private>;
    private createWeb3;
    private parseChainId;
    private parseAddress;
    private createWeb3PrivateInstance;
}
