import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { UniswapV2AbstractProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { VERSE_PROVIDER_CONFIGURATION } from 'src/features/on-chain/calculation-manager/providers/dexes/ethereum/verse/constants';
import { VerseTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/ethereum/verse/verse-trade';

export class VerseProvider extends UniswapV2AbstractProvider<VerseTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.ETHEREUM;

    public readonly UniswapV2TradeClass = VerseTrade;

    public readonly providerSettings = VERSE_PROVIDER_CONFIGURATION;
}
