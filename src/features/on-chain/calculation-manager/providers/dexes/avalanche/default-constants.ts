import { wrappedNativeTokensList } from 'src/common/tokens';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { UniswapV2ProviderConfiguration } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/models/uniswap-v2-provider-configuration';

const defaultAvalancheRoutingProvidersAddresses = [
    wrappedNativeTokensList[BLOCKCHAIN_NAME.AVALANCHE].address, // WAVAX
    '0xc7198437980c041c805A1EDcbA50c1Ce5db95118', // USDT
    '0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664', // USDC
    '0xd586E7F844cEa2F87f50152665BCbc2C279D8d70', // DAI
    '0x60781C2586D68229fde47564546784ab3fACA982', // PNG
    '0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB', // WETH
    '0xd1c3f94DE7e5B45fa4eDBBA472491a9f4B166FC4' // XAVA
];

const defaultAvalancheWethAddress = wrappedNativeTokensList[BLOCKCHAIN_NAME.AVALANCHE].address;

export const defaultAvalancheProviderConfiguration: UniswapV2ProviderConfiguration = {
    maxTransitTokens: 3,
    routingProvidersAddresses: defaultAvalancheRoutingProvidersAddresses,
    wethAddress: defaultAvalancheWethAddress
};
