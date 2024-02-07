import BigNumber from 'bignumber.js';
import { RubicSdkError } from 'src/common/errors';
import { BLOCKCHAIN_NAME, BlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';

import { OrbiterQuoteConfig } from '../models/orbiter-api-quote-types';
import { OrbiterGetQuoteConfigParams } from '../models/orbiter-utils-types';

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

    public static getQuoteConfig({
        configs,
        from,
        to
    }: OrbiterGetQuoteConfigParams): OrbiterQuoteConfig {
        const fromChainId = OrbiterUtils.getChainId(from.blockchain);
        const toChainId = OrbiterUtils.getChainId(to.blockchain);

        const config = configs.find(conf => {
            return (
                conf.srcChain === fromChainId &&
                conf.tgtChain === toChainId &&
                conf.srcToken === from.address &&
                conf.tgtToken === to.address
            );
        });

        if (!config) {
            throw new RubicSdkError('[ORBITER] Unsupported pair of tokens!');
        }

        return config;
    }

    public static isAmountCorrect(fromAmount: BigNumber, config: OrbiterQuoteConfig): boolean {
        return fromAmount.lt(config.maxAmt) || fromAmount.gt(config.minAmt);
    }
}
