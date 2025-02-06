import { RubicSdkError } from 'src/common/errors';
import { Token } from 'src/common/tokens';
import { compareAddresses } from 'src/common/utils/blockchain';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { createTokenNativeAddressProxyInPathStartAndEnd } from 'src/features/common/utils/token-native-address-proxy';

import { ON_CHAIN_TRADE_TYPE, OnChainTradeType } from '../../../common/models/on-chain-trade-type';
import { UNISWAP_V3_SWAP_ROUTER_CONTRACT_ABI } from '../../common/uniswap-v3-abstract/constants/swap-router-contract-abi';
import { UniswapV3Route } from '../../common/uniswap-v3-abstract/models/uniswap-v3-route';
import { UNISWAP_V3_QUOTER_CONTRACT_ABI } from '../../common/uniswap-v3-abstract/utils/quoter-controller/constants/quoter-contract-data';
import { UniswapV3QuoterController } from '../../common/uniswap-v3-abstract/utils/quoter-controller/uniswap-v3-quoter-controller';
import { UniswapV3AlgebraTradeStructOmitPath } from '../../common/uniswap-v3-algebra-abstract/models/uniswap-v3-algebra-trade-struct';
import { UniswapV3AlgebraAbstractProvider } from '../../common/uniswap-v3-algebra-abstract/uniswap-v3-algebra-abstract-provider';
import {
    KODIAK_V3_PROVIDER_CONFIGURATION,
    KODIAK_V3_ROUTER_CONTRACT_ADDRESS
} from './constants/provider-config';
import { KODIAK_V3_ROUTER_CONFIGURATION } from './constants/router-config';
import { KodiakV3Trade } from './kodiak-v3-trade';

export class KodiakV3Provider extends UniswapV3AlgebraAbstractProvider<KodiakV3Trade> {
    public get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.KODIAK;
    }

    public readonly blockchain = BLOCKCHAIN_NAME.BERACHAIN;

    protected readonly contractAbi = UNISWAP_V3_SWAP_ROUTER_CONTRACT_ABI;

    protected readonly OnChainTradeClass = KodiakV3Trade;

    protected contractAddress = KODIAK_V3_ROUTER_CONTRACT_ADDRESS;

    protected readonly providerConfiguration = KODIAK_V3_PROVIDER_CONFIGURATION;

    protected readonly routerConfiguration = KODIAK_V3_ROUTER_CONFIGURATION;

    protected readonly quoterController = new UniswapV3QuoterController(
        this.blockchain,
        this.routerConfiguration,
        '0x644C8D6E501f7C994B74F5ceA96abe65d0BA662B',
        UNISWAP_V3_QUOTER_CONTRACT_ABI,
        '0xD84CBf0B02636E7f53dB9E5e45A616E05d710990'
    );

    protected createTradeInstance(
        tradeStruct: UniswapV3AlgebraTradeStructOmitPath,
        route: UniswapV3Route,
        providerAddress: string
    ): KodiakV3Trade {
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
