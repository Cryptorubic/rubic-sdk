import { BLOCKCHAIN_NAME } from 'src/core';
import { BitgertCrossChainSupportedBlockchain } from './bitgert-cross-chain-supported-blockchain';

export const bitgertBridges: Record<
    string,
    Record<BitgertCrossChainSupportedBlockchain, string>
> = {
    USDC: {
        [BLOCKCHAIN_NAME.ETHEREUM]: '0x86015115b1Fa388339FE4e287A6775F53836638c',
        [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: '0x6d9c787e3FC3752934eAfbB4463d0DCb7B517d6d',
        [BLOCKCHAIN_NAME.BITGERT]: '0xcf2DF9377A4e3C10e9EA29fDB8879d74C27FCDE7'
    },
    USDT: {
        [BLOCKCHAIN_NAME.ETHEREUM]: '',
        [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: '',
        [BLOCKCHAIN_NAME.BITGERT]: ''
    }
};
