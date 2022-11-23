import { UniswapV2AbstractProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { JupiterSwapTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/kava/jupiter-swap/jupiter-swap-trade';
import { JUPITER_SWAP_PROVIDER_CONFIGURATION } from 'src/features/on-chain/calculation-manager/providers/dexes/kava/jupiter-swap/constants';

export class JupiterSwapProvider extends UniswapV2AbstractProvider<JupiterSwapTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.KAVA;

    public readonly UniswapV2TradeClass = JupiterSwapTrade;

    public readonly providerSettings = JUPITER_SWAP_PROVIDER_CONFIGURATION;
}
