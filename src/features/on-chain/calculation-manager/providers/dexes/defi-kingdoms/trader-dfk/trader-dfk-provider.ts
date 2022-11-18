import { UniswapV2AbstractProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/abstract/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { TRADER_DFK_PROVIDER_CONFIGURATION } from 'src/features/on-chain/calculation-manager/providers/dexes/defi-kingdoms/trader-dfk/constants';
import { TradeDFKSwapTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/defi-kingdoms/trader-dfk/trader-dfk-trade';

export class TradeDFKSwapProvider extends UniswapV2AbstractProvider<TradeDFKSwapTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.DFK;

    public readonly UniswapV2TradeClass = TradeDFKSwapTrade;

    public readonly providerSettings = TRADER_DFK_PROVIDER_CONFIGURATION;
}
