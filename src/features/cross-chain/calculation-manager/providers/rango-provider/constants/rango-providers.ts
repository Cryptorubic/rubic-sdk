import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';

export const rangoProviders: Record<string, OnChainTradeType> = {
    SpookySwap: ON_CHAIN_TRADE_TYPE.SPOOKY_SWAP,
    OneInchArbitrum: ON_CHAIN_TRADE_TYPE.ONE_INCH,
    OneInchBsc: ON_CHAIN_TRADE_TYPE.ONE_INCH,
    OneInchEth: ON_CHAIN_TRADE_TYPE.ONE_INCH,
    OneInchGnosis: ON_CHAIN_TRADE_TYPE.ONE_INCH,
    OneInchOptimism: ON_CHAIN_TRADE_TYPE.ONE_INCH,
    OneInchPolygon: ON_CHAIN_TRADE_TYPE.ONE_INCH,
    TrisolarisSwap: ON_CHAIN_TRADE_TYPE.TRISOLARIS,
    AuroraSwap: ON_CHAIN_TRADE_TYPE.AURORA_SWAP,
    BeamSwap: ON_CHAIN_TRADE_TYPE.BEAM_SWAP,
    CronaSwap: ON_CHAIN_TRADE_TYPE.CRONA_SWAP,
    MMFinance: ON_CHAIN_TRADE_TYPE.MM_FINANCE,
    VVSFinance: ON_CHAIN_TRADE_TYPE.VVS_FINANCE,
    Jupiter: ON_CHAIN_TRADE_TYPE.JUPITER,
    OpenOceanFantom: ON_CHAIN_TRADE_TYPE.OPEN_OCEAN,
    PancakeSwapBsc: ON_CHAIN_TRADE_TYPE.PANCAKE_SWAP,
    PangolinSwap: ON_CHAIN_TRADE_TYPE.PANGOLIN,
    'ParaSwap Avalanche': ON_CHAIN_TRADE_TYPE.PARA_SWAP,
    'ParaSwap Polygon': ON_CHAIN_TRADE_TYPE.PARA_SWAP,
    QuickSwap: ON_CHAIN_TRADE_TYPE.QUICK_SWAP,
    SolarbeamSwap: ON_CHAIN_TRADE_TYPE.SOLAR_BEAM,
    StellaSwap: ON_CHAIN_TRADE_TYPE.STELLA_SWAP,
    SushiArbitrum: ON_CHAIN_TRADE_TYPE.SUSHI_SWAP,
    EthUniSwapv2: ON_CHAIN_TRADE_TYPE.UNISWAP_V2,
    ViperSwap: ON_CHAIN_TRADE_TYPE.VIPER_SWAP,
    VoltageSwap: ON_CHAIN_TRADE_TYPE.VOLTAGE_SWAP
};
