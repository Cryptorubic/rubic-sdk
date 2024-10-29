import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

export const simpleSwapEvmSupportedChains = {
    [BLOCKCHAIN_NAME.ETHEREUM]: 'eth',
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: 'bsc',
    [BLOCKCHAIN_NAME.POLYGON]: 'matic',
    [BLOCKCHAIN_NAME.AVALANCHE]: 'avaxc',
    [BLOCKCHAIN_NAME.MOONRIVER]: 'movr',
    [BLOCKCHAIN_NAME.FANTOM]: 'ftm',
    [BLOCKCHAIN_NAME.HARMONY]: 'one',
    [BLOCKCHAIN_NAME.ARBITRUM]: 'arbitrum',
    [BLOCKCHAIN_NAME.OPTIMISM]: 'optimism',
    [BLOCKCHAIN_NAME.TELOS]: 'tlos', // tlosevm ?
    [BLOCKCHAIN_NAME.CRONOS]: 'croevm', // cronos ?
    [BLOCKCHAIN_NAME.MOONBEAM]: 'glmr',
    [BLOCKCHAIN_NAME.KAVA]: 'kavaevm',
    [BLOCKCHAIN_NAME.KLAYTN]: 'klaytn', // klay
    [BLOCKCHAIN_NAME.VELAS]: 'vlx',
    [BLOCKCHAIN_NAME.SYSCOIN]: 'sysnevm',
    [BLOCKCHAIN_NAME.IOTEX]: 'iotx',
    [BLOCKCHAIN_NAME.LINEA]: 'linea',
    [BLOCKCHAIN_NAME.BASE]: 'base',
    [BLOCKCHAIN_NAME.MANTLE]: 'mnt',
    [BLOCKCHAIN_NAME.SCROLL]: 'scroll',
    [BLOCKCHAIN_NAME.ZETACHAIN]: 'zeta',
    [BLOCKCHAIN_NAME.BLAST]: 'blast',
    [BLOCKCHAIN_NAME.MODE]: 'mode',
    [BLOCKCHAIN_NAME.TAIKO]: 'taiko',
    [BLOCKCHAIN_NAME.SEI]: 'seievm', // sei ?
    [BLOCKCHAIN_NAME.CORE]: 'core',
    [BLOCKCHAIN_NAME.MANTA_PACIFIC]: 'manta',
    [BLOCKCHAIN_NAME.CELO]: 'celo',
    [BLOCKCHAIN_NAME.ZK_LINK]: 'zklnova',
    [BLOCKCHAIN_NAME.ZK_SYNC]: 'zkSync',
    [BLOCKCHAIN_NAME.OASIS]: 'rose'
};

export const simpleSwapApiChain = {
    // EVM
    ...simpleSwapEvmSupportedChains,
    // NON-EVM
    [BLOCKCHAIN_NAME.FLARE]: 'flr',
    [BLOCKCHAIN_NAME.THETA]: 'theta',
    [BLOCKCHAIN_NAME.SOLANA]: 'sol', // solana
    [BLOCKCHAIN_NAME.NEAR]: 'near',
    [BLOCKCHAIN_NAME.BITCOIN]: 'btc',
    [BLOCKCHAIN_NAME.TRON]: 'trx',
    [BLOCKCHAIN_NAME.ICP]: 'icp',
    [BLOCKCHAIN_NAME.CARDANO]: 'ada',
    [BLOCKCHAIN_NAME.ALGORAND]: 'algo',
    [BLOCKCHAIN_NAME.APTOS]: 'apt', // aptos
    [BLOCKCHAIN_NAME.ARDOR]: 'ardr',
    [BLOCKCHAIN_NAME.ARK]: 'ark',
    [BLOCKCHAIN_NAME.ASTAR]: 'astr',
    [BLOCKCHAIN_NAME.COSMOS]: 'atom',
    [BLOCKCHAIN_NAME.BSV]: 'bsv',
    [BLOCKCHAIN_NAME.CASPER]: 'cspr',
    [BLOCKCHAIN_NAME.DASH]: 'dash',
    [BLOCKCHAIN_NAME.DOGECOIN]: 'dogechain',
    [BLOCKCHAIN_NAME.POLKADOT]: 'dot',
    [BLOCKCHAIN_NAME.FLOW]: 'flow',
    [BLOCKCHAIN_NAME.IOTA]: 'iota',
    [BLOCKCHAIN_NAME.KUSAMA]: 'ksm', // kusama
    [BLOCKCHAIN_NAME.LITECOIN]: 'ltc',
    [BLOCKCHAIN_NAME.NEO]: 'neo',
    [BLOCKCHAIN_NAME.OSMOSIS]: 'osmo',
    [BLOCKCHAIN_NAME.SECRET]: 'scrt',
    [BLOCKCHAIN_NAME.TON]: 'ton',
    [BLOCKCHAIN_NAME.WAVES]: 'waves',
    [BLOCKCHAIN_NAME.WAX]: 'wax',
    [BLOCKCHAIN_NAME.STELLAR]: 'xlm',
    [BLOCKCHAIN_NAME.MONERO]: 'xmr',
    [BLOCKCHAIN_NAME.TEZOS]: 'xtz',
    [BLOCKCHAIN_NAME.HORIZEN]: 'zen', // horizen eon ?
    [BLOCKCHAIN_NAME.FILECOIN]: 'fil',
    [BLOCKCHAIN_NAME.EOS]: 'eos',
    [BLOCKCHAIN_NAME.ONTOLOGY]: 'ont',
    [BLOCKCHAIN_NAME.XDC]: 'xdc',
    [BLOCKCHAIN_NAME.ZILLIQA]: 'zil',
    [BLOCKCHAIN_NAME.KAVA_COSMOS]: 'kava'
};

export type SimpleSwapCcrSupportedChain = keyof typeof simpleSwapApiChain;
