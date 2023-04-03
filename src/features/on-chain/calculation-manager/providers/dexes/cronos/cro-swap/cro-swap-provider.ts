import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { UniswapV2AbstractProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { CRO_SWAP_PROVIDER_CONFIGURATION } from 'src/features/on-chain/calculation-manager/providers/dexes/cronos/cro-swap/constants';
import { CroSwapTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/cronos/cro-swap/cro-swap-trade';

export class CroSwapProvider extends UniswapV2AbstractProvider<CroSwapTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.CRONOS;

    public readonly UniswapV2TradeClass = CroSwapTrade;

    public readonly providerSettings = CRO_SWAP_PROVIDER_CONFIGURATION;
}
