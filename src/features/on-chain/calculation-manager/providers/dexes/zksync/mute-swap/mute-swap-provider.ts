import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { UniswapV2AbstractProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { MUTE_SWAP_PROVIDER_CONFIGURATION } from 'src/features/on-chain/calculation-manager/providers/dexes/zksync/mute-swap/constants';
import { MuteSwapTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/zksync/mute-swap/mute-swap-trade';

export class MuteSwapProvider extends UniswapV2AbstractProvider<MuteSwapTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.ZK_SYNC;

    public readonly UniswapV2TradeClass = MuteSwapTrade;

    public readonly providerSettings = MUTE_SWAP_PROVIDER_CONFIGURATION;
}
