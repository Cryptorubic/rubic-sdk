import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { createTokenNativeAddressProxyInPathStartAndEnd } from 'src/features/common/utils/token-native-address-proxy';
import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { CamelotArbitrumTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/arbitrum/camelot-arbitrum/camelot-arbitrum-trade';
import { CAMELOT_ARBITRUM_PROVIDER_CONFIGURATION } from 'src/features/on-chain/calculation-manager/providers/dexes/arbitrum/camelot-arbitrum/constants/provider-configuration';
import { CAMELOT_ARBITRUM_ROUTER_CONTRACT_ADDRESS } from 'src/features/on-chain/calculation-manager/providers/dexes/arbitrum/camelot-arbitrum/constants/swap-router-contract-data';
import {
    CAMELOT_ARBITRUM_QUOTER_CONTRACT_ABI,
    CAMELOT_ARBITRUM_QUOTER_CONTRACT_ADDRESS
} from 'src/features/on-chain/calculation-manager/providers/dexes/arbitrum/camelot-arbitrum/utils/quoter-controller/constants/quoter-contract-data';
import { defaultArbitrumProviderConfiguration } from 'src/features/on-chain/calculation-manager/providers/dexes/arbitrum/default-constants';
import { AlgebraQuoterController } from 'src/features/on-chain/calculation-manager/providers/dexes/common/algebra/algebra-quoter-controller';
import { UniswapV3AlgebraTradeStructOmitPath } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v3-algebra-abstract/models/uniswap-v3-algebra-trade-struct';
import { UniswapV3AlgebraAbstractProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v3-algebra-abstract/uniswap-v3-algebra-abstract-provider';
import { QUICK_SWAP_V3_ROUTER_CONTRACT_ABI } from 'src/features/on-chain/calculation-manager/providers/dexes/polygon/quick-swap-v3/constants/swap-router-contract-data';
import { QuickSwapV3Route } from 'src/features/on-chain/calculation-manager/providers/dexes/polygon/quick-swap-v3/models/quick-swap-v3-route';

export class CamelotArbitrumProvider extends UniswapV3AlgebraAbstractProvider<CamelotArbitrumTrade> {
    protected readonly contractAddress = CAMELOT_ARBITRUM_ROUTER_CONTRACT_ADDRESS;

    protected readonly contractAbi = QUICK_SWAP_V3_ROUTER_CONTRACT_ABI;

    public readonly blockchain = BLOCKCHAIN_NAME.ARBITRUM;

    protected readonly OnChainTradeClass = CamelotArbitrumTrade;

    protected readonly quoterController = new AlgebraQuoterController(
        this.blockchain,
        defaultArbitrumProviderConfiguration.routingProvidersAddresses,
        CAMELOT_ARBITRUM_QUOTER_CONTRACT_ADDRESS,
        CAMELOT_ARBITRUM_QUOTER_CONTRACT_ABI
    );

    protected readonly providerConfiguration = CAMELOT_ARBITRUM_PROVIDER_CONFIGURATION;

    public get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.CAMELOT;
    }

    protected createTradeInstance(
        tradeStruct: UniswapV3AlgebraTradeStructOmitPath,
        route: QuickSwapV3Route,
        providerAddress: string
    ): CamelotArbitrumTrade {
        const path = createTokenNativeAddressProxyInPathStartAndEnd(
            route.path,
            EvmWeb3Pure.nativeTokenAddress
        );
        return new CamelotArbitrumTrade(
            {
                ...tradeStruct,
                path,
                route
            },
            providerAddress
        );
    }
}
