import { UniswapV2ProviderConfiguration } from 'src/features/on-chain/calculation-manager/providers/dexes/abstract/uniswap-v2-abstract/models/uniswap-v2-provider-configuration';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { wrappedNativeTokensList } from 'src/common/tokens';

const defaultPolygonRoutingProvidersAddresses = [
    wrappedNativeTokensList[BLOCKCHAIN_NAME.POLYGON].address, // WMATIC
    '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619', // WETH
    '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063', // DAI
    '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', // USDT
    '0x2791bca1f2de4661ed88a30c99a7a9449aa84174', // USDC
    '0x831753DD7087CaC61aB5644b308642cc1c33Dc13' // QUICK
];

const defaultPolygonWethAddress = wrappedNativeTokensList[BLOCKCHAIN_NAME.POLYGON].address;

export const defaultPolygonProviderConfiguration: UniswapV2ProviderConfiguration = {
    maxTransitTokens: 3,
    routingProvidersAddresses: defaultPolygonRoutingProvidersAddresses,
    wethAddress: defaultPolygonWethAddress
};
