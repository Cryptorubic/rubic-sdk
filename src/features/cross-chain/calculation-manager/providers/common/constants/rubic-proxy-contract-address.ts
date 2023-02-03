import { BLOCKCHAIN_NAME, BlockchainName } from 'src/core/blockchain/models/blockchain-name';

export const rubicProxyContractAddress: Record<BlockchainName, string> = Object.values(
    BLOCKCHAIN_NAME
).reduce((acc, blockchain) => {
    const contractAddress = '0x6c85a9ed880565f30852ebf5f0da97b5e80aa328';
    // if (blockchain === BLOCKCHAIN_NAME.POLYGON) {
    //     contractAddress = '0x6c85a9ed880565f30852ebf5f0da97b5e80aa328';
    //     x
    // }
    // if (blockchain === BLOCKCHAIN_NAME.TRON) {
    //     contractAddress = 'TYfrVeJLCokb4fpK5Fx29BoVfyoBFrW1C4';
    // }
    return {
        ...acc,
        [blockchain]: contractAddress
    };
}, {} as Record<BlockchainName, string>);
