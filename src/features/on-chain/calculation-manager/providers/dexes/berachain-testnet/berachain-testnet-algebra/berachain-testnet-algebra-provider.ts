import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { createTokenNativeAddressProxyInPathStartAndEnd } from 'src/features/common/utils/token-native-address-proxy';
import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { BerachainTestnetAlgebraTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/berachain-testnet/berachain-testnet-algebra/berachain-testnet-algebra-trade';
import { BerachainTestnetAlgebraRoute } from 'src/features/on-chain/calculation-manager/providers/dexes/berachain-testnet/berachain-testnet-algebra/models/berachain-testnet-algebra-route';
import { AlgebraQuoterController } from 'src/features/on-chain/calculation-manager/providers/dexes/common/algebra/algebra-quoter-controller';
import { UniswapV3AlgebraTradeStructOmitPath } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v3-algebra-abstract/models/uniswap-v3-algebra-trade-struct';
import { UniswapV3AlgebraAbstractProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v3-algebra-abstract/uniswap-v3-algebra-abstract-provider';

import { defaultBerachainTestnetProviderConfiguration } from '../default-constants';
import { BERACHAIN_TESTNET_ALGEBRA_PROVIDER_CONFIGURATION } from './constants/provider-configuration';
import {
    BERACHAIN_TESTNET_ALGEBRA_ROUTER_CONTRACT_ABI,
    BERACHAIN_TESTNET_ALGEBRA_ROUTER_CONTRACT_ADDRESS
} from './constants/swap-router-contract-data';
import {
    BERACHAIN_TESTNET_ALGEBRA_QUOTER_CONTRACT_ABI,
    BERACHAIN_TESTNET_ALGEBRA_QUOTER_CONTRACT_ADDRESS
} from './utils/quoter-controller/constants/quoter-contract-data';

export class BerachainTestnetAlgebraProvider extends UniswapV3AlgebraAbstractProvider<BerachainTestnetAlgebraTrade> {
    protected readonly contractAddress = BERACHAIN_TESTNET_ALGEBRA_ROUTER_CONTRACT_ADDRESS;

    protected readonly contractAbi = BERACHAIN_TESTNET_ALGEBRA_ROUTER_CONTRACT_ABI;

    public readonly blockchain = BLOCKCHAIN_NAME.BERACHAIN_TESTNET;

    protected readonly OnChainTradeClass = BerachainTestnetAlgebraTrade;

    protected readonly providerConfiguration = BERACHAIN_TESTNET_ALGEBRA_PROVIDER_CONFIGURATION;

    protected readonly quoterController = new AlgebraQuoterController(
        this.blockchain,
        defaultBerachainTestnetProviderConfiguration.routingProvidersAddresses,
        BERACHAIN_TESTNET_ALGEBRA_QUOTER_CONTRACT_ADDRESS,
        BERACHAIN_TESTNET_ALGEBRA_QUOTER_CONTRACT_ABI
    );

    public get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.ALGEBRA_INTEGRAL;
    }

    protected createTradeInstance(
        tradeStruct: UniswapV3AlgebraTradeStructOmitPath,
        route: BerachainTestnetAlgebraRoute,
        providerAddress: string
    ): BerachainTestnetAlgebraTrade {
        const path = createTokenNativeAddressProxyInPathStartAndEnd(
            route.path,
            EvmWeb3Pure.nativeTokenAddress
        );
        return new BerachainTestnetAlgebraTrade(
            {
                ...tradeStruct,
                path,
                route
            },
            providerAddress
        );
    }
}
