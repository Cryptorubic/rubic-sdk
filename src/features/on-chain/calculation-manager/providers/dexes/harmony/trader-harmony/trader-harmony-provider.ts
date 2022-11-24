import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { UniswapV2AbstractProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { TRADER_HARMONY_PROVIDER_CONFIGURATION } from 'src/features/on-chain/calculation-manager/providers/dexes/harmony/trader-harmony/constants';
import { TradeHarmonySwapTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/harmony/trader-harmony/trader-harmony-trade';

export class TradeHarmonySwapProvider extends UniswapV2AbstractProvider<TradeHarmonySwapTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.DFK;

    public readonly UniswapV2TradeClass = TradeHarmonySwapTrade;

    public readonly providerSettings = TRADER_HARMONY_PROVIDER_CONFIGURATION;
}
