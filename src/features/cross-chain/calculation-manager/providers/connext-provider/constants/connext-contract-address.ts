import { rubicProxyContractAddress } from 'src/features/cross-chain/calculation-manager/providers/common/constants/rubic-proxy-contract-address';
import { UniversalContract } from 'src/features/cross-chain/calculation-manager/providers/common/models/universal-contract';

import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { ConnextCrossChainSupportedBlockchain } from './connext-supported-blockchains';

export const connextContractAddress: Record<
    ConnextCrossChainSupportedBlockchain,
    UniversalContract
> = {
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
    [BLOCKCHAIN_NAME.GNOSIS]: {
        providerGateway: '',
        providerRouter: '',
        rubicRouter: rubicProxyContractAddress[BLOCKCHAIN_NAME.GNOSIS]
    },
    [BLOCKCHAIN_NAME.MOONBEAM]: {
        providerGateway: '',
        providerRouter: '',
        rubicRouter: rubicProxyContractAddress[BLOCKCHAIN_NAME.MOONBEAM]
    }
};
