import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { StargateCrossChainSupportedBlockchain } from 'src/features/cross-chain/calculation-manager/providers/stargate-provider/constants/stargate-cross-chain-supported-blockchain';

export const relayersAddresses: Record<StargateCrossChainSupportedBlockchain, string> = {
    [BLOCKCHAIN_NAME.ETHEREUM]: '0x',
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: '0xBa26705a3EC868eDc5554FA18F9C756859fabB6E',
    [BLOCKCHAIN_NAME.POLYGON]: '0x',
    [BLOCKCHAIN_NAME.AVALANCHE]: '0x',
    [BLOCKCHAIN_NAME.FANTOM]: '0x',
    [BLOCKCHAIN_NAME.ARBITRUM]: '0x',
    [BLOCKCHAIN_NAME.OPTIMISM]: '0x',
    [BLOCKCHAIN_NAME.METIS]: '0x'
};
