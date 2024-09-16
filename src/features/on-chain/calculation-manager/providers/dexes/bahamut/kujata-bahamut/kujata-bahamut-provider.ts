import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

import { UniswapV2AbstractProvider } from '../../common/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { KUJATA_BAHAMUT_PROVIDER_CONFIGURATION } from './constants';
import { KujataBahamutTrade } from './kujata-bahamut-trade';

export class KujataBahamutProvider extends UniswapV2AbstractProvider<KujataBahamutTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.BAHAMUT;

    public readonly UniswapV2TradeClass = KujataBahamutTrade;

    public readonly providerSettings = KUJATA_BAHAMUT_PROVIDER_CONFIGURATION;
}
