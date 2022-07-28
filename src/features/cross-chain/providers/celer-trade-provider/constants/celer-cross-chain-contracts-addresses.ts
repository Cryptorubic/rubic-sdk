import { BLOCKCHAIN_NAME } from '@rsdk-core/blockchain/models/blockchain-name';
import { CelerCrossChainSupportedBlockchain } from '@rsdk-features/cross-chain/providers/celer-trade-provider/constants/celer-cross-chain-supported-blockchain';

/**
 * Stores rubic cross-chain contract addresses.
 */
export const celerCrossChainContractsAddresses: Readonly<
    Record<CelerCrossChainSupportedBlockchain, string>
> = {
    [BLOCKCHAIN_NAME.ETHEREUM]: '0x53dC7535028e2fcaCa0d847AD108b9240C0801b1',
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: '0x853c0BB91193fa98FB42f9b11f44561Fd1Ee2EdC',
    [BLOCKCHAIN_NAME.POLYGON]: '0x13bFe036886ef8d916955354216245e9EdB160Ff',
    [BLOCKCHAIN_NAME.AVALANCHE]: '0xd82bf61411Ce2F6bd46Fd1e3b0459979809D4787',
    [BLOCKCHAIN_NAME.FANTOM]: '0x6B362d1C67D7E4Ff1467dFA38dE642f9D125E8Ad',
    [BLOCKCHAIN_NAME.ARBITRUM]: '0x53dC7535028e2fcaCa0d847AD108b9240C0801b1'
} as const;
