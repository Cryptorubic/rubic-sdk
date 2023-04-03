import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { UniswapV2AbstractProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { CRONA_SWAP_PROVIDER_CONFIGURATION } from 'src/features/on-chain/calculation-manager/providers/dexes/cronos/crona-swap/constants';
import { CronaSwapTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/cronos/crona-swap/crona-swap-trade';

export class CronaSwapProvider extends UniswapV2AbstractProvider<CronaSwapTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.CRONOS;

    public readonly UniswapV2TradeClass = CronaSwapTrade;

    public readonly providerSettings = CRONA_SWAP_PROVIDER_CONFIGURATION;
}
