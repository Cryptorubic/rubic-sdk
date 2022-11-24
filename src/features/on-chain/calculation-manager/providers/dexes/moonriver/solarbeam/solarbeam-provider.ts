import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { UniswapV2AbstractProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { SOLARBEAM_PROVIDER_CONFIGURATION } from 'src/features/on-chain/calculation-manager/providers/dexes/moonriver/solarbeam/constants';
import { SolarbeamTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/moonriver/solarbeam/solarbeam-trade';

export class SolarbeamProvider extends UniswapV2AbstractProvider<SolarbeamTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.MOONRIVER;

    public readonly UniswapV2TradeClass = SolarbeamTrade;

    public readonly providerSettings = SOLARBEAM_PROVIDER_CONFIGURATION;
}
