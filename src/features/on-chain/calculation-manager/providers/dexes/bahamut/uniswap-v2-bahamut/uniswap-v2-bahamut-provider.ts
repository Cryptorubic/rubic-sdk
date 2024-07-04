import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

import { UniswapV2AbstractProvider } from '../../common/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { UNISWAP_V2_BAHAMUT_PROVIDER_CONFIGURATION } from './constants';
import { UniswapV2BahamutTrade } from './uniswap-v2-bahamut-trade';

export class UniswapV2BahamutProvider extends UniswapV2AbstractProvider<UniswapV2BahamutTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.BAHAMUT;

    public readonly UniswapV2TradeClass = UniswapV2BahamutTrade;

    public readonly providerSettings = UNISWAP_V2_BAHAMUT_PROVIDER_CONFIGURATION;
}
