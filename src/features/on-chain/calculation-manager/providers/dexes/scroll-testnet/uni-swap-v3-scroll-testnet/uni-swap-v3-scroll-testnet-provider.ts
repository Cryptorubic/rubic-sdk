import { RubicSdkError } from 'src/common/errors';
import { Token } from 'src/common/tokens';
import { compareAddresses } from 'src/common/utils/blockchain';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { createTokenNativeAddressProxyInPathStartAndEnd } from 'src/features/common/utils/token-native-address-proxy';
import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { UniswapV3Route } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v3-abstract/models/uniswap-v3-route';
import { UNISWAP_V3_QUOTER_CONTRACT_ABI } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v3-abstract/utils/quoter-controller/constants/quoter-contract-data';
import { UniswapV3QuoterController } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v3-abstract/utils/quoter-controller/uniswap-v3-quoter-controller';
import { UniswapV3AlgebraTradeStructOmitPath } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v3-algebra-abstract/models/uniswap-v3-algebra-trade-struct';
import { UniswapV3AlgebraAbstractProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v3-algebra-abstract/uniswap-v3-algebra-abstract-provider';
import { UNI_SWAP_V3_SCROLL_TESTNET_PROVIDER_CONFIGURATION } from 'src/features/on-chain/calculation-manager/providers/dexes/scroll-testnet/uni-swap-v3-scroll-testnet/constants/provider-configuration';
import { UNI_SWAP_V3_SCROLL_TESTNET_ROUTER_CONFIGURATION } from 'src/features/on-chain/calculation-manager/providers/dexes/scroll-testnet/uni-swap-v3-scroll-testnet/constants/router-configuration';
import { SCROLL_UNISWAP_V3_SWAP_ROUTER_CONTRACT_ABI } from 'src/features/on-chain/calculation-manager/providers/dexes/scroll-testnet/uni-swap-v3-scroll-testnet/constants/scroll-trade-abi';
import { UniSwapV3ScrollTestnetTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/scroll-testnet/uni-swap-v3-scroll-testnet/uni-swap-v3-scroll-testnet-trade';

export class UniSwapV3ScrollTestnetProvider extends UniswapV3AlgebraAbstractProvider<UniSwapV3ScrollTestnetTrade> {
    public readonly contractAddress = '0xD9880690bd717189cC3Fbe7B9020F27fae7Ac76F';

    protected readonly contractAbi = SCROLL_UNISWAP_V3_SWAP_ROUTER_CONTRACT_ABI;

    public readonly blockchain = BLOCKCHAIN_NAME.SCROLL_TESTNET;

    public readonly OnChainTradeClass = UniSwapV3ScrollTestnetTrade;

    public readonly providerConfiguration = UNI_SWAP_V3_SCROLL_TESTNET_PROVIDER_CONFIGURATION;

    public readonly routerConfiguration = UNI_SWAP_V3_SCROLL_TESTNET_ROUTER_CONFIGURATION;

    protected readonly quoterController = new UniswapV3QuoterController(
        this.blockchain,
        this.routerConfiguration,
        '0x6E7E0d996eF50E289af9BFd93f774C566F014660',
        UNISWAP_V3_QUOTER_CONTRACT_ABI,
        '0xbf1c1FE1e9e900aFd5ba2Eb67480c44266D5eD84'
    );

    public get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.UNI_SWAP_V3;
    }

    protected createTradeInstance(
        tradeStruct: UniswapV3AlgebraTradeStructOmitPath,
        route: UniswapV3Route,
        providerAddress: string
    ): UniSwapV3ScrollTestnetTrade {
        const path = this.extractPath(route);
        return new this.OnChainTradeClass(
            {
                ...tradeStruct,
                path,
                route
            },
            providerAddress
        );
    }

    private extractPath(route: UniswapV3Route): ReadonlyArray<Token> {
        const initialPool = route.poolsPath[0];
        if (!initialPool) {
            throw new RubicSdkError('Initial pool has to be defined');
        }
        const path: Token[] = [
            compareAddresses(initialPool.token0.address, route.initialTokenAddress)
                ? initialPool.token0
                : initialPool.token1
        ];

        const lastToken = path[path.length - 1];
        if (!lastToken) {
            throw new RubicSdkError('Last token has to be defined');
        }

        route.poolsPath.forEach(pool => {
            path.push(
                !compareAddresses(pool.token0.address, lastToken.address)
                    ? pool.token0
                    : pool.token1
            );
        });

        return createTokenNativeAddressProxyInPathStartAndEnd(path, EvmWeb3Pure.nativeTokenAddress);
    }
}
