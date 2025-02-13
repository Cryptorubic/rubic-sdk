import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

import { TeleSwapCcrSupportedChain } from './teleswap-ccr-supported-chains';

export const teleSwapContractAddresses: Partial<Record<TeleSwapCcrSupportedChain, string>> = {
    // Cross-chain chains: EthConnectorProxy
    [BLOCKCHAIN_NAME.ETHEREUM]: '0xFA1B28052Bd8087B1CF64eE9429FEB324e95B0ff',
    [BLOCKCHAIN_NAME.ARBITRUM]: '0xec4A7D93750BbcE2A07fd1bc748507ea645e9d52',
    [BLOCKCHAIN_NAME.OPTIMISM]: '0xec4A7D93750BbcE2A07fd1bc748507ea645e9d52',
    [BLOCKCHAIN_NAME.BASE]: '0xec4A7D93750BbcE2A07fd1bc748507ea645e9d52',

    // Base chains: BurnRouterProxy
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: '0x2787D48e0B74125597DD479978a5DE09Bb9a3C15',
    [BLOCKCHAIN_NAME.POLYGON]: '0x0009876C47F6b2f0BCB41eb9729736757486c75f'
};
