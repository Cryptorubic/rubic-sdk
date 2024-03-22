import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';

export const supportedEonTokens = {
    weth: '0x2c2E0B0c643aB9ad03adBe9140627A645E99E054',
    wavax: '0x6318374DFb468113E06d3463ec5Ed0B6Ae0F0982',
    usdc: '0xCc44eB064CD32AAfEEb2ebb2a47bE0B882383b53',
    usdt: '0xA167bcAb6791304EDa9B636C8beEC75b3D2829E6',
    dai: '0x38C2a6953F86a7453622B1E7103b738239728754',
    link: '0xDF8DBA35962Aa0fAD7ade0Df07501c54Ec7c4A89',
    btc: '0x1d7fb99AED3C365B4DEf061B7978CE5055Dfc1e7',
    eth: `NATIVE_${BLOCKCHAIN_NAME.ETHEREUM}`,
    avax: `NATIVE_${BLOCKCHAIN_NAME.AVALANCHE}`,
    zen: EvmWeb3Pure.EMPTY_ADDRESS,
    wzen: '0xF5cB8652a84329A2016A386206761f455bCEDab6'
} as const;

type SupportedEonTokens = (typeof supportedEonTokens)[keyof typeof supportedEonTokens];

export const eonEthTokensMapping: Record<SupportedEonTokens, string> = {
    [supportedEonTokens.weth]: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    [supportedEonTokens.eth]: EvmWeb3Pure.EMPTY_ADDRESS,
    [supportedEonTokens.usdc]: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    [supportedEonTokens.usdt]: '0xdac17f958d2ee523a2206206994597c13d831ec7',
    [supportedEonTokens.dai]: '0x6b175474e89094c44da98b954eedeac495271d0f',
    [supportedEonTokens.link]: '0x514910771af9ca656af840dff83e8264ecf986ca',
    [supportedEonTokens.btc]: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    [supportedEonTokens.avax]: '', // No token address for AVAX
    [supportedEonTokens.wavax]: '', // No token address for WAVAX
    [supportedEonTokens.zen]: '0xd21475D90686c9A6FDBe0849cb6670fEc2aC9E21',
    [supportedEonTokens.wzen]: '0xd21475D90686c9A6FDBe0849cb6670fEc2aC9E21'
} as const;

export const eonAvalancheTokensMapping: Record<SupportedEonTokens, string> = {
    [supportedEonTokens.weth]: '', // No token address for WETH
    [supportedEonTokens.eth]: '', // No token address for ETH
    [supportedEonTokens.usdc]: '0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e',
    [supportedEonTokens.usdt]: '0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7',
    [supportedEonTokens.dai]: '0xd586e7f844cea2f87f50152665bcbc2c279d8d70',
    [supportedEonTokens.link]: '0x5947bb275c521040051d82396192181b413227a3',
    [supportedEonTokens.btc]: '0x50b7545627a5162f82a992c33b87adc75187b218',
    [supportedEonTokens.avax]: EvmWeb3Pure.EMPTY_ADDRESS,
    [supportedEonTokens.wavax]: '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7',
    [supportedEonTokens.zen]: '0xAA1dA1591cBF7f2Df46884E7144297FF15Ea3a7f',
    [supportedEonTokens.wzen]: '0xAA1dA1591cBF7f2Df46884E7144297FF15Ea3a7f'
};
