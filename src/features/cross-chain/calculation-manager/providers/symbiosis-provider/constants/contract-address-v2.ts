import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { ProviderContractsData } from 'src/features/cross-chain/calculation-manager/providers/common/models/provider-contracts-data';
import { SymbiosisCrossChainSupportedBlockchain } from 'src/features/cross-chain/calculation-manager/providers/symbiosis-provider/constants/symbiosis-cross-chain-supported-blockchain';

export const SYMBIOSIS_CONTRACT_ADDRESS_V2: Record<
    SymbiosisCrossChainSupportedBlockchain,
    ProviderContractsData
> = {
    [BLOCKCHAIN_NAME.ETHEREUM]: {
        providerRouter: '0xE75C7E85FE6ADd07077467064aD15847E6ba9877',
        providerGateway: '0x25bEE8C21D1d0ec2852302fd7E674196EA298eC6'
    },
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: {
        providerRouter: '0x81aB74A9f9d7457fF47dfD102e78A340cF72EC39',
        providerGateway: '0x79d930aBe53dd56B66Ed43f8f6a7C6a1b84655cA'
    },
    [BLOCKCHAIN_NAME.POLYGON]: {
        providerRouter: '0xE75C7E85FE6ADd07077467064aD15847E6ba9877',
        providerGateway: '0x25bEE8C21D1d0ec2852302fd7E674196EA298eC6'
    },
    [BLOCKCHAIN_NAME.AVALANCHE]: {
        providerRouter: '0x7bD0a0549e546f4e1C2D8eC53F705f8f60559bb1',
        providerGateway: '0x3006Dd3B40f33598A0a219602998D8C3715e75E5'
    },
    [BLOCKCHAIN_NAME.BOBA]: {
        providerRouter: '0xcE8f24A58D85eD5c5A6824f7be1F8d4711A0eb4C',
        providerGateway: '0xAdB2d3b711Bb8d8Ea92ff70292c466140432c278'
    },
    [BLOCKCHAIN_NAME.BOBA_BSC]: {
        providerRouter: '0xB79A4F5828eb55c10D7abF4bFe9a9f5d11aA84e0',
        providerGateway: '0x37E44E4400A43F0c27ed42cF6EBEE3493A3e4d2f'
    },
    [BLOCKCHAIN_NAME.BOBA_AVALANCHE]: {
        providerRouter: '0x292fC50e4eB66C3f6514b9E402dBc25961824D62',
        providerGateway: '0xE82948b631Cf822c81b09fA5ae393B24A4820808'
    },
    [BLOCKCHAIN_NAME.TELOS]: {
        providerRouter: '0xcE8f24A58D85eD5c5A6824f7be1F8d4711A0eb4C',
        providerGateway: '0xAdB2d3b711Bb8d8Ea92ff70292c466140432c278'
    },
    [BLOCKCHAIN_NAME.ZK_SYNC]: {
        providerRouter: '0x4f30036b5858f77F98d8D35c3b21BEb18916Ba9a',
        providerGateway: '0x2F7c5901DeBFb7faD804Db800F226de3dd0cffd5'
    },
    [BLOCKCHAIN_NAME.ARBITRUM]: {
        providerRouter: '0xcE8f24A58D85eD5c5A6824f7be1F8d4711A0eb4C',
        providerGateway: '0xAdB2d3b711Bb8d8Ea92ff70292c466140432c278'
    },
    [BLOCKCHAIN_NAME.OPTIMISM]: {
        providerRouter: '0xcE8f24A58D85eD5c5A6824f7be1F8d4711A0eb4C',
        providerGateway: '0xAdB2d3b711Bb8d8Ea92ff70292c466140432c278'
    },
    [BLOCKCHAIN_NAME.POLYGON_ZKEVM]: {
        providerRouter: '0xDF41Ce9d15e9b6773ef20cA682AFE56af6Bb3F94',
        providerGateway: '0x3b561BdeDf4Ebaa708633B73D58B57EB7CD970d3'
    },
    [BLOCKCHAIN_NAME.LINEA]: {
        providerRouter: '0xcE8f24A58D85eD5c5A6824f7be1F8d4711A0eb4C',
        providerGateway: '0xAdB2d3b711Bb8d8Ea92ff70292c466140432c278'
    },
    [BLOCKCHAIN_NAME.BASE]: {
        providerRouter: '0x6F0f6393e45fE0E7215906B6f9cfeFf53EA139cf',
        providerGateway: '0x4cfA66497Fa84D739a0f785FBcEe9196f1C64e4a'
    },
    [BLOCKCHAIN_NAME.MANTLE]: {
        providerRouter: '0xcE8f24A58D85eD5c5A6824f7be1F8d4711A0eb4C',
        providerGateway: '0xAdB2d3b711Bb8d8Ea92ff70292c466140432c278'
    },
    [BLOCKCHAIN_NAME.GOERLI]: {
        providerRouter: '0x5302358dCFbF2881e5b5E537316786d8Ea242008',
        providerGateway: '0x438D14b1Fd3C20C33Fa7EF6331AA3fC36bc0347E'
    },
    [BLOCKCHAIN_NAME.MUMBAI]: {
        providerRouter: '0x2636F6A85aB7bD438631a03e6E7cC6d6ae712642',
        providerGateway: '0x85aDa6757f383577A8AB2a3492ac3E721CcFEAbb'
    },
    [BLOCKCHAIN_NAME.FUJI]: {
        providerRouter: '0x8eC5387A2CdFA5315c05Fd7296C11406AeC2559e',
        providerGateway: '0x80cD2d214ccBdcB214DEA5bC040c8c2002Dc9380'
    },
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN_TESTNET]: {
        providerRouter: '0xd3F98c243374D79Bfd9a8ac03964623221D53F0f',
        providerGateway: '0x4Ee7B1e8Ad6E1682318f1c47F83634dAa1197eEf'
    },
    [BLOCKCHAIN_NAME.SCROLL_SEPOLIA]: {
        providerRouter: '0xAED47A51AeFa6f95A388aDA3c459d94FF46fC4BB',
        providerGateway: '0x8Daf3F19dD8a27554BaE525075E90Df4E56a4c46'
    },
    [BLOCKCHAIN_NAME.ZETACHAIN]: {
        providerRouter: '0xE52e3c838CC91C60a701E78B5043ba9eeEeb55db',
        providerGateway: '0x13fF611B06bEb2A29a49cc3c825cD0eE74967bE3'
    }
};
