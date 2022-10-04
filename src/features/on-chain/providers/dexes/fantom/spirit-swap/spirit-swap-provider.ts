import { SPIRIT_SWAP_PROVIDER_CONFIGURATION } from 'src/features/on-chain/providers/dexes/fantom/spirit-swap/constants';
import { SpiritSwapTrade } from 'src/features/on-chain/providers/dexes/fantom/spirit-swap/spirit-swap-trade';
import { UniswapV2AbstractProvider } from 'src/features/on-chain/providers/dexes/abstract/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

export class SpiritSwapProvider extends UniswapV2AbstractProvider<SpiritSwapTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.FANTOM;

    public readonly UniswapV2TradeClass = SpiritSwapTrade;

    public readonly providerSettings = SPIRIT_SWAP_PROVIDER_CONFIGURATION;
}
