import { TRADE_TYPE, TradeType } from 'src/features';
import { BLOCKCHAIN_NAME } from 'src/core';
import { AlgebraQuoterController } from '@features/swap/dexes/polygon/algebra/utils/quoter-controller/algebra-quoter-controller';
import { UniswapV3AlgebraAbstractProvider } from '@features/swap/dexes/common/uniswap-v3-algebra-abstract/uniswap-v3-algebra-abstract-provider';
import { AlgebraTrade } from '@features/swap/dexes/polygon/algebra/algebra-trade';
import { ALGEBRA_V3_PROVIDER_CONFIGURATION } from '@features/swap/dexes/polygon/algebra/constants/provider-configuration';

export class AlgebraProvider extends UniswapV3AlgebraAbstractProvider {
    public readonly blockchain = BLOCKCHAIN_NAME.POLYGON;

    protected readonly InstantTradeClass = AlgebraTrade;

    protected readonly quoterController = new AlgebraQuoterController();

    public readonly providerConfiguration = ALGEBRA_V3_PROVIDER_CONFIGURATION;

    public get type(): TradeType {
        return TRADE_TYPE.ALGEBRA;
    }
}
