import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { createTokenNativeAddressProxyInPathStartAndEnd } from 'src/features/common/utils/token-native-address-proxy';

import { ON_CHAIN_TRADE_TYPE, OnChainTradeType } from '../../../common/models/on-chain-trade-type';
import { AlgebraQuoterController } from '../../common/algebra/algebra-quoter-controller';
import { UniswapV3AlgebraTradeStructOmitPath } from '../../common/uniswap-v3-algebra-abstract/models/uniswap-v3-algebra-trade-struct';
import { UniswapV3AlgebraAbstractProvider } from '../../common/uniswap-v3-algebra-abstract/uniswap-v3-algebra-abstract-provider';
import { QUICK_SWAP_V3_ROUTER_CONTRACT_ABI } from '../../polygon/quick-swap-v3/constants/swap-router-contract-data';
import { QuickSwapV3Route } from '../../polygon/quick-swap-v3/models/quick-swap-v3-route';
import { defaultGravityProviderConfiguration } from '../default-constants';
import { CamelotGravityTrade } from './camelot-gravity-trade';
import { CAMELOT_GRAVITY_ROUTER_CONTRACT_ADDRESS } from './constants/gravity-swap-router-contract-address';
import { CAMELOT_GRAVITY_PROVIDER_CONFIGURATION } from './constants/provider-configuration';
import {
    CAMELOT_GRAVITY_QUOTER_CONTRACT_ABI,
    CAMELOT_GRAVITY_QUOTER_CONTRACT_ADDRESS
} from './constants/quote-contract-data';

export class CamelotGravityProvider extends UniswapV3AlgebraAbstractProvider<CamelotGravityTrade> {
    protected readonly contractAddress = CAMELOT_GRAVITY_ROUTER_CONTRACT_ADDRESS;

    protected readonly contractAbi = QUICK_SWAP_V3_ROUTER_CONTRACT_ABI;

    public readonly blockchain = BLOCKCHAIN_NAME.GRAVITY;

    protected readonly OnChainTradeClass = CamelotGravityTrade;

    protected readonly quoterController = new AlgebraQuoterController(
        this.blockchain,
        defaultGravityProviderConfiguration.routingProvidersAddresses,
        CAMELOT_GRAVITY_QUOTER_CONTRACT_ADDRESS,
        CAMELOT_GRAVITY_QUOTER_CONTRACT_ABI
    );

    protected readonly providerConfiguration = CAMELOT_GRAVITY_PROVIDER_CONFIGURATION;

    public get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.CAMELOT;
    }

    protected createTradeInstance(
        tradeStruct: UniswapV3AlgebraTradeStructOmitPath,
        route: QuickSwapV3Route,
        providerAddress: string
    ): CamelotGravityTrade {
        const path = createTokenNativeAddressProxyInPathStartAndEnd(
            route.path,
            EvmWeb3Pure.nativeTokenAddress
        );
        return new CamelotGravityTrade(
            {
                ...tradeStruct,
                path,
                route
            },
            providerAddress
        );
    }
}
