import { BLOCKCHAIN_NAME } from '@rsdk-core/blockchain/models/blockchain-name';
import { CelerCrossChainSupportedBlockchain } from '@rsdk-features/cross-chain/providers/celer-trade-provider/constants/celer-cross-chain-supported-blockchain';

const commonAddress = '0x333e885469d29f623681d8157a2faad5bf4e3333';

/**
 * Stores rubic cross-chain contract addresses.
 */
export const celerCrossChainContractsAddresses: Readonly<
    Record<CelerCrossChainSupportedBlockchain, string>
> = {
    [BLOCKCHAIN_NAME.ETHEREUM]: commonAddress,
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: commonAddress,
    [BLOCKCHAIN_NAME.POLYGON]: commonAddress,
    [BLOCKCHAIN_NAME.AVALANCHE]: commonAddress,
    [BLOCKCHAIN_NAME.FANTOM]: commonAddress,
    [BLOCKCHAIN_NAME.ARBITRUM]: commonAddress,
    [BLOCKCHAIN_NAME.AURORA]: commonAddress
} as const;
