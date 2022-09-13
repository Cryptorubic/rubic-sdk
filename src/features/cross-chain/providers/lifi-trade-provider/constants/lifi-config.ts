import { notNull } from 'src/common/utils/object';
import { ConfigUpdate } from '@lifi/sdk';
import { Injector } from 'src/core/injector/injector';
import { lifiCrossChainSupportedBlockchains } from 'src/features/cross-chain/providers/lifi-trade-provider/constants/lifi-cross-chain-supported-blockchain';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';

export function getLifiConfig(): ConfigUpdate {
    const rpcs = Object.fromEntries(
        lifiCrossChainSupportedBlockchains
            .map(blockchain => {
                const rpcListProvider = Injector.web3PublicService.rpcProvider[blockchain];
                if (!rpcListProvider) {
                    return null;
                }

                return [blockchainId[blockchain], rpcListProvider.rpcList];
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
