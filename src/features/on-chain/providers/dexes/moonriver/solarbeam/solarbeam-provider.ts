import { SolarbeamTrade } from 'src/features/on-chain/providers/dexes/moonriver/solarbeam/solarbeam-trade';
import { SOLARBEAM_PROVIDER_CONFIGURATION } from 'src/features/on-chain/providers/dexes/moonriver/solarbeam/constants';
import { UniswapV2AbstractProvider } from 'src/features/on-chain/providers/dexes/abstract/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

export class SolarbeamProvider extends UniswapV2AbstractProvider<SolarbeamTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.MOONRIVER;

    public readonly UniswapV2TradeClass = SolarbeamTrade;

    public readonly providerSettings = SOLARBEAM_PROVIDER_CONFIGURATION;
}
