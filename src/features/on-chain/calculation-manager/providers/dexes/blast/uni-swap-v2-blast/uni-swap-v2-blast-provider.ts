import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { UNISWAP_V2_BLAST_PROVIDER_CONFIGURATION } from 'src/features/on-chain/calculation-manager/providers/dexes/blast/uni-swap-v2-blast/constants';
import { UniSwapV2BlastTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/blast/uni-swap-v2-blast/uni-swap-v2-blast-trade';
import { UniswapV2AbstractProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-provider';

export class UniSwapV2BlastProvider extends UniswapV2AbstractProvider<UniSwapV2BlastTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.BLAST;

    public readonly UniswapV2TradeClass = UniSwapV2BlastTrade;

    public readonly providerSettings = UNISWAP_V2_BLAST_PROVIDER_CONFIGURATION;
}
