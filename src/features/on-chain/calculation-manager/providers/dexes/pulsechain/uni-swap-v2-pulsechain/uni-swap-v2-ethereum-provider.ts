import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { UniswapV2AbstractProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { UNISWAP_V2_PULSECHAIN_PROVIDER_CONFIGURATION } from 'src/features/on-chain/calculation-manager/providers/dexes/pulsechain/uni-swap-v2-pulsechain/constants';
import { UniSwapV2PulsechainTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/pulsechain/uni-swap-v2-pulsechain/uni-swap-v2-ethereum-trade';

export class UniSwapV2PulsechainProvider extends UniswapV2AbstractProvider<UniSwapV2PulsechainTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.PULSECHAIN;

    public readonly UniswapV2TradeClass = UniSwapV2PulsechainTrade;

    public readonly providerSettings = UNISWAP_V2_PULSECHAIN_PROVIDER_CONFIGURATION;
}
