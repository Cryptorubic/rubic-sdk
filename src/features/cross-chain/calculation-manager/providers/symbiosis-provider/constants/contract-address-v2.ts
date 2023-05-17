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
        providerRouter: '0xf1C374D065719Ce1Fdc63E2c5C13146813c0A83b',
        providerGateway: '0x384157027B1CDEAc4e26e3709667BB28735379Bb'
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
        providerRouter: '0x8B791913eB07C32779a16750e3868aA8495F5964',
        providerGateway: '0x2F7c5901DeBFb7faD804Db800F226de3dd0cffd5'
    },
    [BLOCKCHAIN_NAME.ARBITRUM]: {
        providerRouter: '0xcE8f24A58D85eD5c5A6824f7be1F8d4711A0eb4C',
        providerGateway: '0xAdB2d3b711Bb8d8Ea92ff70292c466140432c278'
    },
    [BLOCKCHAIN_NAME.OPTIMISM]: {
        providerRouter: '0xcE8f24A58D85eD5c5A6824f7be1F8d4711A0eb4C',
        providerGateway: '0xAdB2d3b711Bb8d8Ea92ff70292c466140432c278'
    }
};
