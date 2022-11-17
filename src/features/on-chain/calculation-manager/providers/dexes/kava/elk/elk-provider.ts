import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { ElkTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/kava/elk/elk-trade';
import { ELK_PROVIDER_CONFIGURATION } from 'src/features/on-chain/calculation-manager/providers/dexes/kava/elk/constants';
import { UniswapV2AbstractProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-provider';

export class ElkProvider extends UniswapV2AbstractProvider<ElkTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.KAVA;

    public readonly UniswapV2TradeClass = ElkTrade;

    public readonly providerSettings = ELK_PROVIDER_CONFIGURATION;
}
