import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { UniswapV2AbstractProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { ZAPPY_PROVIDER_CONFIGURATION } from 'src/features/on-chain/calculation-manager/providers/dexes/telos/zappy/constants';
import { ZappyTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/telos/zappy/trisolaris-aurora-trade';

export class ZappyProvider extends UniswapV2AbstractProvider<ZappyTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.TELOS;

    public readonly UniswapV2TradeClass = ZappyTrade;

    public readonly providerSettings = ZAPPY_PROVIDER_CONFIGURATION;
}
