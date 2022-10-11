import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/calculation-manager/providers/models/on-chain-trade-type';

export const lifiProviders: Record<string, OnChainTradeType> = {
    '0x': ON_CHAIN_TRADE_TYPE.ZRX,
    '1inch': ON_CHAIN_TRADE_TYPE.ONE_INCH,
    paraswap: ON_CHAIN_TRADE_TYPE.PARA_SWAP,
    openocean: ON_CHAIN_TRADE_TYPE.OPEN_OCEAN,
    dodo: ON_CHAIN_TRADE_TYPE.DODO,
    sushiswap: ON_CHAIN_TRADE_TYPE.SUSHI_SWAP,
    honeyswap: ON_CHAIN_TRADE_TYPE.HONEY_SWAP,
    stellaswap: ON_CHAIN_TRADE_TYPE.STELLA_SWAP,
    beamswap: ON_CHAIN_TRADE_TYPE.BEAM_SWAP,
    ubeswap: ON_CHAIN_TRADE_TYPE.UBE_SWAP,
    jswap: ON_CHAIN_TRADE_TYPE.J_SWAP,
    cronaswap: ON_CHAIN_TRADE_TYPE.CRONA_SWAP
};
