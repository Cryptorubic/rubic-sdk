import { TRADE_TYPE, TradeType } from 'src/features';
import { BLOCKCHAIN_NAME } from 'src/core';
import { AlgebraQuoterController } from '@rsdk-features/instant-trades/dexes/polygon/algebra/utils/quoter-controller/algebra-quoter-controller';
import { UniswapV3AlgebraAbstractProvider } from '@rsdk-features/instant-trades/dexes/common/uniswap-v3-algebra-abstract/uniswap-v3-algebra-abstract-provider';
import { AlgebraTrade } from '@rsdk-features/instant-trades/dexes/polygon/algebra/algebra-trade';
import { ALGEBRA_V3_PROVIDER_CONFIGURATION } from '@rsdk-features/instant-trades/dexes/polygon/algebra/constants/provider-configuration';
import { UniswapV3AlgebraTradeStruct } from '@rsdk-features/instant-trades/dexes/common/uniswap-v3-algebra-abstract/uniswap-v3-algebra-abstract-trade';
import { AlgebraRoute } from '@rsdk-features/instant-trades/dexes/polygon/algebra/models/algebra-route';

export class AlgebraProvider extends UniswapV3AlgebraAbstractProvider<AlgebraTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.POLYGON;

    protected readonly InstantTradeClass = AlgebraTrade;

    protected readonly quoterController = new AlgebraQuoterController();

    public readonly providerConfiguration = ALGEBRA_V3_PROVIDER_CONFIGURATION;

    public get type(): TradeType {
        return TRADE_TYPE.ALGEBRA;
    }

    protected createTradeInstance(
        tradeStruct: UniswapV3AlgebraTradeStruct,
        route: AlgebraRoute
    ): AlgebraTrade {
        return new AlgebraTrade({
            ...tradeStruct,
            route
        });
    }
}
