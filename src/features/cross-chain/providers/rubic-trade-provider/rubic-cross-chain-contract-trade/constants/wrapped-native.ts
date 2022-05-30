import { BLOCKCHAIN_NAME } from '@core/blockchain/models/blockchain-name';
import { CelerCrossChainSupportedBlockchain } from '@features/cross-chain/providers/celer-trade-provider/constants/celer-cross-chain-supported-blockchain';
import { defaultEthereumProviderConfiguration } from '@features/instant-trades/dexes/ethereum/default-constants';
import { defaultFantomProviderConfiguration } from '@features/instant-trades/dexes/fantom/default-constants';
import { defaultBscProviderConfiguration } from '@features/instant-trades/dexes/bsc/default-constants';
import { defaultPolygonProviderConfiguration } from '@features/instant-trades/dexes/polygon/default-constants';
import { defaultAvalancheProviderConfiguration } from '@features/instant-trades/dexes/avalanche/default-constants';

export const wrappedNative: Record<CelerCrossChainSupportedBlockchain, string> = {
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: defaultBscProviderConfiguration.wethAddress,
    [BLOCKCHAIN_NAME.POLYGON]: defaultPolygonProviderConfiguration.wethAddress,
    [BLOCKCHAIN_NAME.AVALANCHE]: defaultAvalancheProviderConfiguration.wethAddress,
    [BLOCKCHAIN_NAME.FANTOM]: defaultFantomProviderConfiguration.wethAddress,
    [BLOCKCHAIN_NAME.ETHEREUM]: defaultEthereumProviderConfiguration.wethAddress
};
