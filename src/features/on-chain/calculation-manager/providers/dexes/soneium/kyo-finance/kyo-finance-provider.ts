import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { UniswapV2AbstractProvider } from '../../common/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { KyoFinanceTrade } from './kyo-finance-trade';
import { KYO_FINANCE_PROVIDER_CONFIGURATION } from './constants';

export class KyoFinanceProvider extends UniswapV2AbstractProvider<KyoFinanceTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.SONEIUM;

    public readonly UniswapV2TradeClass = KyoFinanceTrade;

    public readonly providerSettings = KYO_FINANCE_PROVIDER_CONFIGURATION;
}
