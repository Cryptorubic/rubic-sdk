import { wrappedNativeTokensList } from 'src/common/tokens';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { UniswapV2ProviderConfiguration } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/models/uniswap-v2-provider-configuration';

const defaultScrollWethAddress = wrappedNativeTokensList[BLOCKCHAIN_NAME.SCROLL_TESTNET]!.address;

const defaultScrollRoutingProvidersAddresses = [
    defaultScrollWethAddress, // WETH
    '0x67aE69Fd63b4fc8809ADc224A9b82Be976039509', // USDC
    '0x4702E5AEb70BdC05B11F8d8E701ad000dc85bD44', // DAI
    '0x0CDEA04b370C1FA4bC2032b4ef23dB3EBCbA258a' // UNI
];
export const UNISWAP_V2_SCROLL_TESTNET_CONTRACT_ADDRESS =
    '0x0cfd11ac90992872d62a439bF0ED01EFA583d8Dc';

export const UNISWAP_V2_SCROLL_TESTNET_CONFIGURATION: UniswapV2ProviderConfiguration = {
    maxTransitTokens: 2,
    routingProvidersAddresses: defaultScrollRoutingProvidersAddresses,
    wethAddress: defaultScrollWethAddress
};
