import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { createTokenNativeAddressProxyInPathStartAndEnd } from 'src/features/common/utils/token-native-address-proxy';
import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { AlgebraQuoterController } from 'src/features/on-chain/calculation-manager/providers/dexes/common/algebra/algebra-quoter-controller';
import { UniswapV3AlgebraTradeStructOmitPath } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v3-algebra-abstract/models/uniswap-v3-algebra-trade-struct';
import { UniswapV3AlgebraAbstractProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v3-algebra-abstract/uniswap-v3-algebra-abstract-provider';
import { AlgebraIntegralTrade } from "./algebra-integral-trade";
import { ALGEBRA_INTEGRAL_PROVIDER_CONFIGURATION } from "./constants/provider-configuration";
import { ALGEBRA_INTEGRAL_QUOTER_CONTRACT_ABI, ALGEBRA_INTEGRAL_QUOTER_CONTRACT_ADDRESS } from "./utils/quoter-controller/constants/quoter-contract-data";
import { AlgebraIntegralRoute } from "./models/algebra-integral-route";
import { ALGEBRA_INTEGRAL_ROUTER_CONTRACT_ABI, ALGEBRA_INTEGRAL_ROUTER_CONTRACT_ADDRESS } from "./constants/swap-router-contract-data";
import { defaultArtheraProviderConfiguration } from "../default-constants";

export class AlgebraIntegralProvider extends UniswapV3AlgebraAbstractProvider<AlgebraIntegralTrade> {
    protected readonly contractAddress = ALGEBRA_INTEGRAL_ROUTER_CONTRACT_ADDRESS;

    protected readonly contractAbi = ALGEBRA_INTEGRAL_ROUTER_CONTRACT_ABI;

    public readonly blockchain = BLOCKCHAIN_NAME.ARTHERA;

    protected readonly OnChainTradeClass = AlgebraIntegralTrade;

    protected readonly providerConfiguration = ALGEBRA_INTEGRAL_PROVIDER_CONFIGURATION;

    protected readonly quoterController = new AlgebraQuoterController(
        this.blockchain,
        defaultArtheraProviderConfiguration.routingProvidersAddresses,
        ALGEBRA_INTEGRAL_QUOTER_CONTRACT_ADDRESS,
        ALGEBRA_INTEGRAL_QUOTER_CONTRACT_ABI
    );

    public get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.ALGEBRA_INTEGRAL;
    }

    protected createTradeInstance(
        tradeStruct: UniswapV3AlgebraTradeStructOmitPath,
        route: AlgebraIntegralRoute,
        providerAddress: string
    ): AlgebraIntegralTrade {
        const path = createTokenNativeAddressProxyInPathStartAndEnd(
            route.path,
            EvmWeb3Pure.nativeTokenAddress
        );
        return new AlgebraIntegralTrade(
            {
                ...tradeStruct,
                path,
                route
            },
            providerAddress
        );
    }
}
