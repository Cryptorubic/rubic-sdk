import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { UniswapV2AbstractProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { BulbaswapTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/morph/bulbaswap/bulbaswap-trade';
import { BULBASWAP_PROVIDER_CONFIGURATION } from 'src/features/on-chain/calculation-manager/providers/dexes/morph/bulbaswap/constants';

export class BulbaswapProvider extends UniswapV2AbstractProvider<BulbaswapTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.MORPH;

    public readonly UniswapV2TradeClass = BulbaswapTrade;

    public readonly providerSettings = BULBASWAP_PROVIDER_CONFIGURATION;
}
