import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

import { UniswapV2AbstractProvider } from '../../common/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { UNI_SWAP_V2_BAHAMUT_PROVIDER_CONFIGURATION } from './constants';
import { UniSwapV2BahamutTrade } from './uni-swap-v2-bahamut-trade';

export class UniSwapV2BahamutProvider extends UniswapV2AbstractProvider<UniSwapV2BahamutTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.BAHAMUT;

    public readonly UniswapV2TradeClass = UniSwapV2BahamutTrade;

    public readonly providerSettings = UNI_SWAP_V2_BAHAMUT_PROVIDER_CONFIGURATION;
}
