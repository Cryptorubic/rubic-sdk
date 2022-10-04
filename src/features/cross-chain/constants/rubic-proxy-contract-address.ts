import { BLOCKCHAIN_NAME, BlockchainName } from 'src/core';

export const rubicProxyContractAddress: Record<BlockchainName, string> = Object.values(
    BLOCKCHAIN_NAME
).reduce((acc, blockchain) => {
    const contractAddress = '0x33388CF69e032C6f60A420b37E44b1F5443d3333';
    return {
        ...acc,
        [blockchain]: contractAddress
    };
}, {} as Record<BlockchainName, string>);
