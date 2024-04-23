import { CROSS_CHAIN_TRADE_TYPE } from '../models/cross-chain-trade-type';

export const CCR_PROVIDERS_NOT_SUPPORTED_RECEIVER = [
    CROSS_CHAIN_TRADE_TYPE.STARGATE,
    CROSS_CHAIN_TRADE_TYPE.OWL_TO_BRIDGE
] as const;
