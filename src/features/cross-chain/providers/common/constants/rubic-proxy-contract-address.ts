import { BLOCKCHAIN_NAME, BlockchainName } from 'src/core/blockchain/models/blockchain-name';

export const rubicProxyContractAddress: Record<BlockchainName, string> = Object.values(
    BLOCKCHAIN_NAME
).reduce((acc, blockchain) => {
    let contractAddress = '0x3335a88bb18fd3b6824b59af62b50ce494143333';
    // Contract in OKEX can't be verified.
    if (blockchain === BLOCKCHAIN_NAME.OKE_X_CHAIN) {
        contractAddress = '0x3332241a5a4eCb4c28239A9731ad45De7f000333';
    }

    if (blockchain === BLOCKCHAIN_NAME.TRON) {
        contractAddress = 'TBzbnMwAJZdxiQmeAYrywa27BT3qQFww99';
    }

    return {
        ...acc,
        [blockchain]: contractAddress
    };
}, {} as Record<BlockchainName, string>);
