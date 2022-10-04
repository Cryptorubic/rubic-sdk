import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { CelerCrossChainSupportedBlockchain } from 'src/features/cross-chain/providers/celer-provider/models/celer-cross-chain-supported-blockchain';
import { defaultEthereumProviderConfiguration } from 'src/features/on-chain/providers/dexes/ethereum/default-constants';
import { defaultFantomProviderConfiguration } from 'src/features/on-chain/providers/dexes/fantom/default-constants';
import { defaultBscProviderConfiguration } from 'src/features/on-chain/providers/dexes/bsc/default-constants';
import { defaultPolygonProviderConfiguration } from 'src/features/on-chain/providers/dexes/polygon/default-constants';
import { defaultAvalancheProviderConfiguration } from 'src/features/on-chain/providers/dexes/avalanche/default-constants';
import { defaultArbitrumProviderConfiguration } from 'src/features/on-chain/providers/dexes/arbitrum/default-constants';
import { defaultAuroraProviderConfiguration } from 'src/features/on-chain/providers/dexes/aurora/default-constants';

export const wrappedNative: Record<CelerCrossChainSupportedBlockchain, string> = {
    [BLOCKCHAIN_NAME.ETHEREUM]: defaultEthereumProviderConfiguration.wethAddress,
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: defaultBscProviderConfiguration.wethAddress,
    [BLOCKCHAIN_NAME.POLYGON]: defaultPolygonProviderConfiguration.wethAddress,
    [BLOCKCHAIN_NAME.AVALANCHE]: defaultAvalancheProviderConfiguration.wethAddress,
    [BLOCKCHAIN_NAME.FANTOM]: defaultFantomProviderConfiguration.wethAddress,
    [BLOCKCHAIN_NAME.ARBITRUM]: defaultArbitrumProviderConfiguration.wethAddress,
    [BLOCKCHAIN_NAME.AURORA]: defaultAuroraProviderConfiguration.wethAddress
};
