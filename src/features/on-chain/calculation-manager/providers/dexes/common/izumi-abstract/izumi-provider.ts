import { getMulticallContracts } from 'iziswap-sdk/lib/base';
import { searchPathQuery } from 'iziswap-sdk/lib/search/func';
import { SearchPathQueryParams, SwapDirection } from 'iziswap-sdk/lib/search/types';
import { NotSupportedTokensError, RubicSdkError } from 'src/common/errors';
import { PriceToken, PriceTokenAmount, Token } from 'src/common/tokens';
import { wrappedAddress } from 'src/common/tokens/constants/wrapped-addresses';
import { wrappedNativeTokensList } from 'src/common/tokens/constants/wrapped-native-tokens';
import { compareAddresses } from 'src/common/utils/blockchain';
import { combineOptions } from 'src/common/utils/options';
import { BLOCKCHAIN_NAME, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { Injector } from 'src/core/injector/injector';
import { OnChainCalculationOptions } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-calculation-options';
import { OnChainProxyFeeInfo } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-proxy-fee-info';
import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { EvmOnChainTrade } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/evm-on-chain-trade';
import { getGasFeeInfo } from 'src/features/on-chain/calculation-manager/providers/common/utils/get-gas-fee-info';
import { IzumiTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/common/izumi-abstract/izumi-trade';
import { IzumiTradeStruct } from 'src/features/on-chain/calculation-manager/providers/dexes/common/izumi-abstract/models/izumi-trade-struct';
import { evmProviderDefaultOptions } from 'src/features/on-chain/calculation-manager/providers/dexes/common/on-chain-provider/evm-on-chain-provider/constants/evm-provider-default-options';
import { EvmOnChainProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/on-chain-provider/evm-on-chain-provider/evm-on-chain-provider';
import { UniswapV2CalculationOptions } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/models/uniswap-v2-calculation-options';

export abstract class IzumiProvider extends EvmOnChainProvider {
    public abstract readonly blockchain: EvmBlockchainName;

    public get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.IZUMI;
    }

    protected readonly defaultOptions: UniswapV2CalculationOptions = {
        ...evmProviderDefaultOptions,
        deadlineMinutes: 20,
        disableMultihops: false
    };

    protected abstract readonly dexAddress: string;

    protected abstract readonly config: {
        readonly maxTransitTokens: number;
        readonly routingTokenAddresses: string[];
        readonly liquidityManagerAddress: string;
        readonly quoterAddress: string;
        readonly multicallAddress: string;
        readonly supportedFees: number[];
        readonly tokenBlackList?: {
            direction: string;
            tokenAddress: string;
        }[];
    };

    public async calculate(
        from: PriceTokenAmount<EvmBlockchainName>,
        to: PriceToken<EvmBlockchainName>,
        options?: OnChainCalculationOptions
    ): Promise<EvmOnChainTrade> {
        if (this.config?.tokenBlackList) {
            const isDisabledToken = this.config.tokenBlackList?.some(disabledToken => {
                const tokenAddress = disabledToken.direction === 'from' ? from.address : to.address;

                if (compareAddresses(tokenAddress, disabledToken.tokenAddress)) {
                    return true;
                }

                return false;
            });

            if (isDisabledToken) {
                throw new NotSupportedTokensError();
            }
        }
        const fullOptions = combineOptions(options, this.defaultOptions);

        let proxyFeeInfo: OnChainProxyFeeInfo | undefined;
        let fromWithoutFee = from;

        if (fullOptions.useProxy) {
            const proxyContractInfo = await this.handleProxyContract(
                new PriceTokenAmount({
                    ...from.asStruct,
                    weiAmount: from.weiAmount
                }),
                fullOptions
            );
            proxyFeeInfo = proxyContractInfo.proxyFeeInfo;
            fromWithoutFee = proxyContractInfo.fromWithoutFee;
        }

        const chainId = blockchainId[from.blockchain];

        const web3 = Injector.web3PublicService.getWeb3Public(from.blockchain).web3Provider;
        const multicallContract = getMulticallContracts(this.config.multicallAddress, web3);

        const transitTokens = await Token.createTokens(
            this.config.routingTokenAddresses,
            this.blockchain
        );

        const tokenIn = {
            chainId,
            symbol: from.isNative ? wrappedNativeTokensList[this.blockchain]?.symbol : from.symbol,
            address: from.isNative ? wrappedAddress[this.blockchain] : from.address,
            decimal: from.decimals
        };

        const tokenOut = {
            chainId,
            symbol: to.isNative ? wrappedNativeTokensList[this.blockchain]?.symbol : to.symbol,
            address: to.isNative ? wrappedAddress[this.blockchain] : to.address,
            decimal: to.decimals
        };

        const midTokenList = transitTokens.map(token => ({
            chainId,
            symbol: token.symbol,
            address: token.address,
            decimal: token.decimals
        }));

        const searchParams = {
            chainId,
            web3,
            multicall: multicallContract,
            tokenIn,
            tokenOut,
            liquidityManagerAddress: this.config.liquidityManagerAddress,
            quoterAddress: this.config.quoterAddress,
            poolBlackList: [],
            midTokenList,
            supportFeeContractNumbers: this.config.supportedFees,
            support001Pools: [],
            direction: SwapDirection.ExactIn,
            amount: fromWithoutFee.stringWeiAmount,
            shortBatchSize: this.blockchain === BLOCKCHAIN_NAME.MERLIN ? 5 : 20
        } as SearchPathQueryParams;

        let pathQueryResult = null;
        try {
            const result = await searchPathQuery(searchParams);
            pathQueryResult = result.pathQueryResult;
            if (!pathQueryResult) {
                throw new RubicSdkError('No result');
            }
        } catch (err) {
            console.debug(err);
            throw err;
        }

        const wrapAddress = wrappedNativeTokensList[from.blockchain]?.address;

        const toToken = new PriceTokenAmount({
            ...to.asStruct,
            tokenAmount: Web3Pure.fromWei(pathQueryResult.amount, to.decimals)
        });

        const transitPath = await Token.createTokens(
            pathQueryResult.path.tokenChain.map(token => token.address).slice(1, -1),
            from.blockchain
        );

        const tradeStruct: IzumiTradeStruct = {
            from,
            to: toToken,
            path: [from, ...transitPath, to],
            slippageTolerance: fullOptions.slippageTolerance,
            gasFeeInfo: null,
            useProxy: fullOptions.useProxy,
            proxyFeeInfo,
            fromWithoutFee,
            withDeflation: fullOptions.withDeflation,
            usedForCrossChain: fullOptions.usedForCrossChain,
            dexContractAddress: this.dexAddress,
            swapConfig: {
                tokenChain: pathQueryResult.path.tokenChain.map(el => el.address),
                feeChain: pathQueryResult.path.feeContractNumber
            },
            strictERC20Token:
                compareAddresses(wrapAddress!, from.address) ||
                compareAddresses(wrapAddress!, to.address)
        };
        if (options?.gasCalculation === 'calculate') {
            try {
                const gasPriceInfo = await this.getGasPriceInfo();
                const gasLimit = await IzumiTrade.getGasLimit(
                    tradeStruct,
                    fullOptions.providerAddress
                );
                tradeStruct.gasFeeInfo = getGasFeeInfo(gasPriceInfo, {
                    ...(gasLimit && { gasLimit })
                });
            } catch {}
        }

        return this.getProviderTrade(tradeStruct, fullOptions.providerAddress);
    }

    public getProviderTrade(tradeStruct: IzumiTradeStruct, providerAddress: string): IzumiTrade {
        return new IzumiTrade(tradeStruct, providerAddress);
    }
}
