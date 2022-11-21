import { UniswapV2AbstractProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/abstract/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { WagyuSwapTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/velas/wagyu-swap/wagyu-swap-trade';
import { WAGYU_SWAP_PROVIDER_CONFIGURATION } from 'src/features/on-chain/calculation-manager/providers/dexes/velas/wagyu-swap/constants';

export class WagyuSwapProvider extends UniswapV2AbstractProvider<WagyuSwapTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.VELAS;

    public readonly UniswapV2TradeClass = WagyuSwapTrade;

    public readonly providerSettings = WAGYU_SWAP_PROVIDER_CONFIGURATION;
}
