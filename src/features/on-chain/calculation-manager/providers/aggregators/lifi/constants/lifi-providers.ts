import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';

export const lifiProviders: Record<string, OnChainTradeType> = {
    '0x': ON_CHAIN_TRADE_TYPE.ZRX,
    '1inch': ON_CHAIN_TRADE_TYPE.ONE_INCH,
    openocean: ON_CHAIN_TRADE_TYPE.OPEN_OCEAN,
    dodo: ON_CHAIN_TRADE_TYPE.DODO,
    sushiswap: ON_CHAIN_TRADE_TYPE.SUSHI_SWAP,
    'sushiswap-fus': ON_CHAIN_TRADE_TYPE.SUSHI_SWAP,
    honeyswap: ON_CHAIN_TRADE_TYPE.HONEY_SWAP,
    stellaswap: ON_CHAIN_TRADE_TYPE.STELLA_SWAP,
    beamswap: ON_CHAIN_TRADE_TYPE.BEAM_SWAP,
    ubeswap: ON_CHAIN_TRADE_TYPE.UBE_SWAP,
    jswap: ON_CHAIN_TRADE_TYPE.J_SWAP,
    cronaswap: ON_CHAIN_TRADE_TYPE.CRONA_SWAP,
    odos: ON_CHAIN_TRADE_TYPE.ODOS,
    uniswap: ON_CHAIN_TRADE_TYPE.UNI_SWAP_V3,
    apeswap: ON_CHAIN_TRADE_TYPE.APE_SWAP,
    verse: ON_CHAIN_TRADE_TYPE.VERSE,
    quickswap: ON_CHAIN_TRADE_TYPE.QUICK_SWAP,
    lif3swap: ON_CHAIN_TRADE_TYPE.LIFI,
    pancakeswap: ON_CHAIN_TRADE_TYPE.PANCAKE_SWAP,
    kyberswap: ON_CHAIN_TRADE_TYPE.KYBER_SWAP,
    spookyswap: ON_CHAIN_TRADE_TYPE.SPOOKY_SWAP,
    spiritswap: ON_CHAIN_TRADE_TYPE.SPIRIT_SWAP,
    pangolin: ON_CHAIN_TRADE_TYPE.PANGOLIN,
    solarbeam: ON_CHAIN_TRADE_TYPE.SOLAR_BEAM,
    voltage: ON_CHAIN_TRADE_TYPE.VOLTAGE_SWAP,
    oolongswap: ON_CHAIN_TRADE_TYPE.OOLONG_SWAP,
    trisolaris: ON_CHAIN_TRADE_TYPE.TRISOLARIS,
    // NONAME LIFI SUB-PROVIDERS
    tombswap: ON_CHAIN_TRADE_TYPE.LIFI,
    swapr: ON_CHAIN_TRADE_TYPE.LIFI,
    arbswap: ON_CHAIN_TRADE_TYPE.LIFI,
    diffusion: ON_CHAIN_TRADE_TYPE.LIFI,
    cronus: ON_CHAIN_TRADE_TYPE.LIFI,
    evmoswap: ON_CHAIN_TRADE_TYPE.LIFI,
    stable: ON_CHAIN_TRADE_TYPE.LIFI,
    propeller: ON_CHAIN_TRADE_TYPE.LIFI,
    enso: ON_CHAIN_TRADE_TYPE.LIFI
};
