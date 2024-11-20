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
import {
    ENOSYS_V3_FLARE_QUOTER_CONTRACT_ABI,
    ENOSYS_V3_FLARE_QUOTER_CONTRACT_ADDRESS
} from './constants/enosys-v3-flare-quoter-data';
import { UNI_SWAP_V3_ENOSYS_FLARE_ROUTER_CONFIGURATION } from './constants/enosys-v3-flare-router-configuration';
import {
    ENOSYS_V3_SWAP_ROUTER_CONTRACT_ABI,
    ENOSYS_V3_SWAP_ROUTER_CONTRACT_ADDRESS
} from './constants/enosys-v3-flare-swap-router-data';
import { EnosysV3FlareTrade } from './enosys-v3-flare-trade';
import { UNI_SWAP_V3_FLARE_PROVIDER_CONFIGURATION } from './uniswap-v3-flare-configuration';

export class EnosysV3FlareProvider extends UniswapV3AlgebraAbstractProvider<EnosysV3FlareTrade> {
    public get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.ENOSYS_V3;
    }

    public readonly blockchain = BLOCKCHAIN_NAME.FLARE;

    protected contractAbi = ENOSYS_V3_SWAP_ROUTER_CONTRACT_ABI;

    protected contractAddress = ENOSYS_V3_SWAP_ROUTER_CONTRACT_ADDRESS;

    protected readonly OnChainTradeClass = EnosysV3FlareTrade;

    protected readonly providerConfiguration = UNI_SWAP_V3_FLARE_PROVIDER_CONFIGURATION;

    protected readonly routerConfiguration = UNI_SWAP_V3_ENOSYS_FLARE_ROUTER_CONFIGURATION;

    protected readonly quoterController = new SparkDexV3QuoterController(
        this.blockchain,
        this.routerConfiguration,
        ENOSYS_V3_FLARE_QUOTER_CONTRACT_ADDRESS,
        ENOSYS_V3_FLARE_QUOTER_CONTRACT_ABI,
        '0x9F070ebDf1D9f0bFA8e2F0209E7Bcc32487c98A6'
    );

    protected createTradeInstance(
        tradeStruct: UniswapV3AlgebraTradeStructOmitPath,
        route: UniswapV3Route,
        providerAddress: string
    ): EnosysV3FlareTrade {
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
