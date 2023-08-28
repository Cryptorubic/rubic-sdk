import { wrappedNativeTokensList } from 'src/common/tokens';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { UniswapV2ProviderConfiguration } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/models/uniswap-v2-provider-configuration';

const wethAddress = wrappedNativeTokensList[BLOCKCHAIN_NAME.GOERLI]!.address;

const defaultGoerliRoutingProvidersAddresses = [
    wethAddress, // WETH
    '0xCbE56b00d173A26a5978cE90Db2E33622fD95A28', // USDC
    '0xf4B2cbc3bA04c478F0dC824f4806aC39982Dce73', // USDT
    '0xb93cba7013f4557cdfb590fd152d24ef4063485f', // DAI
    '0xcc7bb2d219a0fc08033e130629c2b854b7ba9195' // ZETA
];

export const defaultGoerliProviderConfiguration: UniswapV2ProviderConfiguration = {
    maxTransitTokens: 1,
    routingProvidersAddresses: defaultGoerliRoutingProvidersAddresses,
    wethAddress
};
