import { UniswapV3AbstractTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v3-abstract/uniswap-v3-abstract-trade';
import { UniswapV3RouterConfiguration } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v3-abstract/models/uniswap-v3-router-configuration';
import { UniswapV3AlgebraAbstractProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v3-algebra-abstract/uniswap-v3-algebra-abstract-provider';
import { UniswapV3QuoterController } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v3-abstract/utils/quoter-controller/uniswap-v3-quoter-controller';
import { UniswapV3TradeClass } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v3-abstract/models/uniswap-v3-trade-class';
import { UniswapV3AlgebraTradeStruct } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v3-algebra-abstract/uniswap-v3-algebra-abstract-trade';
import {
    UNISWAP_V3_SWAP_ROUTER_CONTRACT_ABI,
    UNISWAP_V3_SWAP_ROUTER_CONTRACT_ADDRESS
} from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v3-abstract/constants/swap-router-contract-abi';
import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { UniswapV3Route } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v3-abstract/models/uniswap-v3-route';
import { Cache } from 'src/common/utils/decorators';

export abstract class UniswapV3AbstractProvider<
    T extends UniswapV3AbstractTrade = UniswapV3AbstractTrade
> extends UniswapV3AlgebraAbstractProvider<T> {
    public readonly contractAddress = UNISWAP_V3_SWAP_ROUTER_CONTRACT_ADDRESS;

    protected readonly contractAbi = UNISWAP_V3_SWAP_ROUTER_CONTRACT_ABI;

    protected abstract readonly OnChainTradeClass: UniswapV3TradeClass<T>;

    protected abstract readonly routerConfiguration: UniswapV3RouterConfiguration<string>;

    protected readonly isRubicOptimisationEnabled: boolean = false;

    @Cache
    protected get quoterController(): UniswapV3QuoterController {
        return new UniswapV3QuoterController(this.blockchain, this.routerConfiguration);
    }

    public get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.UNI_SWAP_V3;
    }

    protected createTradeInstance(
        tradeStruct: UniswapV3AlgebraTradeStruct,
        route: UniswapV3Route,
        useProxy: boolean,
        providerAddress: string
    ): T {
        return new this.OnChainTradeClass(
            {
                ...tradeStruct,
                route
            },
            useProxy,
            providerAddress
        );
    }
}
