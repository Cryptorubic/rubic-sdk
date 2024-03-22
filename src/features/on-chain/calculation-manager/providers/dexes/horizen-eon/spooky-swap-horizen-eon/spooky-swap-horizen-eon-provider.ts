import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { UniswapV2AbstractProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { SPOOKY_SWAP_HORIZEN_EON_PROVIDER_CONFIGURATION } from 'src/features/on-chain/calculation-manager/providers/dexes/horizen-eon/spooky-swap-horizen-eon/constants';
import { SpookySwapHorizenEonTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/horizen-eon/spooky-swap-horizen-eon/spooky-swap-horizen-eon-trade';

export class SpookySwapHorizenEonProvider extends UniswapV2AbstractProvider<SpookySwapHorizenEonTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.HORIZEN_EON;

    public readonly UniswapV2TradeClass = SpookySwapHorizenEonTrade;

    public readonly providerSettings = SPOOKY_SWAP_HORIZEN_EON_PROVIDER_CONFIGURATION;
}
