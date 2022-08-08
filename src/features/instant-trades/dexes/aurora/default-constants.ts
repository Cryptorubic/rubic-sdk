import { UniswapV2ProviderConfiguration } from '@rsdk-features/instant-trades/dexes/common/uniswap-v2-abstract/models/uniswap-v2-provider-configuration';

const defaultAuroraRoutingProvidersAddresses = [
    '0xC9BdeEd33CD01541e1eeD10f90519d2C06Fe3feB', // WETH
    '0xC42C30aC6Cc15faC9bD938618BcaA1a1FaE8501d', // wNEAR
    '0xFa94348467f64D5A457F75F8bc40495D33c65aBB', // TRI
    '0x7faA64Faf54750a2E3eE621166635fEAF406Ab22', // WANNA
    '0xB12BFcA5A55806AaF64E99521918A4bf0fC40802', // USDC
    '0x4988a896b1227218e4A686fdE5EabdcAbd91571f', // USDT
    '0x8BEc47865aDe3B172A928df8f990Bc7f2A3b9f79', // AURORA
    '0xe3520349F477A5F6EB06107066048508498A291b' // DAI
];

const defaultAuroraWethAddress = '0xC9BdeEd33CD01541e1eeD10f90519d2C06Fe3feB';

export const defaultAuroraProviderConfiguration: UniswapV2ProviderConfiguration = {
    maxTransitTokens: 1,
    routingProvidersAddresses: defaultAuroraRoutingProvidersAddresses,
    wethAddress: defaultAuroraWethAddress
};
