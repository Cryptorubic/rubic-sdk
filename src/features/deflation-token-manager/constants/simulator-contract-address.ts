import {
    BLOCKCHAIN_NAME,
    EVM_BLOCKCHAIN_NAME,
    EvmBlockchainName
} from 'src/core/blockchain/models/blockchain-name';

export const simulatorContractAddress: Record<EvmBlockchainName, string> = Object.values(
    EVM_BLOCKCHAIN_NAME
).reduce((acc, blockchain) => {
    let contractAddress = '0x32d43423E6f2293729303fB56C52f853f5683333';
    if (blockchain === BLOCKCHAIN_NAME.POLYGON) {
        contractAddress = '0xf746908a3eb1a6a16cab7cb40bbe47b897b2ebcb';
    }
    return {
        ...acc,
        [blockchain]: contractAddress
    };
}, {} as Record<EvmBlockchainName, string>);
