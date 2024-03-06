import { wrappedNativeTokensList } from 'src/common/tokens/constants/wrapped-native-tokens';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { UniswapV2ProviderConfiguration } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/models/uniswap-v2-provider-configuration';
import { defaultHorizenEonProviderConfiguration } from 'src/features/on-chain/calculation-manager/providers/dexes/horizen-eon/default-constants';

export const SPOOKY_SWAP_HORIZEN_EON_CONTRACT_ADDRESS =
    '0xccEC4EF0228488636B6E8dF77D7d4211c87Ef255';

const routingProvidersAddresses = [
    wrappedNativeTokensList[BLOCKCHAIN_NAME.HORIZEN_EON]!.address, // wZEN
    '0x38C2a6953F86a7453622B1E7103b738239728754', // izDAI
    '0xCc44eB064CD32AAfEEb2ebb2a47bE0B882383b53', // izUSDC
    '0xA167bcAb6791304EDa9B636C8beEC75b3D2829E6', // izUSDT
    '0x1d7fb99AED3C365B4DEf061B7978CE5055Dfc1e7', // izBTC
    '0x2c2E0B0c643aB9ad03adBe9140627A645E99E054', // izETH (wETH)
    '0xCEad8ee30e03aE87E5E709617f7FdF180Eef9973', // ZUSD
    '0x6318374DFb468113E06d3463ec5Ed0B6Ae0F0982' // izAVAX (wAVAX)
];

export const SPOOKY_SWAP_HORIZEN_EON_PROVIDER_CONFIGURATION: UniswapV2ProviderConfiguration = {
    ...defaultHorizenEonProviderConfiguration,
    routingProvidersAddresses
};
