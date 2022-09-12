import { BlockchainsInfo } from 'src/core/blockchain/utils/blockchains-info';
import { notNull } from 'src/common/utils/object';
import { ConfigUpdate } from '@lifi/sdk';
import { Injector } from 'src/core/injector/injector';
import { lifiCrossChainSupportedBlockchains } from 'src/features/cross-chain/providers/lifi-trade-provider/constants/lifi-cross-chain-supported-blockchain';

export function getLifiConfig(): ConfigUpdate {
    const rpcs = Object.fromEntries(
        lifiCrossChainSupportedBlockchains
            .map(blockchain => {
                const rpcListProvider = Injector.web3PublicService.rpcListProvider[blockchain];
                if (!rpcListProvider) {
                    return null;
                }

                return [
                    BlockchainsInfo.getBlockchainByName(blockchain).id,
                    rpcListProvider.rpcList
                ];
            })
            .filter(notNull)
    );

    return {
        rpcs,
        defaultRouteOptions: {
            integrator: 'rubic'
        }
    };
}
