import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { UniswapV2AbstractProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { EDDY_FINANCE_MODE_PROVIDER_CONFIGURATION } from 'src/features/on-chain/calculation-manager/providers/dexes/mode/eddy-finance-mode/constants';

import { EddyFinanceModeTrade } from './eddy-finance-mode-trade';

export class EddyFinanceModeProvider extends UniswapV2AbstractProvider<EddyFinanceModeTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.MODE;

    public readonly UniswapV2TradeClass = EddyFinanceModeTrade;

    public readonly providerSettings = EDDY_FINANCE_MODE_PROVIDER_CONFIGURATION;
}
