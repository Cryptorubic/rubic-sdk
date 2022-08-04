import { BLOCKCHAIN_NAME } from '@rsdk-core/blockchain/models/blockchain-name';
import { CelerCrossChainSupportedBlockchain } from '@rsdk-features/cross-chain/providers/celer-trade-provider/constants/celer-cross-chain-supported-blockchain';

/**
 * Stores rubic cross-chain contract addresses.
 */
export const celerCrossChainContractsAddresses: Readonly<
    Record<CelerCrossChainSupportedBlockchain, string>
> = {
    [BLOCKCHAIN_NAME.ETHEREUM]: '0x53dC7535028e2fcaCa0d847AD108b9240C0801b1',
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: '0x388c639aEBb5aa3Ff93eA133A38Ea6930BF2C3aC',
    [BLOCKCHAIN_NAME.POLYGON]: '0x070DF4368366AE26A8c35666408FAD686038a6C3',
    [BLOCKCHAIN_NAME.AVALANCHE]: '0xd82bf61411Ce2F6bd46Fd1e3b0459979809D4787',
    [BLOCKCHAIN_NAME.FANTOM]: '0x6B362d1C67D7E4Ff1467dFA38dE642f9D125E8Ad',
    [BLOCKCHAIN_NAME.ARBITRUM]: '0x4347d7ecdba5d78cea92e55ce0996c8b789449a9',
    [BLOCKCHAIN_NAME.AURORA]: '0xbb7f2D427F3456fBd6F7f571d09F332190f770e6'
} as const;
