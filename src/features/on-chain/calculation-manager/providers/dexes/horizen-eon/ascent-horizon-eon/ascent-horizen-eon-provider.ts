import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { UniswapV2AbstractProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { AscentHorizenEonTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/horizen-eon/ascent-horizon-eon/ascent-horizen-eon-trade';
import { ASCENT_HORIZEN_EON_PROVIDER_CONFIGURATION } from 'src/features/on-chain/calculation-manager/providers/dexes/horizen-eon/ascent-horizon-eon/constants';
export class AscentHorizenEonProvider extends UniswapV2AbstractProvider<AscentHorizenEonTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.HORIZEN_EON;

    public readonly UniswapV2TradeClass = AscentHorizenEonTrade;

    public readonly providerSettings = ASCENT_HORIZEN_EON_PROVIDER_CONFIGURATION;
}
