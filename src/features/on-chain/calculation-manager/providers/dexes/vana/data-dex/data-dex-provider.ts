import { RubicSdkError } from 'src/common/errors';
import { Token } from 'src/common/tokens';
import { compareAddresses } from 'src/common/utils/blockchain';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { createTokenNativeAddressProxyInPathStartAndEnd } from 'src/features/common/utils/token-native-address-proxy';

import { ON_CHAIN_TRADE_TYPE, OnChainTradeType } from '../../../common/models/on-chain-trade-type';
import { UNISWAP_V3_SWAP_ROUTER_CONTRACT_ABI } from '../../common/uniswap-v3-abstract/constants/swap-router-contract-abi';
import { UniswapV3Route } from '../../common/uniswap-v3-abstract/models/uniswap-v3-route';
import { SparkDexV3QuoterController } from '../../common/uniswap-v3-abstract/utils/quoter-controller/spark-dex-v3-quoter-controller';
import { UniswapV3AlgebraTradeStructOmitPath } from '../../common/uniswap-v3-algebra-abstract/models/uniswap-v3-algebra-trade-struct';
import { UniswapV3AlgebraAbstractProvider } from '../../common/uniswap-v3-algebra-abstract/uniswap-v3-algebra-abstract-provider';
import { SPARK_DEX_V3_FLARE_QUOTER_CONTRACT_ABI } from '../../flare/spark-dex-flare/spark-dex-v3-flare/constants/spark-dex-v3-flare-quoter-data';
import {
    DATA_DEX_FACTORY_CRONTRACT_ADDRESS,
    DATA_DEX_PROVIDER_CONFIGURATION,
    DATA_DEX_QUOTER_CONTRACT_ADDRESS,
    DATA_DEX_ROUTER_CONTRACT_ABI,
    DATA_DEX_ROUTER_CONTRACT_ADDRESS
} from './constants/provider-config';
import { DATA_DEX_ROUTER_CONFIGURATION } from './constants/router-config';
import { DataDexTrade } from './data-dex-trade';

export class DataDexProvider extends UniswapV3AlgebraAbstractProvider<DataDexTrade> {
    public get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.DATA_DEX;
    }

    public readonly blockchain = BLOCKCHAIN_NAME.VANA;

    protected readonly contractAbi = DATA_DEX_ROUTER_CONTRACT_ABI;

    protected readonly OnChainTradeClass = DataDexTrade;

    protected contractAddress = DATA_DEX_ROUTER_CONTRACT_ADDRESS;

    protected readonly providerConfiguration = DATA_DEX_PROVIDER_CONFIGURATION;

    protected readonly routerConfiguration = DATA_DEX_ROUTER_CONFIGURATION;

    protected readonly quoterController = new SparkDexV3QuoterController(
        this.blockchain,
        this.routerConfiguration,
        DATA_DEX_QUOTER_CONTRACT_ADDRESS,
        SPARK_DEX_V3_FLARE_QUOTER_CONTRACT_ABI,
        DATA_DEX_FACTORY_CRONTRACT_ADDRESS
    );

    protected createTradeInstance(
        tradeStruct: UniswapV3AlgebraTradeStructOmitPath,
        route: UniswapV3Route,
        providerAddress: string
    ): DataDexTrade {
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
