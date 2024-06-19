import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { UniswapV2AbstractProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { DRAGON_SWAP_PROVIDER_CONFIGURATION } from 'src/features/on-chain/calculation-manager/providers/dexes/sei/dragonswap/constants';
import { DragonSwapTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/sei/dragonswap/dragonswap-trade';

export class DragonSwapProvider extends UniswapV2AbstractProvider<DragonSwapTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.SEI;

    public readonly UniswapV2TradeClass = DragonSwapTrade;

    public readonly providerSettings = DRAGON_SWAP_PROVIDER_CONFIGURATION;
}
