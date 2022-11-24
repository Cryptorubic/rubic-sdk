import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { CelerCrossChainSupportedBlockchain } from 'src/features/cross-chain/calculation-manager/providers/celer-provider/models/celer-cross-chain-supported-blockchain';
import { defaultArbitrumProviderConfiguration } from 'src/features/on-chain/calculation-manager/providers/dexes/arbitrum/default-constants';
import { defaultAuroraProviderConfiguration } from 'src/features/on-chain/calculation-manager/providers/dexes/aurora/default-constants';
import { defaultAvalancheProviderConfiguration } from 'src/features/on-chain/calculation-manager/providers/dexes/avalanche/default-constants';
import { defaultBscProviderConfiguration } from 'src/features/on-chain/calculation-manager/providers/dexes/bsc/default-constants';
import { defaultEthereumProviderConfiguration } from 'src/features/on-chain/calculation-manager/providers/dexes/ethereum/default-constants';
import { defaultFantomProviderConfiguration } from 'src/features/on-chain/calculation-manager/providers/dexes/fantom/default-constants';
import { defaultPolygonProviderConfiguration } from 'src/features/on-chain/calculation-manager/providers/dexes/polygon/default-constants';

export const wrappedNative: Record<CelerCrossChainSupportedBlockchain, string> = {
    [BLOCKCHAIN_NAME.ETHEREUM]: defaultEthereumProviderConfiguration.wethAddress,
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: defaultBscProviderConfiguration.wethAddress,
    [BLOCKCHAIN_NAME.POLYGON]: defaultPolygonProviderConfiguration.wethAddress,
    [BLOCKCHAIN_NAME.AVALANCHE]: defaultAvalancheProviderConfiguration.wethAddress,
    [BLOCKCHAIN_NAME.FANTOM]: defaultFantomProviderConfiguration.wethAddress,
    [BLOCKCHAIN_NAME.ARBITRUM]: defaultArbitrumProviderConfiguration.wethAddress,
    [BLOCKCHAIN_NAME.AURORA]: defaultAuroraProviderConfiguration.wethAddress
};
