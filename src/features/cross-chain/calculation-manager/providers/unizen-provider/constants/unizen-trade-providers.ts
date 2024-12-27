import { ON_CHAIN_TRADE_TYPE } from 'src/features/on-chain/calculation-manager/models/on-chain-trade-type';

import { CROSS_CHAIN_TRADE_TYPE } from '../../../models/cross-chain-trade-type';

export const uniZenCcrTradeProviders = {
    CROSS_CHAIN_STARGATE: CROSS_CHAIN_TRADE_TYPE.STARGATE,
    CROSS_CHAIN_CELER: CROSS_CHAIN_TRADE_TYPE.CELER_BRIDGE,
    CROSS_CHAIN_DEBRIDGE: CROSS_CHAIN_TRADE_TYPE.DEBRIDGE,
    CROSS_CHAIN_LAYERZERO: CROSS_CHAIN_TRADE_TYPE.LAYERZERO,
    CROSS_CHAIN_MESON: CROSS_CHAIN_TRADE_TYPE.MESON
};

export type UniZenCcrTradeProvider = keyof typeof uniZenCcrTradeProviders;

export const uniZenCcrTradeDexes = {
    pancakeswap: ON_CHAIN_TRADE_TYPE.PANCAKE_SWAP,
    curve: ON_CHAIN_TRADE_TYPE.CURVE,
    aerodrome: ON_CHAIN_TRADE_TYPE.AERODROME
};

export type UniZenCcrTradeDex = keyof typeof uniZenCcrTradeDexes;
