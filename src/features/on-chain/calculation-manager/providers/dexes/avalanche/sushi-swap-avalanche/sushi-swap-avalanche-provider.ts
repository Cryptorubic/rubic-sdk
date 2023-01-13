import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { SUSHI_SWAP_AVALANCHE_PROVIDER_CONFIGURATION } from 'src/features/on-chain/calculation-manager/providers/dexes/avalanche/sushi-swap-avalanche/constants';
import { SushiSwapAvalancheTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/avalanche/sushi-swap-avalanche/sushi-swap-avalanche-trade';
import { UniswapV2AbstractProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-provider';

export class SushiSwapAvalancheProvider extends UniswapV2AbstractProvider<SushiSwapAvalancheTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.AVALANCHE;

    public readonly UniswapV2TradeClass = SushiSwapAvalancheTrade;

    public readonly providerSettings = SUSHI_SWAP_AVALANCHE_PROVIDER_CONFIGURATION;
}
