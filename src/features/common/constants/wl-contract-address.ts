import {
    BLOCKCHAIN_NAME,
    EVM_BLOCKCHAIN_NAME,
    EvmBlockchainName
} from 'src/core/blockchain/models/blockchain-name';

export const wlContractAddress: Record<EvmBlockchainName, string> = Object.values(
    EVM_BLOCKCHAIN_NAME
).reduce((acc, blockchain) => {
    let contractAddress = '0x3330ee066fc570D56b4dfF6dE707C6A2998fd723';
    if (
        blockchain === BLOCKCHAIN_NAME.POLYGON ||
        blockchain === BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN
    ) {
        contractAddress = '0x7445a1617cb03438632993707b272951ff15600f';
    }
    return {
        ...acc,
        [blockchain]: contractAddress
    };
}, {} as Record<EvmBlockchainName, string>);
