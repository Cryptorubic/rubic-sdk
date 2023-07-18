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
import { ALGEBRA_SWAP_ROUTER_CONTRACT_ABI } from 'src/features/on-chain/calculation-manager/providers/dexes/polygon/algebra/constants/swap-router-contract-data';
import { AlgebraRoute } from 'src/features/on-chain/calculation-manager/providers/dexes/polygon/algebra/models/algebra-route';
import { QUICK_SWAP_V3_QUOTER_CONTRACT_ABI } from 'src/features/on-chain/calculation-manager/providers/dexes/polygon/quick-swap-v3/utils/quoter-controller/constants/quoter-contract-data';
import { UNI_SWAP_V3_SCROLL_TESTNET_PROVIDER_CONFIGURATION } from 'src/features/on-chain/calculation-manager/providers/dexes/scroll-testnet/uni-swap-v3-scroll-testnet/constants/provider-configuration';
import { UNI_SWAP_V3_SCROLL_TESTNET_ROUTER_CONFIGURATION } from 'src/features/on-chain/calculation-manager/providers/dexes/scroll-testnet/uni-swap-v3-scroll-testnet/constants/router-configuration';
import { UniSwapV3ScrollTestnetTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/scroll-testnet/uni-swap-v3-scroll-testnet/uni-swap-v3-scroll-testnet-trade';

export class UniSwapV3ScrollTestnetProvider extends UniswapV3AlgebraAbstractProvider<UniSwapV3ScrollTestnetTrade> {
    public readonly contractAddress = '0xD9880690bd717189cC3Fbe7B9020F27fae7Ac76F';

    protected readonly contractAbi = ALGEBRA_SWAP_ROUTER_CONTRACT_ABI;

    public readonly blockchain = BLOCKCHAIN_NAME.SCROLL_TESTNET;

    public readonly OnChainTradeClass = UniSwapV3ScrollTestnetTrade;

    public readonly providerConfiguration = UNI_SWAP_V3_SCROLL_TESTNET_PROVIDER_CONFIGURATION;

    public readonly routerConfiguration = UNI_SWAP_V3_SCROLL_TESTNET_ROUTER_CONFIGURATION;

    protected readonly quoterController = new AlgebraQuoterController(
        QUICK_SWAP_V3_QUOTER_CONTRACT_ABI,
        '0xbf1c1FE1e9e900aFd5ba2Eb67480c44266D5eD84',
        BLOCKCHAIN_NAME.SCROLL_TESTNET,
        Object.values(this.routerConfiguration.tokens)
    );

    public get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.UNI_SWAP_V3;
    }

    protected createTradeInstance(
        tradeStruct: UniswapV3AlgebraTradeStructOmitPath,
        route: AlgebraRoute,
        providerAddress: string
    ): UniSwapV3ScrollTestnetTrade {
        const path = createTokenNativeAddressProxyInPathStartAndEnd(
            route.path,
            EvmWeb3Pure.nativeTokenAddress
        );
        return new UniSwapV3ScrollTestnetTrade(
            {
                ...tradeStruct,
                path,
                route
            },
            providerAddress
        );
    }
}
