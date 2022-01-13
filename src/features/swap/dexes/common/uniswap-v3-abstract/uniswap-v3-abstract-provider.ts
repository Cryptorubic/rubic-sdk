import { TradeType } from 'src/features';
import { UniswapV3QuoterController } from '@features/swap/dexes/common/uniswap-v3-abstract/utils/quoter-controller/uniswap-v3-quoter-controller';

import { Cache } from 'src/common';
import { UniswapV3AbstractTrade } from '@features/swap/dexes/common/uniswap-v3-abstract/uniswap-v3-abstract-trade';
import { UniswapV3TradeClass } from '@features/swap/dexes/common/uniswap-v3-abstract/models/uniswap-v3-trade-class';
import { UniswapV3RouterConfiguration } from '@features/swap/dexes/common/uniswap-v3-abstract/models/uniswap-v3-router-configuration';
import { UniswapV3AlgebraAbstractProvider } from '@features/swap/dexes/common/uniswap-v3-algebra-abstract/uniswap-v3-algebra-abstract-provider';

export abstract class UniswapV3AbstractProvider<
    T extends UniswapV3AbstractTrade = UniswapV3AbstractTrade
> extends UniswapV3AlgebraAbstractProvider {
    protected abstract readonly InstantTradeClass: UniswapV3TradeClass<T>;

    protected abstract readonly routerConfiguration: UniswapV3RouterConfiguration<string>;

    @Cache
    protected get quoterController(): UniswapV3QuoterController {
        return new UniswapV3QuoterController(this.blockchain, this.routerConfiguration);
    }

    public get type(): TradeType {
        return this.InstantTradeClass.type;
    }
}
