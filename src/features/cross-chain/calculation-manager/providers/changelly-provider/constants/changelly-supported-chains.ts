import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

export const changellySupportedChains = [
    BLOCKCHAIN_NAME.ETHEREUM,
    BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
    BLOCKCHAIN_NAME.POLYGON,
    BLOCKCHAIN_NAME.AVALANCHE,
    BLOCKCHAIN_NAME.FANTOM,
    BLOCKCHAIN_NAME.ARBITRUM,
    BLOCKCHAIN_NAME.HARMONY,
    BLOCKCHAIN_NAME.AURORA,
    BLOCKCHAIN_NAME.MANTA_PACIFIC,
    BLOCKCHAIN_NAME.ZK_SYNC,
    BLOCKCHAIN_NAME.ZK_LINK,
    BLOCKCHAIN_NAME.OPTIMISM,
    BLOCKCHAIN_NAME.CRONOS,
    BLOCKCHAIN_NAME.CELO,
    BLOCKCHAIN_NAME.KAVA,
    BLOCKCHAIN_NAME.LINEA,
    BLOCKCHAIN_NAME.BASE,
    BLOCKCHAIN_NAME.ZETACHAIN,
    BLOCKCHAIN_NAME.BLAST,
    BLOCKCHAIN_NAME.ROOTSTOCK,
    BLOCKCHAIN_NAME.TAIKO,
    BLOCKCHAIN_NAME.SEI,
    BLOCKCHAIN_NAME.CORE,
    BLOCKCHAIN_NAME.IOTEX,
    BLOCKCHAIN_NAME.THETA,
    BLOCKCHAIN_NAME.SOLANA,
    BLOCKCHAIN_NAME.NEAR,
    BLOCKCHAIN_NAME.BITCOIN,
    BLOCKCHAIN_NAME.TRON,
    BLOCKCHAIN_NAME.CARDANO,
    BLOCKCHAIN_NAME.ALGORAND,
    BLOCKCHAIN_NAME.ARDOR,
    BLOCKCHAIN_NAME.ARK,
    BLOCKCHAIN_NAME.COSMOS,
    BLOCKCHAIN_NAME.DASH,
    BLOCKCHAIN_NAME.POLKADOT,
    BLOCKCHAIN_NAME.FIRO,
    BLOCKCHAIN_NAME.HEDERA,
    BLOCKCHAIN_NAME.ICON,
    BLOCKCHAIN_NAME.IOST,
    BLOCKCHAIN_NAME.IOTA,
    BLOCKCHAIN_NAME.KOMODO,
    BLOCKCHAIN_NAME.KUSAMA,
    BLOCKCHAIN_NAME.LITECOIN,
    BLOCKCHAIN_NAME.TERRA,
    BLOCKCHAIN_NAME.NANO,
    BLOCKCHAIN_NAME.NEO,
    BLOCKCHAIN_NAME.PIVX,
    BLOCKCHAIN_NAME.QTUM,
    BLOCKCHAIN_NAME.RAVENCOIN,
    BLOCKCHAIN_NAME.TON,
    BLOCKCHAIN_NAME.WAVES,
    BLOCKCHAIN_NAME.WAX,
    BLOCKCHAIN_NAME.NEM,
    BLOCKCHAIN_NAME.STELLAR,
    BLOCKCHAIN_NAME.MONERO,
    BLOCKCHAIN_NAME.RIPPLE,
    BLOCKCHAIN_NAME.TEZOS,
    BLOCKCHAIN_NAME.VERGE,
    BLOCKCHAIN_NAME.ZCASH,
    BLOCKCHAIN_NAME.HORIZEN,
    BLOCKCHAIN_NAME.ZILLIQA,
    BLOCKCHAIN_NAME.FILECOIN,
    BLOCKCHAIN_NAME.EOS,
    BLOCKCHAIN_NAME.ONTOLOGY,
    BLOCKCHAIN_NAME.APTOS
];

export type ChangellySupportedChain = (typeof changellySupportedChains)[number];
