import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { MACARON_PROVIDER_CONFIGURATION } from 'src/features/on-chain/calculation-manager/providers/dexes/bitlayer/macaron/constants';
import { MacaronTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/bitlayer/macaron/macaron-trade';
import { UniswapV2AbstractProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-provider';

export class MacaronProvider extends UniswapV2AbstractProvider<MacaronTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.BITLAYER;

    public readonly UniswapV2TradeClass = MacaronTrade;

    public readonly providerSettings = MACARON_PROVIDER_CONFIGURATION;
}
