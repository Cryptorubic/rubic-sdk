import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { UniswapV2AbstractProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { JOE_FUJI_PROVIDER_CONFIGURATION } from 'src/features/on-chain/calculation-manager/providers/dexes/fuji/joe-fuji/constants';
import { JoeFujiTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/fuji/joe-fuji/joe-fuji-trade';

export class JoeFujiProvider extends UniswapV2AbstractProvider<JoeFujiTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.FUJI;

    public readonly UniswapV2TradeClass = JoeFujiTrade;

    public readonly providerSettings = JOE_FUJI_PROVIDER_CONFIGURATION;
}
