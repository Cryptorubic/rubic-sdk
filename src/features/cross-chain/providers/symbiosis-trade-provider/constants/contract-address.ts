import { SymbiosisCrossChainSupportedBlockchain } from '@rsdk-features/cross-chain/providers/symbiosis-trade-provider/constants/symbiosis-cross-chain-supported-blockchain';
import { BLOCKCHAIN_NAME } from 'src/core';

export const SYMBIOSIS_CONTRACT_ADDRESS: Record<SymbiosisCrossChainSupportedBlockchain, string> = {
    [BLOCKCHAIN_NAME.ETHEREUM]: '0xb9FF8913b2F78f6406C564FaD213Cd50d75F9B30',
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: '0x51bcdda4d4a71B179abBebd0503e78253CB5CDd1',
    [BLOCKCHAIN_NAME.POLYGON]: '0xcC196928c886EAA0C46df1379C7aD0AC9C923074',
    [BLOCKCHAIN_NAME.AVALANCHE]: '0xdC8bfB670A71e80FD3bD41dBBFef12b6eFBaD844'
};
