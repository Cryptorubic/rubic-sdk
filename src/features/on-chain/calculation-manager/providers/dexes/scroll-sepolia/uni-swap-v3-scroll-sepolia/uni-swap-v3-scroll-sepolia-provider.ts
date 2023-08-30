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
import { UNI_SWAP_V3_SCROLL_SEPOLIA_PROVIDER_CONFIGURATION } from 'src/features/on-chain/calculation-manager/providers/dexes/scroll-sepolia/uni-swap-v3-scroll-sepolia/constants/provider-configuration';
import { UNI_SWAP_V3_SCROLL_SEPOLIA_ROUTER_CONFIGURATION } from 'src/features/on-chain/calculation-manager/providers/dexes/scroll-sepolia/uni-swap-v3-scroll-sepolia/constants/router-configuration';
import { SCROLL_UNISWAP_V3_SWAP_ROUTER_CONTRACT_ABI } from 'src/features/on-chain/calculation-manager/providers/dexes/scroll-sepolia/uni-swap-v3-scroll-sepolia/constants/scroll-trade-abi';
import { UniSwapV3ScrollSepoliaTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/scroll-sepolia/uni-swap-v3-scroll-sepolia/uni-swap-v3-scroll-sepolia-trade';

export class UniSwapV3ScrollSepoliaProvider extends UniswapV3AlgebraAbstractProvider<UniSwapV3ScrollSepoliaTrade> {
    public readonly contractAddress = '0x17AFD0263D6909Ba1F9a8EAC697f76532365Fb95';

    protected readonly contractAbi = SCROLL_UNISWAP_V3_SWAP_ROUTER_CONTRACT_ABI;

    public readonly blockchain = BLOCKCHAIN_NAME.SCROLL_SEPOLIA;

    public readonly OnChainTradeClass = UniSwapV3ScrollSepoliaTrade;

    public readonly providerConfiguration = UNI_SWAP_V3_SCROLL_SEPOLIA_PROVIDER_CONFIGURATION;

    public readonly routerConfiguration = UNI_SWAP_V3_SCROLL_SEPOLIA_ROUTER_CONFIGURATION;

    protected readonly quoterController = new UniswapV3QuoterController(
        this.blockchain,
        this.routerConfiguration,
        '0xd5dd33650Ef1DC6D23069aEDC8EAE87b0D3619B2',
        UNISWAP_V3_QUOTER_CONTRACT_ABI,
        '0xB856587fe1cbA8600F75F1b1176E44250B11C788'
    );

    public get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.UNI_SWAP_V3;
    }

    protected createTradeInstance(
        tradeStruct: UniswapV3AlgebraTradeStructOmitPath,
        route: UniswapV3Route,
        providerAddress: string
    ): UniSwapV3ScrollSepoliaTrade {
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
