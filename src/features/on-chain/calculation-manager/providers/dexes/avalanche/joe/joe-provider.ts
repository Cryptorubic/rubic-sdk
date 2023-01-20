import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { JOE_PROVIDER_CONFIGURATION } from 'src/features/on-chain/calculation-manager/providers/dexes/avalanche/joe/constants';
import { JoeTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/avalanche/joe/joe-trade';
import { UniswapV2AbstractProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-provider';

export class JoeProvider extends UniswapV2AbstractProvider<JoeTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.AVALANCHE;

    public readonly UniswapV2TradeClass = JoeTrade;

    public readonly providerSettings = JOE_PROVIDER_CONFIGURATION;
}
