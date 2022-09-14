import { BLOCKCHAIN_NAME, BlockchainName } from 'src/core/blockchain/models/blockchain-name';

export const rubicProxyContractAddress: Record<BlockchainName, string> = Object.values(
    BLOCKCHAIN_NAME
).reduce((acc, blockchain) => {
    let contractAddress = '0x3335a88bb18fd3b6824b59af62b50ce494143333';
    if (blockchain === BLOCKCHAIN_NAME.OKE_X_CHAIN || blockchain === BLOCKCHAIN_NAME.BOBA) {
        contractAddress = '0x3332241a5a4eCb4c28239A9731ad45De7f000333';
    }
    return {
        ...acc,
        [blockchain]: contractAddress
    };
}, {} as Record<BlockchainName, string>);
