import { wrappedNativeTokensList } from 'src/common/tokens';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { UniswapV2ProviderConfiguration } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/models/uniswap-v2-provider-configuration';

const wethAddress = wrappedNativeTokensList[BLOCKCHAIN_NAME.MUMBAI]!.address;

const routingProvidersAddresses = [
    wethAddress, // WMATIC
    '0x6De33698e9e9b787e09d3Bd7771ef63557E148bb', // USDC
    '0xD9d1034ef3d21221F008C7e96346CA999966752C', // WUSDC
    '0x19d66abd20fb2a0fc046c139d5af1e97f09a695e', // USDC2
    '0x2a655231e814e71015ff991d90c5790b5de82b94', // WETH
    '0x6d8873f56a56f0af376091bedddd149f3592e854' // DAI
];

export const defaultMumbaiProviderConfiguration: UniswapV2ProviderConfiguration = {
    maxTransitTokens: 3,
    routingProvidersAddresses,
    wethAddress
};
