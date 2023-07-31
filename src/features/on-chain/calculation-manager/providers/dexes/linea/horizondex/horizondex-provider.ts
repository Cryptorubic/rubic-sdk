import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { UniswapV2AbstractProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { HorizonDEXTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/linea/horizondex/horizondex-trade';
import { HORIZONDEX_PROVIDER_CONFIGURATION } from 'src/features/on-chain/calculation-manager/providers/dexes/linea/horizondex/сonstants';

export class HorizonDEXProvider extends UniswapV2AbstractProvider<HorizonDEXTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.LINEA;

    public readonly UniswapV2TradeClass = HorizonDEXTrade;

    public readonly providerSettings = HORIZONDEX_PROVIDER_CONFIGURATION;
}
