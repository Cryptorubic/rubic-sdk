import { BLOCKCHAIN_NAME } from '../models/BLOCKCHAIN_NAME';
export declare const HEALTHCHECK: {
    ETH: {
        contractAddress: string;
        contractAbi: import("web3-utils").AbiItem[];
        method: string;
        expected: string;
    };
    BSC: {
        contractAddress: string;
        contractAbi: import("web3-utils").AbiItem[];
        method: string;
        expected: string;
    };
    POLYGON: {
        contractAddress: string;
        contractAbi: import("web3-utils").AbiItem[];
        method: string;
        expected: string;
    };
    HARMONY: {
        contractAddress: string;
        contractAbi: import("web3-utils").AbiItem[];
        method: string;
        expected: string;
    };
    AVALANCHE: {
        contractAddress: string;
        contractAbi: import("web3-utils").AbiItem[];
        method: string;
        expected: string;
    };
    MOONRIVER: {
        contractAddress: string;
        contractAbi: import("web3-utils").AbiItem[];
        method: string;
        expected: string;
    };
};
export declare type HealthcheckAvailableBlockchain = keyof typeof HEALTHCHECK;
export declare const healthcheckAvailableBlockchains: string[];
export declare function isBlockchainHealthcheckAvailable(blockchainName: BLOCKCHAIN_NAME): blockchainName is HealthcheckAvailableBlockchain;
