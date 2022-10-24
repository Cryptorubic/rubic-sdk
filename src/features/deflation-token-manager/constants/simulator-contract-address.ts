import { BLOCKCHAIN_NAME, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';

export const simulatorContractAddress: Partial<Record<EvmBlockchainName, string>> = {
    [BLOCKCHAIN_NAME.POLYGON]: '0x92F524e07fA4aC497e1Bc71aE85EEfe75B2CfB2a',
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: '0xd556457D696733525E4156E8a1Ff71Cd596478D7',
    [BLOCKCHAIN_NAME.ETHEREUM]: ''
};
