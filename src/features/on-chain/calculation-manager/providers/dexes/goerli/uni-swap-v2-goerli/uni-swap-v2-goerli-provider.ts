import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { UniswapV2AbstractProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { UNISWAP_V2_GOERLI_PROVIDER_CONFIGURATION } from 'src/features/on-chain/calculation-manager/providers/dexes/goerli/uni-swap-v2-goerli/constants';
import { UniSwapV2GoerliTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/goerli/uni-swap-v2-goerli/uni-swap-v2-goerli-trade';

export class UniSwapV2GoerliProvider extends UniswapV2AbstractProvider<UniSwapV2GoerliTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.GOERLI;

    public readonly UniswapV2TradeClass = UniSwapV2GoerliTrade;

    public readonly providerSettings = UNISWAP_V2_GOERLI_PROVIDER_CONFIGURATION;
}
