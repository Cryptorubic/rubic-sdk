import { UniswapV2TradeProviders } from 'src/features/on-chain/calculation-manager/constants/trade-providers/uniswap-v2-trade-providers';
import { UniswapV3TradeProviders } from 'src/features/on-chain/calculation-manager/constants/trade-providers/uniswap-v3-trade-providers';
import { OneinchTradeProviders } from 'src/features/on-chain/calculation-manager/constants/trade-providers/oneinch-trade-providers';
import { ZrxTradeProviders } from 'src/features/on-chain/calculation-manager/constants/trade-providers/zrx-trade-providers';
import { AlgebraTradeProviders } from 'src/features/on-chain/calculation-manager/constants/trade-providers/algebra-trade-providers';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { Mutable } from 'src/common/utils/types';
import { OnChainTypedTradeProviders } from 'src/features/on-chain/calculation-manager/models/on-chain-typed-trade-provider';
import { BridgersTradeProviders } from 'src/features/on-chain/calculation-manager/constants/trade-providers/bridgers-trade-providers';

export const typedTradeProviders: OnChainTypedTradeProviders = [
    ...UniswapV2TradeProviders,
    ...UniswapV3TradeProviders,
    ...OneinchTradeProviders,
    ...ZrxTradeProviders,
    ...AlgebraTradeProviders,
    ...BridgersTradeProviders
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
