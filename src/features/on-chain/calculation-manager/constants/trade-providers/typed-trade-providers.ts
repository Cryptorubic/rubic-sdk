import { Mutable } from 'src/common/utils/types';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { AlgebraTradeProviders } from 'src/features/on-chain/calculation-manager/constants/trade-providers/algebra-trade-providers';
import { BridgersTradeProviders } from 'src/features/on-chain/calculation-manager/constants/trade-providers/bridgers-trade-providers';
import { CurveTradeProviders } from 'src/features/on-chain/calculation-manager/constants/trade-providers/curve-trade-providers';
import { OneinchTradeProviders } from 'src/features/on-chain/calculation-manager/constants/trade-providers/oneinch-trade-providers';
import { UniswapV2TradeProviders } from 'src/features/on-chain/calculation-manager/constants/trade-providers/uniswap-v2-trade-providers';
import { UniswapV3TradeProviders } from 'src/features/on-chain/calculation-manager/constants/trade-providers/uniswap-v3-trade-providers';
import { ZrxTradeProviders } from 'src/features/on-chain/calculation-manager/constants/trade-providers/zrx-trade-providers';
import { OnChainTypedTradeProviders } from 'src/features/on-chain/calculation-manager/models/on-chain-typed-trade-provider';

export const typedTradeProviders: OnChainTypedTradeProviders = [
    ...UniswapV2TradeProviders,
    ...UniswapV3TradeProviders,
    ...OneinchTradeProviders,
    ...ZrxTradeProviders,
    ...AlgebraTradeProviders,
    ...BridgersTradeProviders,
    ...CurveTradeProviders
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
