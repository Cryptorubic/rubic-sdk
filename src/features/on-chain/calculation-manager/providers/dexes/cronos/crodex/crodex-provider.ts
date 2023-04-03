import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { UniswapV2AbstractProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { CRODEX_PROVIDER_CONFIGURATION } from 'src/features/on-chain/calculation-manager/providers/dexes/cronos/crodex/constants';
import { CrodexTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/cronos/crodex/crodex-trade';

export class CrodexProvider extends UniswapV2AbstractProvider<CrodexTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.CRONOS;

    public readonly UniswapV2TradeClass = CrodexTrade;

    public readonly providerSettings = CRODEX_PROVIDER_CONFIGURATION;
}
