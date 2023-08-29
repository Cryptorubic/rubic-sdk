import { Mutable } from 'src/common/utils/types';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { AlgebraTradeProviders } from 'src/features/on-chain/calculation-manager/constants/trade-providers/algebra-trade-providers';
import { BridgersTradeProviders } from 'src/features/on-chain/calculation-manager/constants/trade-providers/bridgers-trade-providers';
import { OneinchTradeProviders } from 'src/features/on-chain/calculation-manager/constants/trade-providers/oneinch-trade-providers';
import { pancakeRouterProviders } from 'src/features/on-chain/calculation-manager/constants/trade-providers/pancake-router-providers';
import { UniswapV2TradeProviders } from 'src/features/on-chain/calculation-manager/constants/trade-providers/uniswap-v2-trade-providers';
import { UniswapV3TradeProviders } from 'src/features/on-chain/calculation-manager/constants/trade-providers/uniswap-v3-trade-providers';
import { OnChainTypedTradeProviders } from 'src/features/on-chain/calculation-manager/models/on-chain-typed-trade-provider';
import { VooiProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/linea/vooi/vooi-provider';
import { SyncSwapProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/zksync/sync-swap/sync-swap-provider';

export const typedTradeProviders: OnChainTypedTradeProviders = [
    ...UniswapV2TradeProviders,
    ...UniswapV3TradeProviders,
    ...OneinchTradeProviders,
    ...AlgebraTradeProviders,
    ...BridgersTradeProviders,
    // ...CurveTradeProviders, Removed because hack
    ...pancakeRouterProviders,
    SyncSwapProvider,
    VooiProvider
].reduce(
    (acc, ProviderClass) => {
        const provider = new ProviderClass();
        acc[provider.blockchain][provider.type] = provider;
        return acc;
    },
    Object.values(BLOCKCHAIN_NAME).reduce(
        (acc, blockchain) => ({
            ...acc,
            [blockchain]: {}
        }),
        {} as Mutable<OnChainTypedTradeProviders>
    )
);
