import { XyCrossChainSupportedBlockchain } from 'src/features/cross-chain/calculation-manager/providers/xy-provider/constants/xy-supported-blockchains';

import { rubicProxyContractAddress } from 'src/features/cross-chain/calculation-manager/providers/common/constants/rubic-proxy-contract-address';
import { UniversalContract } from 'src/features/cross-chain/calculation-manager/providers/common/models/universal-contract';

import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

export const XyContractAddress: Record<XyCrossChainSupportedBlockchain, UniversalContract> = {
    [BLOCKCHAIN_NAME.ETHEREUM]: {
        providerGateway: '0x4315f344a905dC21a08189A117eFd6E1fcA37D57',
        providerRouter: '0x4315f344a905dC21a08189A117eFd6E1fcA37D57',
        rubicRouter: rubicProxyContractAddress[BLOCKCHAIN_NAME.ETHEREUM]
    },
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: {
        providerGateway: '0x7D26F09d4e2d032Efa0729fC31a4c2Db8a2394b1',
        providerRouter: '0x7D26F09d4e2d032Efa0729fC31a4c2Db8a2394b1',
        rubicRouter: rubicProxyContractAddress[BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]
    },
    [BLOCKCHAIN_NAME.POLYGON]: {
        providerGateway: '0x0c988b66EdEf267D04f100A879db86cdb7B9A34F',
        providerRouter: '0x0c988b66EdEf267D04f100A879db86cdb7B9A34F',
        rubicRouter: rubicProxyContractAddress[BLOCKCHAIN_NAME.POLYGON]
    },
    [BLOCKCHAIN_NAME.FANTOM]: {
        providerGateway: '0xDa241399697fa3F6cD496EdAFab6191498Ec37F5',
        providerRouter: '0xDa241399697fa3F6cD496EdAFab6191498Ec37F5',
        rubicRouter: rubicProxyContractAddress[BLOCKCHAIN_NAME.FANTOM]
    },
    [BLOCKCHAIN_NAME.CRONOS]: {
        providerGateway: '0xF103b5B479d2A629F422C42bb35E7eEceE1ad55E',
        providerRouter: '0xF103b5B479d2A629F422C42bb35E7eEceE1ad55E',
        rubicRouter: rubicProxyContractAddress[BLOCKCHAIN_NAME.CRONOS]
    },
    // [BLOCKCHAIN_NAME.THUNDER_CORE]: {
    //     providerGateway: '0xF103b5B479d2A629F422C42bb35E7eEceE1ad55E',
    //     providerRouter: '0xF103b5B479d2A629F422C42bb35E7eEceE1ad55E',
    //     rubicRouter: rubicProxyContractAddress[BLOCKCHAIN_NAME.THUNDER_CORE]
    // }
    [BLOCKCHAIN_NAME.AVALANCHE]: {
        providerGateway: '0x2C86f0FF75673D489b7D72D9986929a2b0Ed596C',
        providerRouter: '0x2C86f0FF75673D489b7D72D9986929a2b0Ed596C',
        rubicRouter: rubicProxyContractAddress[BLOCKCHAIN_NAME.AVALANCHE]
    },
    // [BLOCKCHAIN_NAME.KUCOIN]: {
    //     providerGateway: '0x7e803b54295Cd113Bf48E7f069f0531575DA1139',
    //     providerRouter: '0x7e803b54295Cd113Bf48E7f069f0531575DA1139',
    //     rubicRouter: rubicProxyContractAddress[BLOCKCHAIN_NAME.KUCOIN]
    // },
    [BLOCKCHAIN_NAME.ARBITRUM]: {
        providerGateway: '0x33383265290421C704c6b09F4BF27ce574DC4203',
        providerRouter: '0x33383265290421C704c6b09F4BF27ce574DC4203',
        rubicRouter: rubicProxyContractAddress[BLOCKCHAIN_NAME.ARBITRUM]
    },
    [BLOCKCHAIN_NAME.OPTIMISM]: {
        providerGateway: '0x7a6e01880693093abACcF442fcbED9E0435f1030',
        providerRouter: '0x7a6e01880693093abACcF442fcbED9E0435f1030',
        rubicRouter: rubicProxyContractAddress[BLOCKCHAIN_NAME.OPTIMISM]
    },
    [BLOCKCHAIN_NAME.ASTAR]: {
        providerGateway: '0x5C6C12Fd8b1f7E60E5B60512712cFbE0192E795E',
        providerRouter: '0x5C6C12Fd8b1f7E60E5B60512712cFbE0192E795E',
        rubicRouter: rubicProxyContractAddress[BLOCKCHAIN_NAME.ASTAR]
    },
    [BLOCKCHAIN_NAME.MOONRIVER]: {
        providerGateway: '0xc67Dd7054915a2B0aA3e48f35DA714Ff861e71BD',
        providerRouter: '0xc67Dd7054915a2B0aA3e48f35DA714Ff861e71BD',
        rubicRouter: rubicProxyContractAddress[BLOCKCHAIN_NAME.MOONRIVER]
    }
    // [BLOCKCHAIN_NAME.KLAYTN]: {
    //     providerGateway: '0x52075Fd1fF67f03beABCb5AcdA9679b02d98cA37',
    //     providerRouter: '0x52075Fd1fF67f03beABCb5AcdA9679b02d98cA37',
    //     rubicRouter: rubicProxyContractAddress[BLOCKCHAIN_NAME.KLAYTN]
    // }
};
