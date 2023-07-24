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
import { AlgebraTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/polygon/algebra/algebra-trade';
import { ALGEBRA_V3_PROVIDER_CONFIGURATION } from 'src/features/on-chain/calculation-manager/providers/dexes/polygon/algebra/constants/provider-configuration';
import {
    ALGEBRA_SWAP_ROUTER_CONTRACT_ABI,
    ALGEBRA_SWAP_ROUTER_CONTRACT_ADDRESS
} from 'src/features/on-chain/calculation-manager/providers/dexes/polygon/algebra/constants/swap-router-contract-data';
import { AlgebraRoute } from 'src/features/on-chain/calculation-manager/providers/dexes/polygon/algebra/models/algebra-route';
import {
    ALGEBRA_QUOTER_CONTRACT_ABI,
    ALGEBRA_QUOTER_CONTRACT_ADDRESS
} from 'src/features/on-chain/calculation-manager/providers/dexes/polygon/algebra/utils/quoter-controller/constants/quoter-contract-data';
import { defaultPolygonProviderConfiguration } from 'src/features/on-chain/calculation-manager/providers/dexes/polygon/default-constants';

export class AlgebraProvider extends UniswapV3AlgebraAbstractProvider<AlgebraTrade> {
    public readonly contractAddress = ALGEBRA_SWAP_ROUTER_CONTRACT_ADDRESS;

    protected readonly contractAbi = ALGEBRA_SWAP_ROUTER_CONTRACT_ABI;

    public readonly blockchain = BLOCKCHAIN_NAME.POLYGON;

    protected readonly OnChainTradeClass = AlgebraTrade;

    protected readonly quoterController = new AlgebraQuoterController(
        ALGEBRA_QUOTER_CONTRACT_ABI,
        ALGEBRA_QUOTER_CONTRACT_ADDRESS,
        this.blockchain,
        defaultPolygonProviderConfiguration.routingProvidersAddresses
    );

    public readonly providerConfiguration = ALGEBRA_V3_PROVIDER_CONFIGURATION;

    public get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.ALGEBRA;
    }

    protected createTradeInstance(
        tradeStruct: UniswapV3AlgebraTradeStructOmitPath,
        route: AlgebraRoute,
        providerAddress: string
    ): AlgebraTrade {
        const path = createTokenNativeAddressProxyInPathStartAndEnd(
            route.path,
            EvmWeb3Pure.nativeTokenAddress
        );
        return new AlgebraTrade(
            {
                ...tradeStruct,
                path,
                route
            },
            providerAddress
        );
    }
}
