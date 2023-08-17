import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { BaseSwapTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/base/base-swap/base-swap-trade';
import { BASE_SWAP_PROVIDER_CONFIGURATION } from 'src/features/on-chain/calculation-manager/providers/dexes/base/base-swap/constants';
import { UniswapV2AbstractProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-provider';

export class BaseSwapProvider extends UniswapV2AbstractProvider<BaseSwapTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.BASE;

    public readonly UniswapV2TradeClass = BaseSwapTrade;

    public readonly providerSettings = BASE_SWAP_PROVIDER_CONFIGURATION;
}
