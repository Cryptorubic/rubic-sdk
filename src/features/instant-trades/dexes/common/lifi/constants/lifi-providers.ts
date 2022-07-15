import { TRADE_TYPE, TradeType } from 'src/features/instant-trades/models/trade-type';

export const lifiProviders: Record<string, TradeType> = {
    '0x': TRADE_TYPE.ZRX,
    '1inch': TRADE_TYPE.ONE_INCH,
    paraswap: TRADE_TYPE.PARA_SWAP,
    openocean: TRADE_TYPE.OPEN_OCEAN,
    dodo: TRADE_TYPE.DODO,
    sushiswap: TRADE_TYPE.SUSHI_SWAP,
    honeyswap: TRADE_TYPE.HONEY_SWAP,
    steallaswap: TRADE_TYPE.STELLA_SWAP,
    beamswap: TRADE_TYPE.BEAM_SWAP,
    ubeswap: TRADE_TYPE.UBE_SWAP,
    jswap: TRADE_TYPE.J_SWAP
};
