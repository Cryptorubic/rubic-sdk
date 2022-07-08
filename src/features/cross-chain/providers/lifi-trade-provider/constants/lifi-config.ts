import { ConfigUpdate } from '@lifinance/sdk';
import { lifiCrossChainSupportedBlockchains } from 'src/features/cross-chain/providers/lifi-trade-provider/constants/lifi-cross-chain-supported-blockchain';
import { BlockchainsInfo, SDK } from 'src/core';

const rpcs = Object.fromEntries(
    lifiCrossChainSupportedBlockchains.map(blockchain => [
        BlockchainsInfo.getBlockchainByName(blockchain).id,
        [SDK.rpcList[blockchain]!.mainRpc]
    ])
);

export const lifiConfig: ConfigUpdate = {
    rpcs
};
