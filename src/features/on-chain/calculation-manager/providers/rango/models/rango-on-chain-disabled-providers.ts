import { RubicTypeForRango } from 'src/features/common/providers/rango/models/rango-api-trade-types';

import { ON_CHAIN_TRADE_TYPE } from '../../common/models/on-chain-trade-type';

export const rangoOnChainDisabledProviders: RubicTypeForRango[] = [
    ON_CHAIN_TRADE_TYPE.OSMOSIS_SWAP,
    ON_CHAIN_TRADE_TYPE.OOLONG_SWAP,
    ON_CHAIN_TRADE_TYPE['10K_SWAP'],
    ON_CHAIN_TRADE_TYPE.FINKUJIRA,
    ON_CHAIN_TRADE_TYPE.SOLANA,
    ON_CHAIN_TRADE_TYPE.JUPITER,
    ON_CHAIN_TRADE_TYPE.SOLAR_BEAM,
    ON_CHAIN_TRADE_TYPE.WYND,
    ON_CHAIN_TRADE_TYPE.SUN_SWAP,
    ON_CHAIN_TRADE_TYPE.MDEX,
    ON_CHAIN_TRADE_TYPE.BEAM_SWAP,
    ON_CHAIN_TRADE_TYPE.OKC_SWAP
] as const;
