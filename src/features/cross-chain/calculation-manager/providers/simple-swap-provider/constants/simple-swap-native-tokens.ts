import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

import { SimpleSwapCcrSupportedChain } from './simple-swap-ccr-api-blockchain';

export const simpleSwapNativeTokenTickers: Partial<Record<SimpleSwapCcrSupportedChain, string>> = {
    [BLOCKCHAIN_NAME.ETHEREUM]: 'eth',
    [BLOCKCHAIN_NAME.BITCOIN]: 'btc',
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: 'bnb-bsc',
    [BLOCKCHAIN_NAME.POLYGON]: 'pol',
    [BLOCKCHAIN_NAME.AVALANCHE]: 'avaxc',
    [BLOCKCHAIN_NAME.MOONRIVER]: 'movr',
    [BLOCKCHAIN_NAME.BASE]: 'eth',
    [BLOCKCHAIN_NAME.SCROLL]: 'eth',
    [BLOCKCHAIN_NAME.FANTOM]: 'ftm',
    [BLOCKCHAIN_NAME.HARMONY]: 'one',
    [BLOCKCHAIN_NAME.ARBITRUM]: 'eth',
    [BLOCKCHAIN_NAME.TELOS]: 'tlos',
    [BLOCKCHAIN_NAME.CRONOS]: 'cro',
    [BLOCKCHAIN_NAME.MOONBEAM]: 'glmr',
    [BLOCKCHAIN_NAME.KAVA]: 'kavaevm',
    [BLOCKCHAIN_NAME.VELAS]: 'vlx',
    [BLOCKCHAIN_NAME.SYSCOIN]: 'sys',
    [BLOCKCHAIN_NAME.IOTEX]: 'iotx',
    [BLOCKCHAIN_NAME.ZK_SYNC]: 'eth',
    [BLOCKCHAIN_NAME.MANTA_PACIFIC]: 'eth',
    [BLOCKCHAIN_NAME.MANTLE]: 'mnt',
    [BLOCKCHAIN_NAME.ZETACHAIN]: 'zeta',
    [BLOCKCHAIN_NAME.SEI]: 'sei',
    [BLOCKCHAIN_NAME.CORE]: 'core',
    [BLOCKCHAIN_NAME.CELO]: 'celo',
    [BLOCKCHAIN_NAME.LINEA]: 'eth',
    [BLOCKCHAIN_NAME.OASIS]: 'rose',
    [BLOCKCHAIN_NAME.METIS]: 'metis',
    [BLOCKCHAIN_NAME.PULSECHAIN]: 'pls',
    [BLOCKCHAIN_NAME.FLARE]: 'flr',
    [BLOCKCHAIN_NAME.THETA]: 'theta',
    [BLOCKCHAIN_NAME.SOLANA]: 'sol',
    [BLOCKCHAIN_NAME.NEAR]: 'near',
    [BLOCKCHAIN_NAME.TRON]: 'trx',
    [BLOCKCHAIN_NAME.ICP]: 'icp',
    [BLOCKCHAIN_NAME.CARDANO]: 'ada',
    [BLOCKCHAIN_NAME.ALGORAND]: 'algo',
    [BLOCKCHAIN_NAME.APTOS]: 'apt',
    [BLOCKCHAIN_NAME.ASTAR]: 'astr',
    [BLOCKCHAIN_NAME.COSMOS]: 'atom',
    [BLOCKCHAIN_NAME.DASH]: 'dash',
    [BLOCKCHAIN_NAME.DOGECOIN]: 'doge',
    [BLOCKCHAIN_NAME.POLKADOT]: 'dot',
    [BLOCKCHAIN_NAME.FLOW]: 'flow',
    [BLOCKCHAIN_NAME.IOTA]: 'iota',
    [BLOCKCHAIN_NAME.KUSAMA]: 'ksm',
    [BLOCKCHAIN_NAME.LITECOIN]: 'ltc',
    [BLOCKCHAIN_NAME.NEO]: 'neo',
    [BLOCKCHAIN_NAME.OSMOSIS]: 'osmo',
    [BLOCKCHAIN_NAME.SECRET]: 'scrt',
    [BLOCKCHAIN_NAME.TON]: 'ton',
    [BLOCKCHAIN_NAME.OPTIMISM]: 'eth',
    [BLOCKCHAIN_NAME.WAVES]: 'waves',
    [BLOCKCHAIN_NAME.WAX]: 'waxp',
    [BLOCKCHAIN_NAME.STELLAR]: 'xlm',
    [BLOCKCHAIN_NAME.MONERO]: 'xmr',
    [BLOCKCHAIN_NAME.TEZOS]: 'xtz',
    [BLOCKCHAIN_NAME.FILECOIN]: 'fil',
    [BLOCKCHAIN_NAME.EOS]: 'eos',
    [BLOCKCHAIN_NAME.ONTOLOGY]: 'ont',
    [BLOCKCHAIN_NAME.XDC]: 'xdc',
    [BLOCKCHAIN_NAME.ZILLIQA]: 'zil',
    [BLOCKCHAIN_NAME.KAVA_COSMOS]: 'kava',
    [BLOCKCHAIN_NAME.MINA_PROTOCOL]: 'mina',
    [BLOCKCHAIN_NAME.SIA]: 'sc'
};
