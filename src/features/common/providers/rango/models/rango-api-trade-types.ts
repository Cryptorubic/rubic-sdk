import { BRIDGE_TYPE } from 'src/features/cross-chain/calculation-manager/providers/common/models/bridge-type';
import { ON_CHAIN_TRADE_TYPE } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';

export const rangoOnChainTradeTypes = {
    [ON_CHAIN_TRADE_TYPE['10K_SWAP']]: '10KSwap',
    [ON_CHAIN_TRADE_TYPE.PANGOLIN]: 'Pangolin Swap',
    [ON_CHAIN_TRADE_TYPE.SUSHI_SWAP]: 'Sushi Swap',
    [ON_CHAIN_TRADE_TYPE.OSMOSIS_SWAP]: 'Osmosis',
    [ON_CHAIN_TRADE_TYPE.UNISWAP_V2]: 'UniSwapV2',
    [ON_CHAIN_TRADE_TYPE.VVS_FINANCE]: 'VVS Finance',
    [ON_CHAIN_TRADE_TYPE.MM_FINANCE]: 'MM Finance',
    [ON_CHAIN_TRADE_TYPE.CRONA_SWAP]: 'Crona Swap',
    [ON_CHAIN_TRADE_TYPE.OOLONG_SWAP]: 'Oolong Swap',
    [ON_CHAIN_TRADE_TYPE.TRISOLARIS]: 'Trisolaris Swap',
    [ON_CHAIN_TRADE_TYPE.MOJITO_SWAP]: 'Mojito Swap',
    [ON_CHAIN_TRADE_TYPE.NET_SWAP]: 'Netswap',
    [ON_CHAIN_TRADE_TYPE.VOLTAGE_SWAP]: 'Voltage Swap',
    [ON_CHAIN_TRADE_TYPE.PANCAKE_SWAP]: 'PancakeV2',
    [ON_CHAIN_TRADE_TYPE.PANCAKE_SWAP_V3]: 'PancakeV3',
    [ON_CHAIN_TRADE_TYPE.UNI_SWAP_V3]: 'UniSwapV3',
    [ON_CHAIN_TRADE_TYPE.KYBER_SWAP]: 'KyberSwapV3',
    [ON_CHAIN_TRADE_TYPE.JUPITER]: 'Jupiter',
    [ON_CHAIN_TRADE_TYPE.OPEN_OCEAN]: 'Open Ocean',
    [ON_CHAIN_TRADE_TYPE.CURVE]: 'CurveFi',
    [ON_CHAIN_TRADE_TYPE.QUICK_SWAP]: 'Quick Swap',
    [ON_CHAIN_TRADE_TYPE.XY_DEX]: 'XY Finance',
    [ON_CHAIN_TRADE_TYPE.SOLAR_BEAM]: 'Solarbeam',
    [ON_CHAIN_TRADE_TYPE.AURORA_SWAP]: 'Aurora Swap',
    [ON_CHAIN_TRADE_TYPE.STELLA_SWAP]: 'Stella Swap',
    [ON_CHAIN_TRADE_TYPE.ONE_INCH]: '1Inch',
    [ON_CHAIN_TRADE_TYPE.BEAM_SWAP]: 'Beam Swap',
    [ON_CHAIN_TRADE_TYPE.PARA_SWAP]: 'ParaSwap',
    [ON_CHAIN_TRADE_TYPE.SYNAPSE]: 'Synapse Swapper',
    [ON_CHAIN_TRADE_TYPE.FINKUJIRA]: 'Fin Kujira',
    [ON_CHAIN_TRADE_TYPE.SOLANA]: 'Solana Wrapper',
    [ON_CHAIN_TRADE_TYPE.AVNU]: 'Avnu',
    [ON_CHAIN_TRADE_TYPE.ECHO_DEX]: 'EchoDEX',
    [ON_CHAIN_TRADE_TYPE.SPACEFI_SWAP]: 'SpaceFi',
    [ON_CHAIN_TRADE_TYPE.WYND]: 'Wynd Dex',
    [ON_CHAIN_TRADE_TYPE.SUN_SWAP]: 'Sun Swap',
    [ON_CHAIN_TRADE_TYPE.MDEX]: 'MDex',
    [ON_CHAIN_TRADE_TYPE.OKC_SWAP]: 'Okc Swap',
    [ON_CHAIN_TRADE_TYPE.CHERRY_SWAP]: 'Cherry Swap'
} as const;

export const rangoCrossChainTradeTypes = {
    [BRIDGE_TYPE.ACROSS]: 'Across',
    [BRIDGE_TYPE.VOYAGER]: 'Voyager',
    [BRIDGE_TYPE.CBRIDGE]: 'CBridge',
    [BRIDGE_TYPE.RAINBOW]: 'Rainbow Bridge',
    [BRIDGE_TYPE.SYNAPSE]: 'Synapse Bridge',
    [BRIDGE_TYPE.OPTIMISM_GATEWAY]: 'Optimism Bridge',
    [BRIDGE_TYPE.ORBITER_BRIDGE]: 'Orbiter',
    [BRIDGE_TYPE.MAYA_PROTOCOL]: 'Maya Protocol',
    [BRIDGE_TYPE.XY]: 'XY Finance',
    [BRIDGE_TYPE.THORCHAIN]: 'ThorChain',
    [BRIDGE_TYPE.ARBITRUM_BRIDGE]: 'Arbitrum Bridge',
    [BRIDGE_TYPE.ALLBRIDGE]: 'AllBridge',
    [BRIDGE_TYPE.HYPHEN]: 'Hyphen',
    [BRIDGE_TYPE.CIRCLE_CELER_BRIDGE]: 'Circle',
    [BRIDGE_TYPE.IBC]: 'IBC',
    [BRIDGE_TYPE.STARGATE]: 'Stargate',
    [BRIDGE_TYPE.SATELLITE]: 'Satellite',
    [BRIDGE_TYPE.SYMBIOSIS]: 'Symbiosis',
    [BRIDGE_TYPE.OSMOSIS_BRIDGE]: 'Osmosis'
} as const;

export const rangoTradeTypes = { ...rangoOnChainTradeTypes, ...rangoCrossChainTradeTypes } as const;

export type RubicOnChainTradeTypeForRango = keyof typeof rangoOnChainTradeTypes;

export type RubicTradeTypeForRango = keyof typeof rangoTradeTypes;

export type RangoTradeType = (typeof rangoTradeTypes)[keyof typeof rangoTradeTypes];
