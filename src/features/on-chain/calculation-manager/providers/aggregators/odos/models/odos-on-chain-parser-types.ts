import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';

import { RequiredOnChainCalculationOptions } from '../../../common/models/on-chain-calculation-options';

export interface GetBestRouteBodyType {
    from: PriceTokenAmount<EvmBlockchainName>;
    toToken: PriceToken<EvmBlockchainName>;
    options: RequiredOnChainCalculationOptions;
    /**
     * to exclude/include swappers need to find name in odos-api - check /info/liquidity-sources/{chain_id} endpoint
     */
    swappersBlacklist: string[];
    swappersWhitelist: string[];
}
