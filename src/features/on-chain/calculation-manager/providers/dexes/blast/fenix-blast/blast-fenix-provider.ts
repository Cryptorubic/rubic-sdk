import BigNumber from 'bignumber.js';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { combineOptions } from 'src/common/utils/options';
import { BLOCKCHAIN_NAME, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import {
    createTokenNativeAddressProxy,
    createTokenNativeAddressProxyInPathStartAndEnd
} from 'src/features/common/utils/token-native-address-proxy';
import { OnChainCalculationOptions } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-calculation-options';
import { OnChainProxyFeeInfo } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-proxy-fee-info';
import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { Exact } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/models/exact';
import { getGasFeeInfo } from 'src/features/on-chain/calculation-manager/providers/common/utils/get-gas-fee-info';
import { BlastFenixTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/blast/fenix-blast/blast-fenix-trade';
import { BlastFenixRoute } from 'src/features/on-chain/calculation-manager/providers/dexes/blast/fenix-blast/models/blast-fenix-route';
import { AlgebraQuoterController } from 'src/features/on-chain/calculation-manager/providers/dexes/common/algebra/algebra-quoter-controller';
import { GasPriceInfo } from 'src/features/on-chain/calculation-manager/providers/dexes/common/on-chain-provider/evm-on-chain-provider/models/gas-price-info';
import { UniswapV3AlgebraTradeStructOmitPath } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v3-algebra-abstract/models/uniswap-v3-algebra-trade-struct';
import { UniswapV3AlgebraAbstractProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v3-algebra-abstract/uniswap-v3-algebra-abstract-provider';
import { getFromToTokensAmountsByExact } from 'src/features/on-chain/calculation-manager/providers/dexes/common/utils/get-from-to-tokens-amounts-by-exact';

import { defaultBlastProviderConfiguration } from '../default-constants';
import { BLAST_FENIX_PROVIDER_CONFIGURATION } from './constants/provider-configuration';
import {
    BLAST_FENIX_ROUTER_CONTRACT_ABI,
    BLAST_FENIX_ROUTER_CONTRACT_ADDRESS
} from './constants/swap-router-contract-data';
import {
    BLAST_FENIX_QUOTER_CONTRACT_ABI,
    BLAST_FENIX_QUOTER_CONTRACT_ADDRESS
} from './utils/quoter-controller/constants/quoter-contract-data';

export class BlastFenixProvider extends UniswapV3AlgebraAbstractProvider<BlastFenixTrade> {
    protected readonly contractAddress = BLAST_FENIX_ROUTER_CONTRACT_ADDRESS;

    protected readonly contractAbi = BLAST_FENIX_ROUTER_CONTRACT_ABI;

    public readonly blockchain = BLOCKCHAIN_NAME.BLAST;

    protected readonly OnChainTradeClass = BlastFenixTrade;

    protected readonly providerConfiguration = BLAST_FENIX_PROVIDER_CONFIGURATION;

    protected readonly quoterController = new AlgebraQuoterController(
        this.blockchain,
        defaultBlastProviderConfiguration.routingProvidersAddresses,
        BLAST_FENIX_QUOTER_CONTRACT_ADDRESS,
        BLAST_FENIX_QUOTER_CONTRACT_ABI
    );

    public get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.FENIX_V3;
    }

    protected createTradeInstance(
        tradeStruct: UniswapV3AlgebraTradeStructOmitPath,
        route: BlastFenixRoute,
        providerAddress: string
    ): BlastFenixTrade {
        const path = createTokenNativeAddressProxyInPathStartAndEnd(
            route.path,
            EvmWeb3Pure.nativeTokenAddress
        );
        return new BlastFenixTrade(
            {
                ...tradeStruct,
                path,
                route
            },
            providerAddress
        );
    }

    protected async calculateDifficultTrade(
        fromToken: PriceToken<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>,
        exact: Exact,
        weiAmount: BigNumber,
        options?: OnChainCalculationOptions
    ): Promise<BlastFenixTrade> {
        const fullOptions = combineOptions({ ...options, useProxy: false }, this.defaultOptions);

        let weiAmountWithoutFee = weiAmount;
        let proxyFeeInfo: OnChainProxyFeeInfo | undefined;
        if (fullOptions.useProxy) {
            const proxyContractInfo = await this.handleProxyContract(
                new PriceTokenAmount({
                    ...fromToken.asStruct,
                    weiAmount
                }),
                fullOptions
            );
            weiAmountWithoutFee = proxyContractInfo.fromWithoutFee.weiAmount;
            proxyFeeInfo = proxyContractInfo.proxyFeeInfo;
        }

        const fromClone = createTokenNativeAddressProxy(
            fromToken,
            this.providerConfiguration.wethAddress
        );
        const toClone = createTokenNativeAddressProxy(
            toToken,
            this.providerConfiguration.wethAddress
        );

        let gasPriceInfo: GasPriceInfo | undefined;
        if (fullOptions.gasCalculation !== 'disabled') {
            try {
                gasPriceInfo = await this.getGasPriceInfo();
            } catch {}
        }

        const { route, estimatedGas } = await this.getRoute(
            fromClone,
            toClone,
            exact,
            weiAmountWithoutFee,
            fullOptions,
            gasPriceInfo?.gasPriceInUsd
        );

        const { from, to, fromWithoutFee } = getFromToTokensAmountsByExact(
            fromToken,
            toToken,
            exact,
            weiAmount,
            weiAmountWithoutFee,
            route.outputAbsoluteAmount
        );

        const tradeStruct: UniswapV3AlgebraTradeStructOmitPath = {
            from,
            to,
            gasFeeInfo: null,
            exact,
            slippageTolerance: fullOptions.slippageTolerance,
            deadlineMinutes: fullOptions.deadlineMinutes,
            useProxy: fullOptions.useProxy,
            proxyFeeInfo,
            fromWithoutFee,
            withDeflation: fullOptions.withDeflation,
            usedForCrossChain: fullOptions.usedForCrossChain
        };
        if (fullOptions.gasCalculation === 'disabled') {
            return this.createTradeInstance(
                tradeStruct,
                route as BlastFenixRoute,
                fullOptions.providerAddress
            );
        }

        const gasFeeInfo = getGasFeeInfo(estimatedGas, gasPriceInfo!);
        return this.createTradeInstance(
            {
                ...tradeStruct,
                gasFeeInfo
            },
            route as BlastFenixRoute,
            fullOptions.providerAddress
        );
    }
}
