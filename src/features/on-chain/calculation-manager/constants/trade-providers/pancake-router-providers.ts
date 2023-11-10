import { PancakeRouterBscProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/bsc/pancake-router-bsc/pancake-router-bsc-provider';
import { PancakeRouterEthereumProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/ethereum/pancake-router-ethereum/pancake-router-ethereum-provider';

export const pancakeRouterProviders = [
    PancakeRouterBscProvider,
    PancakeRouterEthereumProvider
    // PancakeRouterPolygonZkEvmProvider
];
