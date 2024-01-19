import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { rubicProxyContractAddress } from 'src/features/cross-chain/calculation-manager/providers/common/constants/rubic-proxy-contract-address';
import { UniversalContract } from 'src/features/cross-chain/calculation-manager/providers/common/models/universal-contract';
import { XyCrossChainSupportedBlockchain } from 'src/features/cross-chain/calculation-manager/providers/xy-provider/constants/xy-supported-blockchains';

export const xyContractAddress: Record<XyCrossChainSupportedBlockchain, UniversalContract> = {
    [BLOCKCHAIN_NAME.SCROLL]: {
        providerGateway: '0x778C974568e376146dbC64fF12aD55B2d1c4133f',
        providerRouter: '0x778C974568e376146dbC64fF12aD55B2d1c4133f',
        rubicRouter: rubicProxyContractAddress[BLOCKCHAIN_NAME.SCROLL].router
    },
    [BLOCKCHAIN_NAME.ETHEREUM]: {
        providerGateway: '0x4315f344a905dC21a08189A117eFd6E1fcA37D57',
        providerRouter: '0x4315f344a905dC21a08189A117eFd6E1fcA37D57',
        rubicRouter: rubicProxyContractAddress[BLOCKCHAIN_NAME.ETHEREUM].router
    },
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: {
        providerGateway: '0x7D26F09d4e2d032Efa0729fC31a4c2Db8a2394b1',
        providerRouter: '0x7D26F09d4e2d032Efa0729fC31a4c2Db8a2394b1',
        rubicRouter: rubicProxyContractAddress[BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN].router
    },
    [BLOCKCHAIN_NAME.POLYGON]: {
        providerGateway: '0x0c988b66EdEf267D04f100A879db86cdb7B9A34F',
        providerRouter: '0x0c988b66EdEf267D04f100A879db86cdb7B9A34F',
        rubicRouter: rubicProxyContractAddress[BLOCKCHAIN_NAME.POLYGON].router
    },
    [BLOCKCHAIN_NAME.FANTOM]: {
        providerGateway: '0xDa241399697fa3F6cD496EdAFab6191498Ec37F5',
        providerRouter: '0xDa241399697fa3F6cD496EdAFab6191498Ec37F5',
        rubicRouter: rubicProxyContractAddress[BLOCKCHAIN_NAME.FANTOM].router
    },
    [BLOCKCHAIN_NAME.CRONOS]: {
        providerGateway: '0xF103b5B479d2A629F422C42bb35E7eEceE1ad55E',
        providerRouter: '0xF103b5B479d2A629F422C42bb35E7eEceE1ad55E',
        rubicRouter: rubicProxyContractAddress[BLOCKCHAIN_NAME.CRONOS].router
    },
    // [BLOCKCHAIN_NAME.THUNDER_CORE]: {
    //     providerGateway: '0xF103b5B479d2A629F422C42bb35E7eEceE1ad55E',
    //     providerRouter: '0xF103b5B479d2A629F422C42bb35E7eEceE1ad55E',
    //     rubicRouter: rubicProxyContractAddress[BLOCKCHAIN_NAME.THUNDER_CORE]
    // }
    [BLOCKCHAIN_NAME.AVALANCHE]: {
        providerGateway: '0x2C86f0FF75673D489b7D72D9986929a2b0Ed596C',
        providerRouter: '0x2C86f0FF75673D489b7D72D9986929a2b0Ed596C',
        rubicRouter: rubicProxyContractAddress[BLOCKCHAIN_NAME.AVALANCHE].router
    },
    // [BLOCKCHAIN_NAME.KUCOIN]: {
    //     providerGateway: '0x7e803b54295Cd113Bf48E7f069f0531575DA1139',
    //     providerRouter: '0x7e803b54295Cd113Bf48E7f069f0531575DA1139',
    //     rubicRouter: rubicProxyContractAddress[BLOCKCHAIN_NAME.KUCOIN]
    // },
    [BLOCKCHAIN_NAME.ARBITRUM]: {
        providerGateway: '0x33383265290421C704c6b09F4BF27ce574DC4203',
        providerRouter: '0x33383265290421C704c6b09F4BF27ce574DC4203',
        rubicRouter: rubicProxyContractAddress[BLOCKCHAIN_NAME.ARBITRUM].router
    },
    [BLOCKCHAIN_NAME.OPTIMISM]: {
        providerGateway: '0x7a6e01880693093abACcF442fcbED9E0435f1030',
        providerRouter: '0x7a6e01880693093abACcF442fcbED9E0435f1030',
        rubicRouter: rubicProxyContractAddress[BLOCKCHAIN_NAME.OPTIMISM].router
    },
    [BLOCKCHAIN_NAME.ASTAR_EVM]: {
        providerGateway: '0x5C6C12Fd8b1f7E60E5B60512712cFbE0192E795E',
        providerRouter: '0x5C6C12Fd8b1f7E60E5B60512712cFbE0192E795E',
        rubicRouter: rubicProxyContractAddress[BLOCKCHAIN_NAME.ASTAR_EVM].router
    },
    [BLOCKCHAIN_NAME.MOONRIVER]: {
        providerGateway: '0xc67Dd7054915a2B0aA3e48f35DA714Ff861e71BD',
        providerRouter: '0xc67Dd7054915a2B0aA3e48f35DA714Ff861e71BD',
        rubicRouter: rubicProxyContractAddress[BLOCKCHAIN_NAME.MOONRIVER].router
    },
    [BLOCKCHAIN_NAME.ZK_SYNC]: {
        providerGateway: '0xe4e156167cc9C7AC4AbD8d39d203a5495F775547',
        providerRouter: '0xe4e156167cc9C7AC4AbD8d39d203a5495F775547',
        rubicRouter: rubicProxyContractAddress[BLOCKCHAIN_NAME.ZK_SYNC].router
    },
    [BLOCKCHAIN_NAME.POLYGON_ZKEVM]: {
        providerGateway: '0x3689D3B912d4D73FfcAad3a80861e7caF2d4F049',
        providerRouter: '0x3689D3B912d4D73FfcAad3a80861e7caF2d4F049',
        rubicRouter: rubicProxyContractAddress[BLOCKCHAIN_NAME.POLYGON_ZKEVM].router
    },
    [BLOCKCHAIN_NAME.LINEA]: {
        providerGateway: '0x73Ce60416035B8D7019f6399778c14ccf5C9c7A1',
        providerRouter: '0x73Ce60416035B8D7019f6399778c14ccf5C9c7A1',
        rubicRouter: rubicProxyContractAddress[BLOCKCHAIN_NAME.LINEA].router
    },
    [BLOCKCHAIN_NAME.BASE]: {
        providerGateway: '0x73Ce60416035B8D7019f6399778c14ccf5C9c7A1',
        providerRouter: '0x73Ce60416035B8D7019f6399778c14ccf5C9c7A1',
        rubicRouter: rubicProxyContractAddress[BLOCKCHAIN_NAME.BASE].router
    },
    [BLOCKCHAIN_NAME.MANTLE]: {
        providerGateway: '0x73Ce60416035B8D7019f6399778c14ccf5C9c7A1',
        providerRouter: '0x73Ce60416035B8D7019f6399778c14ccf5C9c7A1',
        rubicRouter: rubicProxyContractAddress[BLOCKCHAIN_NAME.MANTLE].router
    }
    // [BLOCKCHAIN_NAME.KLAYTN]: {
    //     providerGateway: '0x52075Fd1fF67f03beABCb5AcdA9679b02d98cA37',
    //     providerRouter: '0x52075Fd1fF67f03beABCb5AcdA9679b02d98cA37',
    //     rubicRouter: rubicProxyContractAddress[BLOCKCHAIN_NAME.KLAYTN]
    // }
};
