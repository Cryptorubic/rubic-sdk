import { TokenStruct } from 'src/common/tokens/token';
import {
    BLOCKCHAIN_NAME,
    BlockchainName,
    TestnetEvmBlockchain
} from 'src/core/blockchain/models/blockchain-name';

const testnetNativeTokens: Record<TestnetEvmBlockchain, TokenStruct> = {
    [BLOCKCHAIN_NAME.FUJI]: {
        blockchain: BLOCKCHAIN_NAME.FUJI,
        address: '0x0000000000000000000000000000000000000000',
        name: 'AVAX',
        symbol: 'AVAX',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.MUMBAI]: {
        blockchain: BLOCKCHAIN_NAME.MUMBAI,
        address: '0x0000000000000000000000000000000000000000',
        name: 'Matic Network',
        symbol: 'MATIC',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.GOERLI]: {
        blockchain: BLOCKCHAIN_NAME.GOERLI,
        address: '0x0000000000000000000000000000000000000000',
        name: 'Ethereum',
        symbol: 'ETH',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN_TESTNET]: {
        blockchain: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN_TESTNET,
        address: '0x0000000000000000000000000000000000000000',
        name: 'Test Binance Coin',
        symbol: 'tBNB',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.SCROLL_SEPOLIA]: {
        blockchain: BLOCKCHAIN_NAME.SCROLL_SEPOLIA,
        address: '0x0000000000000000000000000000000000000000',
        name: 'ETH',
        symbol: 'ETH',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.ARTHERA]: {
        blockchain: BLOCKCHAIN_NAME.ARTHERA,
        address: '0x0000000000000000000000000000000000000000',
        name: 'Arthera',
        symbol: 'AA',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.SEPOLIA]: {
        blockchain: BLOCKCHAIN_NAME.SEPOLIA,
        address: '0x0000000000000000000000000000000000000000',
        name: 'Ether',
        symbol: 'ETH',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.BERACHAIN]: {
        blockchain: BLOCKCHAIN_NAME.BERACHAIN,
        address: '0x0000000000000000000000000000000000000000',
        name: 'BERA',
        symbol: 'BERA',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.BLAST_TESTNET]: {
        blockchain: BLOCKCHAIN_NAME.BLAST_TESTNET,
        address: '0x0000000000000000000000000000000000000000',
        name: 'Ether',
        symbol: 'ETH',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.HOLESKY]: {
        blockchain: BLOCKCHAIN_NAME.HOLESKY,
        address: '0x0000000000000000000000000000000000000000',
        name: 'Ether',
        symbol: 'ETH',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.UNICHAIN_SEPOLIA_TESTNET]: {
        blockchain: BLOCKCHAIN_NAME.UNICHAIN_SEPOLIA_TESTNET,
        address: '0x0000000000000000000000000000000000000000',
        name: 'Ether',
        symbol: 'ETH',
        decimals: 18
    }
};

