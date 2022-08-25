/**
 * List of instant trade types.
 */
export const TRADE_TYPE = {
    // Common
    ONE_INCH: 'ONE_INCH',
    SUSHI_SWAP: 'SUSHI_SWAP',
    UNI_SWAP_V3: 'UNI_SWAP_V3',
    ZRX: 'ZRX',
    PARA_SWAP: 'PARA_SWAP',
    OPEN_OCEAN: 'OPEN_OCEAN',
    DODO: 'DODO',
    HONEY_SWAP: 'HONEY_SWAP',
    J_SWAP: 'J_SWAP',

    // Ethereum
    UNISWAP_V2: 'UNISWAP_V2',

    // Bsc
    PANCAKE_SWAP: 'PANCAKE_SWAP',

    // Polygon
    ALGEBRA: 'ALGEBRA',
    QUICK_SWAP: 'QUICK_SWAP',

    // Avalanche
    JOE: 'JOE',
    PANGOLIN: 'PANGOLIN',

    // Moonriver
    SOLAR_BEAM: 'SOLAR_BEAM',

    // Fantom
    SPIRIT_SWAP: 'SPIRIT_SWAP',
    SPOOKY_SWAP: 'SPOOKY_SWAP',

    // Harmony
    VIPER_SWAP: 'VIPER_SWAP',

    // Aurora
    TRISOLARIS: 'TRISOLARIS',
    WANNA_SWAP: 'WANNA_SWAP',

    // Telos
    ZAPPY: 'ZAPPY',

    // Cronos
    CRONA_SWAP: 'CRONA_SWAP',

    // Moonbeam
    STELLA_SWAP: 'STELLA_SWAP',
    BEAM_SWAP: 'BEAM_SWAP',

    // Celo
    UBE_SWAP: 'UBE_SWAP',

    // Boba
    OOLONG_SWAP: 'OOLONG_SWAP',

    // Solana
    RAYDIUM: 'RAYDIUM',

    // Near
    REF_FINANCE: 'REF_FINANCE',

    // Other
    WRAPPED: 'WRAPPED'
} as const;

/**
 * Instant trade type.
 */
export type TradeType = keyof typeof TRADE_TYPE;
