import { UniswapV2AbstractProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/abstract/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { PEGASYS_PROVIDER_CONFIGURATION } from 'src/features/on-chain/calculation-manager/providers/dexes/syscoin/pegasys/constants';
import { PegasysTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/syscoin/pegasys/pegasys-trade';

export class PegasysProvider extends UniswapV2AbstractProvider<PegasysTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.SYSCOIN;

    public readonly UniswapV2TradeClass = PegasysTrade;

    public readonly providerSettings = PEGASYS_PROVIDER_CONFIGURATION;
}
