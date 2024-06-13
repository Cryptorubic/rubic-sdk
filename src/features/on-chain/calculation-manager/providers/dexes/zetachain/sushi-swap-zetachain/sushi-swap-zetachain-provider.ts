import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

import { UniswapV2AbstractProvider } from '../../common/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { SUSHI_SWAP_ZETACHAIN_PROVIDER_CONFIGURATION } from './constants';
import { SushiSwapZetachainTrade } from './sushi-swap-zetachain-trade';

export class SushiSwapZetachainProvider extends UniswapV2AbstractProvider<SushiSwapZetachainTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.ZETACHAIN;

    public readonly UniswapV2TradeClass = SushiSwapZetachainTrade;

    public readonly providerSettings = SUSHI_SWAP_ZETACHAIN_PROVIDER_CONFIGURATION;
}
