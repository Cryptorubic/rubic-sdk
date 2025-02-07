import { ON_CHAIN_TRADE_TYPE, OnChainTradeType } from '../../../common/models/on-chain-trade-type';
import { UniswapV2AbstractTrade } from '../../common/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import { KYO_FINANCE_CONTRACT_ADDRESS } from './constants';

export class KyoFinanceTrade extends UniswapV2AbstractTrade {
    public static get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.KYO_FINANCE;
    }

    public readonly dexContractAddress = KYO_FINANCE_CONTRACT_ADDRESS;
}
