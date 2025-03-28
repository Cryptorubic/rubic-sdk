import { RubicSdkError } from 'src/common/errors';
import { Token } from 'src/common/tokens';
import { compareAddresses } from 'src/common/utils/blockchain';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { createTokenNativeAddressProxyInPathStartAndEnd } from 'src/features/common/utils/token-native-address-proxy';

import { ON_CHAIN_TRADE_TYPE, OnChainTradeType } from '../../../common/models/on-chain-trade-type';
import { BrontoFinanceQuoterController } from '../../common/uniswap-v3-abstract/bronto-finance-quoter-controller';
import { UNISWAP_V3_SWAP_ROUTER_CONTRACT_ABI } from '../../common/uniswap-v3-abstract/constants/swap-router-contract-abi';
import { UniswapV3Route } from '../../common/uniswap-v3-abstract/models/uniswap-v3-route';
import { UniswapV3AlgebraTradeStructOmitPath } from '../../common/uniswap-v3-algebra-abstract/models/uniswap-v3-algebra-trade-struct';
import { UniswapV3AlgebraAbstractProvider } from '../../common/uniswap-v3-algebra-abstract/uniswap-v3-algebra-abstract-provider';
import { BrontoFinanceTrade } from './bronto-finance-trade';
import {
    BRONTO_FINANCE_QUOTER_CONTRACT_ABI,
    BRONTO_FINANCE_QUOTER_CONTRACT_ADDRESS
} from './constants/bronto-finance-quoter-data';
import {
    MEGAETH_TESTNET_PROVIDER_CONFIGURATION,
    MEGAETH_TESTNET_ROUTER_CONTRACT_ADDRESS
} from './constants/provider-config';
import { MEGAETH_TESTNET_ROUTER_CONFIGURATION } from './constants/router-config';

export class BrontoFinanceProvider extends UniswapV3AlgebraAbstractProvider<BrontoFinanceTrade> {
    public get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.BRONTO_FINANCE;
    }

    public readonly blockchain = BLOCKCHAIN_NAME.MEGAETH_TESTNET;

    protected readonly contractAbi = UNISWAP_V3_SWAP_ROUTER_CONTRACT_ABI;

    protected readonly OnChainTradeClass = BrontoFinanceTrade;

    protected contractAddress = MEGAETH_TESTNET_ROUTER_CONTRACT_ADDRESS;

    protected readonly providerConfiguration = MEGAETH_TESTNET_PROVIDER_CONFIGURATION;

    protected readonly routerConfiguration = MEGAETH_TESTNET_ROUTER_CONFIGURATION;

    protected readonly quoterController = new BrontoFinanceQuoterController(
        this.blockchain,
        this.routerConfiguration,
        BRONTO_FINANCE_QUOTER_CONTRACT_ADDRESS,
        BRONTO_FINANCE_QUOTER_CONTRACT_ABI,
        '0x2E2E73885A21E654172fB8A0D50F5E7729E74F3c'
    );

    protected createTradeInstance(
        tradeStruct: UniswapV3AlgebraTradeStructOmitPath,
        route: UniswapV3Route,
        providerAddress: string
    ): BrontoFinanceTrade {
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
