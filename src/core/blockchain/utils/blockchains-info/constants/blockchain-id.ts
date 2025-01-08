import { BLOCKCHAIN_NAME, BlockchainName } from 'src/core/blockchain/models/blockchain-name';

const otherChains = Object.values(BLOCKCHAIN_NAME).reduce(
    (acc, blockchain) => ({ ...acc, [blockchain]: NaN }),
    {} as Record<BlockchainName, number>
);

export const blockchainId: Record<BlockchainName, number> = {
    ...otherChains,
    // EVN blockchains
    [BLOCKCHAIN_NAME.ETHEREUM]: 1,
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: 56,
    [BLOCKCHAIN_NAME.POLYGON]: 137,
    [BLOCKCHAIN_NAME.POLYGON_ZKEVM]: 1101,
    [BLOCKCHAIN_NAME.AVALANCHE]: 43114,
    [BLOCKCHAIN_NAME.MOONRIVER]: 1285,
    [BLOCKCHAIN_NAME.FANTOM]: 250,
    [BLOCKCHAIN_NAME.HARMONY]: 1666600000,
    [BLOCKCHAIN_NAME.ARBITRUM]: 42161,
    [BLOCKCHAIN_NAME.AURORA]: 1313161554,
    [BLOCKCHAIN_NAME.TELOS]: 40,
    [BLOCKCHAIN_NAME.OPTIMISM]: 10,
    [BLOCKCHAIN_NAME.CRONOS]: 25,
    [BLOCKCHAIN_NAME.OKE_X_CHAIN]: 66,
    [BLOCKCHAIN_NAME.GNOSIS]: 100,
    [BLOCKCHAIN_NAME.FUSE]: 122,
    [BLOCKCHAIN_NAME.MOONBEAM]: 1284,
    [BLOCKCHAIN_NAME.CELO]: 42220,
    [BLOCKCHAIN_NAME.BOBA]: 288,
    [BLOCKCHAIN_NAME.BOBA_BSC]: 56288,
    [BLOCKCHAIN_NAME.ASTAR_EVM]: 592,
    [BLOCKCHAIN_NAME.ETHEREUM_POW]: 10001,
    [BLOCKCHAIN_NAME.KAVA]: 2222,
    [BLOCKCHAIN_NAME.TRON]: 195,
    [BLOCKCHAIN_NAME.BITGERT]: 32520,
    [BLOCKCHAIN_NAME.OASIS]: 42262,
    [BLOCKCHAIN_NAME.METIS]: 1088,
    [BLOCKCHAIN_NAME.DFK]: 53935,
    [BLOCKCHAIN_NAME.KLAYTN]: 8217,
    [BLOCKCHAIN_NAME.VELAS]: 106,
    [BLOCKCHAIN_NAME.SYSCOIN]: 57,
    [BLOCKCHAIN_NAME.EOS]: 59,
    [BLOCKCHAIN_NAME.ETHEREUM_CLASSIC]: 61,
    [BLOCKCHAIN_NAME.FLARE]: 14,
    [BLOCKCHAIN_NAME.IOTEX]: 4689,
    [BLOCKCHAIN_NAME.ONTOLOGY]: 58,
    [BLOCKCHAIN_NAME.THETA]: 361,
    [BLOCKCHAIN_NAME.XDC]: 50,
    [BLOCKCHAIN_NAME.BITCOIN_CASH]: 10000,
    [BLOCKCHAIN_NAME.ZK_SYNC]: 324,
    [BLOCKCHAIN_NAME.PULSECHAIN]: 369,
    [BLOCKCHAIN_NAME.LINEA]: 59144,
    [BLOCKCHAIN_NAME.BASE]: 8453,
    [BLOCKCHAIN_NAME.MANTLE]: 5000,
    [BLOCKCHAIN_NAME.MANTA_PACIFIC]: 169,
    [BLOCKCHAIN_NAME.SCROLL]: 534352,
    [BLOCKCHAIN_NAME.ZETACHAIN]: 7000,
    [BLOCKCHAIN_NAME.BLAST]: 81457,
    [BLOCKCHAIN_NAME.KROMA]: 255,
    [BLOCKCHAIN_NAME.HORIZEN_EON]: 7332,
    [BLOCKCHAIN_NAME.MERLIN]: 4200,
    [BLOCKCHAIN_NAME.ROOTSTOCK]: 30,
    [BLOCKCHAIN_NAME.MODE]: 34443,
    [BLOCKCHAIN_NAME.ZK_FAIR]: 42766,
    [BLOCKCHAIN_NAME.ZK_LINK]: 810180,
    [BLOCKCHAIN_NAME.XLAYER]: 196,
    [BLOCKCHAIN_NAME.TAIKO]: 167000,
    [BLOCKCHAIN_NAME.SEI]: 1329,
    [BLOCKCHAIN_NAME.CORE]: 1116,
    [BLOCKCHAIN_NAME.BAHAMUT]: 5165,
    [BLOCKCHAIN_NAME.BITLAYER]: 200901,
    [BLOCKCHAIN_NAME.GRAVITY]: 1625,
    [BLOCKCHAIN_NAME.SONIC]: 146,
    [BLOCKCHAIN_NAME.MORPH]: 2818,
    // Tesnents
    [BLOCKCHAIN_NAME.GOERLI]: 5,
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN_TESTNET]: 87,
    [BLOCKCHAIN_NAME.MUMBAI]: 80001,
    [BLOCKCHAIN_NAME.FUJI]: 43113,
    [BLOCKCHAIN_NAME.SCROLL_SEPOLIA]: 534351,
    [BLOCKCHAIN_NAME.ARTHERA]: 10243,
    [BLOCKCHAIN_NAME.SEPOLIA]: 11155111,
    [BLOCKCHAIN_NAME.BERACHAIN]: 80084,
    [BLOCKCHAIN_NAME.BLAST_TESTNET]: 168587773,
    [BLOCKCHAIN_NAME.HOLESKY]: 17000,
    [BLOCKCHAIN_NAME.UNICHAIN_SEPOLIA_TESTNET]: 1301,
    // Non EVN blockchains
    [BLOCKCHAIN_NAME.BITCOIN]: 5555,
    [BLOCKCHAIN_NAME.FILECOIN]: 314,
    [BLOCKCHAIN_NAME.SOLANA]: 7565164,
    [BLOCKCHAIN_NAME.DOGECOIN]: 2000,
    [BLOCKCHAIN_NAME.TON]: 9999
};
