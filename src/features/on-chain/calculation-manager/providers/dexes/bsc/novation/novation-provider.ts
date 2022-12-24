import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { NOVATION_PROVIDER_CONFIGURATION } from 'src/features/on-chain/calculation-manager/providers/dexes/bsc/novation/constants';
import { NovationTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/bsc/novation/novation-trade';
import { UniswapV2AbstractProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-provider';

export class NovationProvider extends UniswapV2AbstractProvider<NovationTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN;

    public readonly UniswapV2TradeClass = NovationTrade;

    public readonly providerSettings = NOVATION_PROVIDER_CONFIGURATION;
}
