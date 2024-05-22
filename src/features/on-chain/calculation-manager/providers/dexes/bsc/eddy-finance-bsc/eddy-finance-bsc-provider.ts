import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { EDDY_FINANCE_BSC_PROVIDER_CONFIGURATION } from 'src/features/on-chain/calculation-manager/providers/dexes/bsc/eddy-finance-bsc/constants';
import { UniswapV2AbstractProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { EddyFinanceTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/zetachain/eddy-finance/eddy-finance-trade';

export class EddyFinanceBscProvider extends UniswapV2AbstractProvider<EddyFinanceTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN;

    public readonly UniswapV2TradeClass = EddyFinanceTrade;

    public readonly providerSettings = EDDY_FINANCE_BSC_PROVIDER_CONFIGURATION;
}
