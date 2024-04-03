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
import { ModeAlgebraTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/mode/algebra-mode/mode-algebra-trade';
import { ModeAlgebraRoute } from 'src/features/on-chain/calculation-manager/providers/dexes/mode/algebra-mode/models/mode-algebra-route';

import { defaultModeProviderConfiguration } from '../default-constants';
import { MODE_ALGEBRA_PROVIDER_CONFIGURATION } from './constants/provider-configuration';
import {
    MODE_ALGEBRA_ROUTER_CONTRACT_ABI,
    MODE_ALGEBRA_ROUTER_CONTRACT_ADDRESS
} from './constants/swap-router-contract-data';
import {
    MODE_ALGEBRA_QUOTER_CONTRACT_ABI,
    MODE_ALGEBRA_QUOTER_CONTRACT_ADDRESS
} from './utils/quoter-controller/constants/quoter-contract-data';

export class ModeAlgebraProvider extends UniswapV3AlgebraAbstractProvider<ModeAlgebraTrade> {
    protected readonly contractAddress = MODE_ALGEBRA_ROUTER_CONTRACT_ADDRESS;

    protected readonly contractAbi = MODE_ALGEBRA_ROUTER_CONTRACT_ABI;

    public readonly blockchain = BLOCKCHAIN_NAME.MODE;

    protected readonly OnChainTradeClass = ModeAlgebraTrade;

    protected readonly providerConfiguration = MODE_ALGEBRA_PROVIDER_CONFIGURATION;

    protected readonly quoterController = new AlgebraQuoterController(
        this.blockchain,
        defaultModeProviderConfiguration.routingProvidersAddresses,
        MODE_ALGEBRA_QUOTER_CONTRACT_ADDRESS,
        MODE_ALGEBRA_QUOTER_CONTRACT_ABI
    );

    public get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.KIM;
    }

    protected createTradeInstance(
        tradeStruct: UniswapV3AlgebraTradeStructOmitPath,
        route: ModeAlgebraRoute,
        providerAddress: string
    ): ModeAlgebraTrade {
        const path = createTokenNativeAddressProxyInPathStartAndEnd(
            route.path,
            EvmWeb3Pure.nativeTokenAddress
        );
        return new ModeAlgebraTrade(
            {
                ...tradeStruct,
                path,
                route
            },
            providerAddress
        );
    }
}
