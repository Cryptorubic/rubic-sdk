import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { TRADER_JOE_BSCT_PROVIDER_CONFIGURATION } from 'src/features/on-chain/calculation-manager/providers/dexes/bsct/trader-joe-bsct/constants';
import { TraderJoeBsctTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/bsct/trader-joe-bsct/trader-joe-bsct-trade';
import { UniswapV2AbstractProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-provider';

export class TraderJoeBsctProvider extends UniswapV2AbstractProvider<TraderJoeBsctTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN_TESTNET;

    public readonly UniswapV2TradeClass = TraderJoeBsctTrade;

    public readonly providerSettings = TRADER_JOE_BSCT_PROVIDER_CONFIGURATION;
}
