import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { UniswapV2AbstractProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { SUSHI_SWAP_PULSECHAIN_PROVIDER_CONFIGURATION } from 'src/features/on-chain/calculation-manager/providers/dexes/pulsechain/sushi-swap-pulsechain/constants';
import { SushiSwapPulsechainTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/pulsechain/sushi-swap-pulsechain/sushi-swap-pulsechain-trade';

export class SushiSwapPulsechainProvider extends UniswapV2AbstractProvider<SushiSwapPulsechainTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.PULSECHAIN;

    public readonly UniswapV2TradeClass = SushiSwapPulsechainTrade;

    public readonly providerSettings = SUSHI_SWAP_PULSECHAIN_PROVIDER_CONFIGURATION;
}
