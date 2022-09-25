import { UniswapV2TradeProviders } from 'src/features/instant-trades/constants/trade-providers/uniswap-v2-trade-providers';
import { UniswapV3TradeProviders } from 'src/features/instant-trades/constants/trade-providers/uniswap-v3-trade-providers';
import { OneinchTradeProviders } from 'src/features/instant-trades/constants/trade-providers/oneinch-trade-providers';
import { ZrxTradeProviders } from 'src/features/instant-trades/constants/trade-providers/zrx-trade-providers';
import { AlgebraTradeProviders } from 'src/features/instant-trades/constants/trade-providers/algebra-trade-providers';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { Mutable } from 'src/common/utils/types';
import { TypedTradeProviders } from 'src/features/instant-trades/models/typed-trade-provider';
import { BridgersTradeProviders } from 'src/features/instant-trades/constants/trade-providers/bridgers-trade-providers';

export const typedTradeProviders: TypedTradeProviders = [
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
        {} as Mutable<TypedTradeProviders>
    )
);
