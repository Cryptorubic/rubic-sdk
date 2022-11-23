import { UniswapV3AlgebraAbstractProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v3-algebra-abstract/uniswap-v3-algebra-abstract-provider';
import { QuickSwapV3Trade } from 'src/features/on-chain/calculation-manager/providers/dexes/polygon/quick-swap-v3/quick-swap-v3-trade';
import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import {
    QUICK_SWAP_V3_ROUTER_CONTRACT_ABI,
    QUICK_SWAP_V3_ROUTER_CONTRACT_ADDRESS
} from 'src/features/on-chain/calculation-manager/providers/dexes/polygon/quick-swap-v3/constants/swap-router-contract-data';
import { QUICK_SWAP_V3_PROVIDER_CONFIGURATION } from 'src/features/on-chain/calculation-manager/providers/dexes/polygon/quick-swap-v3/constants/provider-configuration';
import { QuickSwapV3Route } from 'src/features/on-chain/calculation-manager/providers/dexes/polygon/quick-swap-v3/models/quick-swap-v3-route';
import { AlgebraQuoterController } from 'src/features/on-chain/calculation-manager/providers/dexes/common/algebra/algebra-quoter-controller';
import {
    QUICK_SWAP_V3_QUOTER_CONTRACT_ABI,
    QUICK_SWAP_V3_QUOTER_CONTRACT_ADDRESS
} from 'src/features/on-chain/calculation-manager/providers/dexes/polygon/quick-swap-v3/utils/quoter-controller/constants/quoter-contract-data';
import { createTokenNativeAddressProxyInPathStartAndEnd } from 'src/features/common/utils/token-native-address-proxy';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { UniswapV3AlgebraTradeStructOmitPath } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v3-algebra-abstract/models/uniswap-v3-algebra-trade-struct';

export class QuickSwapV3Provider extends UniswapV3AlgebraAbstractProvider<QuickSwapV3Trade> {
    protected readonly contractAddress = QUICK_SWAP_V3_ROUTER_CONTRACT_ADDRESS;

    protected readonly contractAbi = QUICK_SWAP_V3_ROUTER_CONTRACT_ABI;

    public readonly blockchain = BLOCKCHAIN_NAME.POLYGON;

    protected readonly OnChainTradeClass = QuickSwapV3Trade;

    protected readonly quoterController = new AlgebraQuoterController(
        QUICK_SWAP_V3_QUOTER_CONTRACT_ABI,
        QUICK_SWAP_V3_QUOTER_CONTRACT_ADDRESS
    );

    public readonly providerConfiguration = QUICK_SWAP_V3_PROVIDER_CONFIGURATION;

    public get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.QUICK_SWAP_V3;
    }

    protected createTradeInstance(
        tradeStruct: UniswapV3AlgebraTradeStructOmitPath,
        route: QuickSwapV3Route,
        providerAddress: string
    ): QuickSwapV3Trade {
        const path = createTokenNativeAddressProxyInPathStartAndEnd(
            route.path,
            EvmWeb3Pure.nativeTokenAddress
        );
        return new QuickSwapV3Trade(
            {
                ...tradeStruct,
                path,
                route
            },
            providerAddress
        );
    }
}
