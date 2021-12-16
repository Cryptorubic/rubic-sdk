import Web3 from 'web3';
export interface ProviderConnector {
    web3: Web3;
    address: string;
    chainId: number | string;
}
