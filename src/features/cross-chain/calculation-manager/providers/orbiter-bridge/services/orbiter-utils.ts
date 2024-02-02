import { BLOCKCHAIN_NAME, BlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';

import { OrbiterQuoteConfig } from '../models/orbiter-bridge-api-service-types';

export class OrbiterUtils {
    public static getChainId(chain: BlockchainName): string {
        if (chain === BLOCKCHAIN_NAME.ZK_SYNC) {
            return 'zksync';
        }

        if (chain === BLOCKCHAIN_NAME.STARKNET) {
            return 'SN_MAIN';
        }

        return blockchainId[chain].toString();
    }

    public static getQuoteConfig(
        fromChain: BlockchainName,
        toChain: BlockchainName,
        configs: OrbiterQuoteConfig[]
    ): OrbiterQuoteConfig {
        const fromChainId = OrbiterUtils.getChainId(fromChain);
        const toChainId = OrbiterUtils.getChainId(toChain);

        const config = configs.find(conf => {
            return conf.srcChain === fromChainId && conf.tgtChain === toChainId;
        }) as OrbiterQuoteConfig;

        return config;
    }
}
