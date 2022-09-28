import { BLOCKCHAIN_NAME, BlockchainName } from 'src/core/blockchain/models/blockchain-name';

export const rubicProxyContractAddress: Record<BlockchainName, string> = Object.values(
    BLOCKCHAIN_NAME
).reduce((acc, blockchain) => {
    let contractAddress = '0x33388CF69e032C6f60A420b37E44b1F5443d3333';
    // Contract in OKEX can't be verified.
    if (blockchain === BLOCKCHAIN_NAME.TRON) {
        contractAddress = 'TBzbnMwAJZdxiQmeAYrywa27BT3qQFww99';
    }
    return {
        ...acc,
        [blockchain]: contractAddress
    };
}, {} as Record<BlockchainName, string>);
