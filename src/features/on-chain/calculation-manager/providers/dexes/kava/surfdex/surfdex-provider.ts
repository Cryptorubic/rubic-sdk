import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { UniswapV2AbstractProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { SURFDEX_PROVIDER_CONFIGURATION } from 'src/features/on-chain/calculation-manager/providers/dexes/kava/surfdex/constants';
import { SurfdexTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/kava/surfdex/surfdex-trade';

export class SurfdexProvider extends UniswapV2AbstractProvider<SurfdexTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.KAVA;

    public readonly UniswapV2TradeClass = SurfdexTrade;

    public readonly providerSettings = SURFDEX_PROVIDER_CONFIGURATION;
}
