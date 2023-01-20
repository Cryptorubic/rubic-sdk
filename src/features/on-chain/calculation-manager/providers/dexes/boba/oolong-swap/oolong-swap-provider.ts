import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { OOLONG_SWAP_PROVIDER_CONFIGURATION } from 'src/features/on-chain/calculation-manager/providers/dexes/boba/oolong-swap/constants';
import { OolongSwapTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/boba/oolong-swap/oolong-swap-trade';
import { UniswapV2AbstractProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-provider';

export class OolongSwapProvider extends UniswapV2AbstractProvider<OolongSwapTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.BOBA;

    public readonly UniswapV2TradeClass = OolongSwapTrade;

    public readonly providerSettings = OOLONG_SWAP_PROVIDER_CONFIGURATION;
}
