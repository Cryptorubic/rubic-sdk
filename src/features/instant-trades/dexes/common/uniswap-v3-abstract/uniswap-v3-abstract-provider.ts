import { TradeType } from 'src/features';
import { UniswapV3QuoterController } from '@rsdk-features/instant-trades/dexes/common/uniswap-v3-abstract/utils/quoter-controller/uniswap-v3-quoter-controller';
import { Cache } from 'src/common';
import { UniswapV3AbstractTrade } from '@rsdk-features/instant-trades/dexes/common/uniswap-v3-abstract/uniswap-v3-abstract-trade';
import { UniswapV3RouterConfiguration } from '@rsdk-features/instant-trades/dexes/common/uniswap-v3-abstract/models/uniswap-v3-router-configuration';
import { UniswapV3AlgebraAbstractProvider } from '@rsdk-features/instant-trades/dexes/common/uniswap-v3-algebra-abstract/uniswap-v3-algebra-abstract-provider';
import { UniswapV3AlgebraTradeStruct } from '@rsdk-features/instant-trades/dexes/common/uniswap-v3-algebra-abstract/uniswap-v3-algebra-abstract-trade';
import { UniswapV3Route } from '@rsdk-features/instant-trades/dexes/common/uniswap-v3-abstract/models/uniswap-v3-route';
import { UniswapV3TradeClass } from '@rsdk-features/instant-trades/dexes/common/uniswap-v3-abstract/models/uniswap-v3-trade-class';
import {
    UNISWAP_V3_SWAP_ROUTER_CONTRACT_ABI,
    UNISWAP_V3_SWAP_ROUTER_CONTRACT_ADDRESS
} from 'src/features/instant-trades/dexes/common/uniswap-v3-abstract/constants/swap-router-contract-abi';

export abstract class UniswapV3AbstractProvider<
    T extends UniswapV3AbstractTrade = UniswapV3AbstractTrade
> extends UniswapV3AlgebraAbstractProvider<T> {
    protected readonly contractAddress = UNISWAP_V3_SWAP_ROUTER_CONTRACT_ADDRESS;

    protected readonly contractAbi = UNISWAP_V3_SWAP_ROUTER_CONTRACT_ABI;

    protected abstract readonly InstantTradeClass: UniswapV3TradeClass<T>;

    protected abstract readonly routerConfiguration: UniswapV3RouterConfiguration<string>;

    protected readonly isRubicOptimisationEnabled: boolean = false;

    @Cache
    protected get quoterController(): UniswapV3QuoterController {
        return new UniswapV3QuoterController(this.blockchain, this.routerConfiguration);
    }

    public get type(): TradeType {
        return this.InstantTradeClass.type;
    }

    protected createTradeInstance(
        tradeStruct: UniswapV3AlgebraTradeStruct,
        route: UniswapV3Route
    ): T {
        return new this.InstantTradeClass({
            ...tradeStruct,
            route
        });
    }
}
