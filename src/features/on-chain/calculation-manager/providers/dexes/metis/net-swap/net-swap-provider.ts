import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { UniswapV2AbstractProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { NET_SWAP_PROVIDER_CONFIGURATION } from 'src/features/on-chain/calculation-manager/providers/dexes/metis/net-swap/constants';
import { NetSwapTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/metis/net-swap/net-swap-trade';

export class NetSwapProvider extends UniswapV2AbstractProvider<NetSwapTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.METIS;

    public readonly UniswapV2TradeClass = NetSwapTrade;

    public readonly providerSettings = NET_SWAP_PROVIDER_CONFIGURATION;
}
