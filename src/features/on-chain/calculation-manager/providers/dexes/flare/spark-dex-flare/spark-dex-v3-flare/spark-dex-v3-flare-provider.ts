import { RubicSdkError } from 'src/common/errors';
import { Token } from 'src/common/tokens';
import { compareAddresses } from 'src/common/utils/blockchain';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { createTokenNativeAddressProxyInPathStartAndEnd } from 'src/features/common/utils/token-native-address-proxy';

import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from '../../../../common/models/on-chain-trade-type';
import { UniswapV3Route } from '../../../common/uniswap-v3-abstract/models/uniswap-v3-route';
import { SparkDexV3QuoterController } from '../../../common/uniswap-v3-abstract/utils/quoter-controller/spark-dex-v3-quoter-controller';
import { UniswapV3AlgebraTradeStructOmitPath } from '../../../common/uniswap-v3-algebra-abstract/models/uniswap-v3-algebra-trade-struct';
import { UniswapV3AlgebraAbstractProvider } from '../../../common/uniswap-v3-algebra-abstract/uniswap-v3-algebra-abstract-provider';
import { UNI_SWAP_V3_FLARE_PROVIDER_CONFIGURATION } from '../../enosys-flare/enosys-v3-flare/uniswap-v3-flare-configuration';
import {
    SPARK_DEX_V3_FLARE_SWAP_ROUTER_ABI,
    SPARK_DEX_V3_FLARE_SWAP_ROUTER_CONTRACT
} from './constants/spark-dex-v3-flare-contract-abi';
import {
    SPARK_DEX_V3_FLARE_QUOTER_CONTRACT_ABI,
    SPARK_DEX_V3_FLARE_QUOTER_CONTRACT_ADDRESS
} from './constants/spark-dex-v3-flare-quoter-data';
import { UNI_SWAP_V3_SPARK_DEX_FLARE_ROUTER_CONFIGURATION } from './constants/uniswap-v3-spark-dex-flare-router-config';
import { SparkDexV3FlareTrade } from './spark-dex-v3-flare-trade';

export class SparkDexV3FlareProvider extends UniswapV3AlgebraAbstractProvider<SparkDexV3FlareTrade> {
    public get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.SPARK_DEX_V3;
    }

    protected contractAddress = SPARK_DEX_V3_FLARE_SWAP_ROUTER_CONTRACT;

    protected contractAbi = SPARK_DEX_V3_FLARE_SWAP_ROUTER_ABI;

    public readonly blockchain = BLOCKCHAIN_NAME.FLARE;

    protected readonly OnChainTradeClass = SparkDexV3FlareTrade;

    protected readonly providerConfiguration = UNI_SWAP_V3_FLARE_PROVIDER_CONFIGURATION;

    protected readonly routerConfiguration = UNI_SWAP_V3_SPARK_DEX_FLARE_ROUTER_CONFIGURATION;

    protected readonly quoterController = new SparkDexV3QuoterController(
        this.blockchain,
        this.routerConfiguration,
        SPARK_DEX_V3_FLARE_QUOTER_CONTRACT_ADDRESS,
        SPARK_DEX_V3_FLARE_QUOTER_CONTRACT_ABI,
        '0xb3fB4f96175f6f9D716c17744e5A6d4BA9da8176'
    );

    protected createTradeInstance(
        tradeStruct: UniswapV3AlgebraTradeStructOmitPath,
        route: UniswapV3Route,
        providerAddress: string
    ): SparkDexV3FlareTrade {
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
