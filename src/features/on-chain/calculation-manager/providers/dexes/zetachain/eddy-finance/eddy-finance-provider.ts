import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { UniswapV2AbstractProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { EDDY_FINANCE_PROVIDER_CONFIGURATION } from 'src/features/on-chain/calculation-manager/providers/dexes/zetachain/eddy-finance/constants';
import { EddyFinanceTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/zetachain/eddy-finance/eddy-finance-trade';

export class EddyFinanceProvider extends UniswapV2AbstractProvider<EddyFinanceTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.ZETACHAIN;

    public readonly UniswapV2TradeClass = EddyFinanceTrade;

    public readonly providerSettings = EDDY_FINANCE_PROVIDER_CONFIGURATION;
}