export const nativeTokensStruct: Record<BlockchainName, TokenStruct> = {
    ...Object.values(BLOCKCHAIN_NAME).reduce(
        (acc, blockchain) => ({ ...acc, [blockchain]: blockchain }),
        {} as Record<BlockchainName, TokenStruct>
    ),
    ...testnetNativeTokens,
    [BLOCKCHAIN_NAME.ETHEREUM]: {
        blockchain: BLOCKCHAIN_NAME.ETHEREUM,
        address: '0x0000000000000000000000000000000000000000',
        name: 'Ethereum',
        symbol: 'ETH',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: {
        blockchain: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
        address: '0x0000000000000000000000000000000000000000',
        name: 'Binance Coin',
        symbol: 'BNB',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.POLYGON]: {
        blockchain: BLOCKCHAIN_NAME.POLYGON,
        address: '0x0000000000000000000000000000000000000000',
        name: 'Matic Network',
        symbol: 'MATIC',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.POLYGON_ZKEVM]: {
        blockchain: BLOCKCHAIN_NAME.POLYGON_ZKEVM,
        address: '0x0000000000000000000000000000000000000000',
        name: 'ETH',
        symbol: 'ETH',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.AVALANCHE]: {
        blockchain: BLOCKCHAIN_NAME.AVALANCHE,
        address: '0x0000000000000000000000000000000000000000',
        name: 'AVAX',
        symbol: 'AVAX',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.MOONRIVER]: {
        blockchain: BLOCKCHAIN_NAME.MOONRIVER,
        address: '0x0000000000000000000000000000000000000000',
        name: 'MOVR',
        symbol: 'MOVR',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.FANTOM]: {
        blockchain: BLOCKCHAIN_NAME.FANTOM,
        address: '0x0000000000000000000000000000000000000000',
        name: 'FTM',
        symbol: 'FTM',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.HARMONY]: {
        blockchain: BLOCKCHAIN_NAME.HARMONY,
        address: '0x0000000000000000000000000000000000000000',
        name: 'ONE',
        symbol: 'ONE',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.ARBITRUM]: {
        blockchain: BLOCKCHAIN_NAME.ARBITRUM,
        address: '0x0000000000000000000000000000000000000000',
        name: 'AETH',
        symbol: 'AETH',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.AURORA]: {
        blockchain: BLOCKCHAIN_NAME.AURORA,
        address: '0x0000000000000000000000000000000000000000',
        name: 'aETH',
        symbol: 'aETH',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.TELOS]: {
        blockchain: BLOCKCHAIN_NAME.TELOS,
        address: '0x0000000000000000000000000000000000000000',
        name: 'TLOS',
        symbol: 'TLOS',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.OPTIMISM]: {
        blockchain: BLOCKCHAIN_NAME.OPTIMISM,
        address: '0x0000000000000000000000000000000000000000',
        name: 'ETH',
        symbol: 'ETH',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.CRONOS]: {
        blockchain: BLOCKCHAIN_NAME.CRONOS,
        address: '0x0000000000000000000000000000000000000000',
        name: 'CRO',
        symbol: 'CRO',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.OKE_X_CHAIN]: {
        blockchain: BLOCKCHAIN_NAME.OKE_X_CHAIN,
        address: '0x0000000000000000000000000000000000000000',
        name: 'OKT',
        symbol: 'OKT',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.GNOSIS]: {
        blockchain: BLOCKCHAIN_NAME.GNOSIS,
        address: '0x0000000000000000000000000000000000000000',
        name: 'xDAI',
        symbol: 'xDAI',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.FUSE]: {
        blockchain: BLOCKCHAIN_NAME.FUSE,
        address: '0x0000000000000000000000000000000000000000',
        name: 'FUSE',
        symbol: 'FUSE',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.MOONBEAM]: {
        blockchain: BLOCKCHAIN_NAME.MOONBEAM,
        address: '0x0000000000000000000000000000000000000000',
        name: 'GLMR',
        symbol: 'GLMR',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.CELO]: {
        blockchain: BLOCKCHAIN_NAME.CELO,
        address: '0x0000000000000000000000000000000000000000',
        name: 'CELO',
        symbol: 'CELO',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.BOBA]: {
        blockchain: BLOCKCHAIN_NAME.BOBA,
        address: '0x0000000000000000000000000000000000000000',
        name: 'BOBA',
        symbol: 'BOBA',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.BOBA_BSC]: {
        blockchain: BLOCKCHAIN_NAME.BOBA_BSC,
        address: '0x0000000000000000000000000000000000000000',
        name: 'BOBA',
        symbol: 'BOBA',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.ASTAR_EVM]: {
        blockchain: BLOCKCHAIN_NAME.ASTAR_EVM,
        address: '0x0000000000000000000000000000000000000000',
        name: 'ASTR',
        symbol: 'ASTR',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.ETHEREUM_POW]: {
        blockchain: BLOCKCHAIN_NAME.ETHEREUM_POW,
        address: '0x0000000000000000000000000000000000000000',
        name: 'Ethereum PoW',
        symbol: 'ETHW',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.KAVA]: {
        blockchain: BLOCKCHAIN_NAME.KAVA,
        address: '0x0000000000000000000000000000000000000000',
        name: 'KAVA',
        symbol: 'KAVA',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.BITCOIN]: {
        blockchain: BLOCKCHAIN_NAME.BITCOIN,
        address: '0x0000000000000000000000000000000000000000',
        name: 'Bitcoin',
        symbol: 'BTC',
        decimals: 8
    },
    [BLOCKCHAIN_NAME.TRON]: {
        blockchain: BLOCKCHAIN_NAME.TRON,
        address: '0x0000000000000000000000000000000000000000',
        name: 'TRX',
        symbol: 'TRX',
        decimals: 6
    },
    [BLOCKCHAIN_NAME.BITGERT]: {
        blockchain: BLOCKCHAIN_NAME.BITGERT,
        address: '0x0000000000000000000000000000000000000000',
        name: 'Brise',
        symbol: 'BRISE',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.OASIS]: {
        blockchain: BLOCKCHAIN_NAME.OASIS,
        address: '0x0000000000000000000000000000000000000000',
        name: 'ROSE',
        symbol: 'ROSE',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.METIS]: {
        blockchain: BLOCKCHAIN_NAME.METIS,
        address: '0x0000000000000000000000000000000000000000',
        name: 'Metis token',
        symbol: 'METIS',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.DFK]: {
        blockchain: BLOCKCHAIN_NAME.DFK,
        address: '0x0000000000000000000000000000000000000000',
        name: 'JEWEL',
        symbol: 'JEWEL',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.KLAYTN]: {
        blockchain: BLOCKCHAIN_NAME.KLAYTN,
        address: '0x0000000000000000000000000000000000000000',
        name: 'Klaytn',
        symbol: 'KLAY',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.VELAS]: {
        blockchain: BLOCKCHAIN_NAME.VELAS,
        address: '0x0000000000000000000000000000000000000000',
        name: 'Velas',
        symbol: 'VLX',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.SYSCOIN]: {
        blockchain: BLOCKCHAIN_NAME.SYSCOIN,
        address: '0x0000000000000000000000000000000000000000',
        name: 'Syscoin',
        symbol: 'SYS',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.ICP]: {
        blockchain: BLOCKCHAIN_NAME.ICP,
        address: '0x0000000000000000000000000000000000000000',
        name: 'Internet Computer',
        symbol: 'ICP',
        decimals: 8
    },
    [BLOCKCHAIN_NAME.KAVA_COSMOS]: {
        blockchain: BLOCKCHAIN_NAME.KAVA_COSMOS,
        address: '0x0000000000000000000000000000000000000000',
        name: 'Kava',
        symbol: 'KAVA',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.ZK_SYNC]: {
        blockchain: BLOCKCHAIN_NAME.ZK_SYNC,
        address: '0x0000000000000000000000000000000000000000',
        name: 'ETH',
        symbol: 'ETH',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.PULSECHAIN]: {
        blockchain: BLOCKCHAIN_NAME.PULSECHAIN,
        address: '0x0000000000000000000000000000000000000000',
        name: 'PLS',
        symbol: 'PLS',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.LINEA]: {
        blockchain: BLOCKCHAIN_NAME.LINEA,
        address: '0x0000000000000000000000000000000000000000',
        name: 'ETH',
        symbol: 'ETH',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.BASE]: {
        blockchain: BLOCKCHAIN_NAME.BASE,
        address: '0x0000000000000000000000000000000000000000',
        name: 'ETH',
        symbol: 'ETH',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.MANTLE]: {
        blockchain: BLOCKCHAIN_NAME.MANTLE,
        address: '0x0000000000000000000000000000000000000000',
        name: 'Mantle',
        symbol: 'MNT',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.MANTA_PACIFIC]: {
        blockchain: BLOCKCHAIN_NAME.MANTA_PACIFIC,
        address: '0x0000000000000000000000000000000000000000',
        name: 'ETH',
        symbol: 'ETH',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.SCROLL]: {
        blockchain: BLOCKCHAIN_NAME.SCROLL,
        address: '0x0000000000000000000000000000000000000000',
        name: 'ETH',
        symbol: 'ETH',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.ZETACHAIN]: {
        blockchain: BLOCKCHAIN_NAME.ZETACHAIN,
        address: '0x0000000000000000000000000000000000000000',
        name: 'Zeta',
        symbol: 'ZETA',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.SOLANA]: {
        blockchain: BLOCKCHAIN_NAME.SOLANA,
        address: 'So11111111111111111111111111111111111111111',
        name: 'Solana',
        symbol: 'SOL',
        decimals: 9
    },
    [BLOCKCHAIN_NAME.BLAST]: {
        blockchain: BLOCKCHAIN_NAME.BLAST,
        address: '0x0000000000000000000000000000000000000000',
        name: 'Ether',
        symbol: 'ETH',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.KROMA]: {
        blockchain: BLOCKCHAIN_NAME.KROMA,
        address: '0x0000000000000000000000000000000000000000',
        name: 'ETH',
        symbol: 'ETH',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.HORIZEN_EON]: {
        blockchain: BLOCKCHAIN_NAME.HORIZEN_EON,
        address: '0x0000000000000000000000000000000000000000',
        name: 'ZEN',
        symbol: 'ZEN',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.MERLIN]: {
        blockchain: BLOCKCHAIN_NAME.MERLIN,
        address: '0x0000000000000000000000000000000000000000',
        name: 'Bitcoin',
        symbol: 'BTC',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.ROOTSTOCK]: {
        blockchain: BLOCKCHAIN_NAME.ROOTSTOCK,
        address: '0x0000000000000000000000000000000000000000',
        name: 'RBTC',
        symbol: 'RBTC',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.MODE]: {
        blockchain: BLOCKCHAIN_NAME.MODE,
        address: '0x0000000000000000000000000000000000000000',
        name: 'ETH',
        symbol: 'ETH',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.ZK_FAIR]: {
        blockchain: BLOCKCHAIN_NAME.ZK_FAIR,
        address: '0x0000000000000000000000000000000000000000',
        name: 'USDC',
        symbol: 'USDC',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.ZK_LINK]: {
        blockchain: BLOCKCHAIN_NAME.ZK_LINK,
        address: '0x0000000000000000000000000000000000000000',
        name: 'ETH',
        symbol: 'ETH',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.XLAYER]: {
        blockchain: BLOCKCHAIN_NAME.XLAYER,
        address: '0x0000000000000000000000000000000000000000',
        name: 'OK Token',
        symbol: 'OKB',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.TAIKO]: {
        blockchain: BLOCKCHAIN_NAME.TAIKO,
        address: '0x0000000000000000000000000000000000000000',
        name: 'Ether',
        symbol: 'ETH',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.SEI]: {
        blockchain: BLOCKCHAIN_NAME.SEI,
        address: '0x0000000000000000000000000000000000000000',
        name: 'Sei',
        symbol: 'SEI',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.CORE]: {
        blockchain: BLOCKCHAIN_NAME.CORE,
        address: '0x0000000000000000000000000000000000000000',
        name: 'CORE',
        symbol: 'CORE',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.BAHAMUT]: {
        blockchain: BLOCKCHAIN_NAME.BAHAMUT,
        address: '0x0000000000000000000000000000000000000000',
        name: 'FTN',
        symbol: 'FTN',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.TON]: {
        blockchain: BLOCKCHAIN_NAME.TON,
        address: '0x0000000000000000000000000000000000000000',
        name: 'TON',
        symbol: 'TON',
        decimals: 9
    },
    [BLOCKCHAIN_NAME.FLARE]: {
        blockchain: BLOCKCHAIN_NAME.FLARE,
        address: '0x0000000000000000000000000000000000000000',
        name: 'FLR',
        symbol: 'FLR',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.BITLAYER]: {
        blockchain: BLOCKCHAIN_NAME.BITLAYER,
        address: '0x0000000000000000000000000000000000000000',
        name: 'Bitcoin',
        symbol: 'BTC',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.GRAVITY]: {
        blockchain: BLOCKCHAIN_NAME.GRAVITY,
        address: '0x0000000000000000000000000000000000000000',
        name: 'Gravity',
        symbol: 'G',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.COSMOS]: {
        blockchain: BLOCKCHAIN_NAME.COSMOS,
        address: '0x0000000000000000000000000000000000000000',
        name: 'Cosmos',
        symbol: 'ATOM',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.ALGORAND]: {
        blockchain: BLOCKCHAIN_NAME.ALGORAND,
        address: '0x0000000000000000000000000000000000000000',
        name: 'Algorand',
        symbol: 'ALGO',
        decimals: 6
    },
    [BLOCKCHAIN_NAME.NEAR]: {
        blockchain: BLOCKCHAIN_NAME.NEAR,
        address: 'near',
        name: 'NEAR Protocol',
        symbol: 'NEAR',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.CARDANO]: {
        blockchain: BLOCKCHAIN_NAME.CARDANO,
        address: '0x0000000000000000000000000000000000000000',
        name: 'Cardano',
        symbol: 'ADA',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.APTOS]: {
        blockchain: BLOCKCHAIN_NAME.APTOS,
        address: '0x0000000000000000000000000000000000000000',
        name: 'Aptos',
        symbol: 'APT',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.ASTAR]: {
        blockchain: BLOCKCHAIN_NAME.ASTAR,
        address: '0x0000000000000000000000000000000000000000',
        name: 'Astar',
        symbol: 'ASTR',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.DASH]: {
        blockchain: BLOCKCHAIN_NAME.DASH,
        address: '0x0000000000000000000000000000000000000000',
        name: 'Dash',
        symbol: 'DASH',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.DOGECOIN]: {
        blockchain: BLOCKCHAIN_NAME.DOGECOIN,
        address: '0x0000000000000000000000000000000000000000',
        name: 'Dogecoin',
        symbol: 'DOGE',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.POLKADOT]: {
        blockchain: BLOCKCHAIN_NAME.POLKADOT,
        address: '0x0000000000000000000000000000000000000000',
        name: 'Polkadot',
        symbol: 'DOT',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.FLOW]: {
        blockchain: BLOCKCHAIN_NAME.FLOW,
        address: '0x0000000000000000000000000000000000000000',
        name: 'Flow',
        symbol: 'FLOW',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.IOTA]: {
        blockchain: BLOCKCHAIN_NAME.IOTA,
        address: '0x0000000000000000000000000000000000000000',
        name: 'IOTA',
        symbol: 'IOTA',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.KUSAMA]: {
        blockchain: BLOCKCHAIN_NAME.KUSAMA,
        address: '0x0000000000000000000000000000000000000000',
        name: 'Kusama',
        symbol: 'KSM',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.LITECOIN]: {
        blockchain: BLOCKCHAIN_NAME.LITECOIN,
        address: '0x0000000000000000000000000000000000000000',
        name: 'Litecoin',
        symbol: 'LTC',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.NEO]: {
        blockchain: BLOCKCHAIN_NAME.NEO,
        address: '0x0000000000000000000000000000000000000000',
        name: 'Neo',
        symbol: 'NEO',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.OSMOSIS]: {
        blockchain: BLOCKCHAIN_NAME.OSMOSIS,
        address: '0x0000000000000000000000000000000000000000',
        name: 'Osmosis',
        symbol: 'OSMO',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.SECRET]: {
        blockchain: BLOCKCHAIN_NAME.SECRET,
        address: '0x0000000000000000000000000000000000000000',
        name: 'Secret',
        symbol: 'SCRT',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.WAVES]: {
        blockchain: BLOCKCHAIN_NAME.WAVES,
        address: '0x0000000000000000000000000000000000000000',
        name: 'Waves',
        symbol: 'WAVES',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.WAX]: {
        blockchain: BLOCKCHAIN_NAME.WAX,
        address: '0x0000000000000000000000000000000000000000',
        name: 'WAX',
        symbol: 'WAXP',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.STELLAR]: {
        blockchain: BLOCKCHAIN_NAME.STELLAR,
        address: '0x0000000000000000000000000000000000000000',
        name: 'Stellar',
        symbol: 'XLM',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.MONERO]: {
        blockchain: BLOCKCHAIN_NAME.MONERO,
        address: '0x0000000000000000000000000000000000000000',
        name: 'Monero',
        symbol: 'XMR',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.TEZOS]: {
        blockchain: BLOCKCHAIN_NAME.TEZOS,
        address: '0x0000000000000000000000000000000000000000',
        name: 'Tezos',
        symbol: 'XTZ',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.FILECOIN]: {
        blockchain: BLOCKCHAIN_NAME.FILECOIN,
        address: '0x0000000000000000000000000000000000000000',
        name: 'Filecoin',
        symbol: 'FIL',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.EOS]: {
        blockchain: BLOCKCHAIN_NAME.EOS,
        address: '0x0000000000000000000000000000000000000000',
        name: 'EOS',
        symbol: 'EOS',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.ONTOLOGY]: {
        blockchain: BLOCKCHAIN_NAME.ONTOLOGY,
        address: '0x0000000000000000000000000000000000000000',
        name: 'Ontology',
        symbol: 'ONT',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.XDC]: {
        blockchain: BLOCKCHAIN_NAME.XDC,
        address: '0x0000000000000000000000000000000000000000',
        name: 'XDC Network',
        symbol: 'XDC',
        decimals: 18
    },
    [BLOCKCHAIN_NAME.ZILLIQA]: {
        blockchain: BLOCKCHAIN_NAME.ZILLIQA,
        address: '0x0000000000000000000000000000000000000000',
        name: 'ZIL',
        symbol: 'ZIL',
        decimals: 18
    }
};
