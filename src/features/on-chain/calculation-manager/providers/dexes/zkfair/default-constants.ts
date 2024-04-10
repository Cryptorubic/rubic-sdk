import { wrappedNativeTokensList } from 'src/common/tokens/constants/wrapped-native-tokens';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { UniswapV2ProviderConfiguration } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/models/uniswap-v2-provider-configuration';

const defaultZkFairRoutingProvidersAddresses = [
    wrappedNativeTokensList[BLOCKCHAIN_NAME.ZK_FAIR]!.address, // WUSDC
    '0x1cD3E2A23C45A690a18Ed93FD1412543f464158F', // ZKF
    '0x4b21b980d0Dc7D3C0C6175b0A412694F3A1c7c6b', // ETH
    '0x3f97bf3Cd76B5cA9D4A4E9cD8a73C24E32d6C193', // USDT
    '0x825b4244684d5A07fCeF8124D9B21FD868b39654', // HPX
    '0x450C29E6E799efECc6811954F47756af602D7930' // FAIR
];

const defaultZkFairWethAddress = wrappedNativeTokensList[BLOCKCHAIN_NAME.ZK_FAIR]!.address;

export const defaultZkFairProviderConfiguration: UniswapV2ProviderConfiguration = {
    maxTransitTokens: 1,
    routingProvidersAddresses: defaultZkFairRoutingProvidersAddresses,
    wethAddress: defaultZkFairWethAddress
};
