import { wrappedNativeTokensList } from 'src/common/tokens';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { UniswapV2ProviderConfiguration } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/models/uniswap-v2-provider-configuration';

const defaultScrollWethAddress = wrappedNativeTokensList[BLOCKCHAIN_NAME.SCROLL_SEPOLIA]!.address;

const defaultScrollRoutingProvidersAddresses = [
    defaultScrollWethAddress, // WETH
    '0x15Fe86961428E095B064bb52FcF5964bAb834E34' // USDC
];
export const UNISWAP_V2_SCROLL_SEPOLIA_CONTRACT_ADDRESS = '';

export const UNISWAP_V2_SCROLL_SEPOLIA_CONFIGURATION: UniswapV2ProviderConfiguration = {
    maxTransitTokens: 2,
    routingProvidersAddresses: defaultScrollRoutingProvidersAddresses,
    wethAddress: defaultScrollWethAddress
};
