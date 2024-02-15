import { wrappedNativeTokensList } from 'src/common/tokens/constants/wrapped-native-tokens';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { UniswapV2ProviderConfiguration } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/models/uniswap-v2-provider-configuration';

const defaultZetachainRoutingProvidersAddresses = [
    wrappedNativeTokensList[BLOCKCHAIN_NAME.ZETACHAIN]!.address, // WZETA
    '0x05BA149A7bd6dC1F937fA9046A9e05C05f3b18b0', // USDC.BSC
    '0x0cbe0dF132a6c6B4a2974Fa1b7Fb953CF0Cc798a', // USDC.ETH
    '0x7c8dDa80bbBE1254a7aACf3219EBe1481c6E01d7', // USDT.ETH
    '0x91d4F0D54090Df2D81e834c3c8CE71C6c865e79F', // USDT.BSC
    '0x48f80608B672DC30DC7e3dbBd0343c5F02C738Eb', // BNB.BSC
    '0xd97B1de3619ed2c6BEb3860147E30cA8A7dC9891', // ETH.ETH
    '0x13A0c5930C028511Dc02665E7285134B6d11A5f4' // BTC.BTC
];

const defaultZetachainWethAddress = wrappedNativeTokensList[BLOCKCHAIN_NAME.ZETACHAIN]!.address;

export const defaultZetachainProviderConfiguration: UniswapV2ProviderConfiguration = {
    maxTransitTokens: 1,
    routingProvidersAddresses: defaultZetachainRoutingProvidersAddresses,
    wethAddress: defaultZetachainWethAddress
};
