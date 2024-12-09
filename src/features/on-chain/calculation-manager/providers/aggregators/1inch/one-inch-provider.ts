import BigNumber from 'bignumber.js';
import { RubicSdkError } from 'src/common/errors';
import { PriceToken, PriceTokenAmount, Token } from 'src/common/tokens';
import { nativeTokensList } from 'src/common/tokens/constants/native-tokens';
import { combineOptions } from 'src/common/utils/options';
import {
    BLOCKCHAIN_NAME,
    BlockchainName,
    EvmBlockchainName
} from 'src/core/blockchain/models/blockchain-name';
import { Web3PrivateSupportedBlockchain } from 'src/core/blockchain/web3-private-service/models/web-private-supported-blockchain';
import { createTokenNativeAddressProxy } from 'src/features/common/utils/token-native-address-proxy';
import { rubicProxyContractAddress } from 'src/features/cross-chain/calculation-manager/providers/common/constants/rubic-proxy-contract-address';
import { OnChainTradeError } from 'src/features/on-chain/calculation-manager/models/on-chain-trade-error';
import { oneinchArbitrumProtocols } from 'src/features/on-chain/calculation-manager/providers/aggregators/1inch/constants/arbitrum-protocols';
import { oneinchApiParams } from 'src/features/on-chain/calculation-manager/providers/aggregators/1inch/constants/constants';
import {
    OneInchSupportedBlockchains,
    oneInchSupportedBlockchains
} from 'src/features/on-chain/calculation-manager/providers/aggregators/1inch/constants/one-inch-supported-blockchains';
import { OneinchCalculationOptions } from 'src/features/on-chain/calculation-manager/providers/aggregators/1inch/models/oneinch-calculation-options';
import { OneinchQuoteRequest } from 'src/features/on-chain/calculation-manager/providers/aggregators/1inch/models/oneinch-quote-request';
import { OneinchQuoteResponse } from 'src/features/on-chain/calculation-manager/providers/aggregators/1inch/models/oneinch-quote-response';
import { OneinchSwapRequest } from 'src/features/on-chain/calculation-manager/providers/aggregators/1inch/models/oneinch-swap-request';
import { OneinchSwapResponse } from 'src/features/on-chain/calculation-manager/providers/aggregators/1inch/models/oneinch-swap-response';
import { OneinchTradeStruct } from 'src/features/on-chain/calculation-manager/providers/aggregators/1inch/models/oneinch-trade-struct';
import { OneInchApiService } from 'src/features/on-chain/calculation-manager/providers/aggregators/1inch/one-inch-api-service';
import { OneInchTrade } from 'src/features/on-chain/calculation-manager/providers/aggregators/1inch/one-inch-trade';
import { RequiredOnChainCalculationOptions } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-calculation-options';
import { ON_CHAIN_TRADE_TYPE } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { GasFeeInfo } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/models/gas-fee-info';
import { OnChainTrade } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/on-chain-trade';
import { getGasFeeInfo } from 'src/features/on-chain/calculation-manager/providers/common/utils/get-gas-fee-info';
import { getGasPriceInfo } from 'src/features/on-chain/calculation-manager/providers/common/utils/get-gas-price-info';
import { evmProviderDefaultOptions } from 'src/features/on-chain/calculation-manager/providers/dexes/common/on-chain-provider/evm-on-chain-provider/constants/evm-provider-default-options';

import { AggregatorOnChainProvider } from '../../common/on-chain-aggregator/aggregator-on-chain-provider-abstract';

export class OneInchProvider extends AggregatorOnChainProvider {
    private readonly defaultOptions: Omit<OneinchCalculationOptions, 'fromAddress'> = {
        ...evmProviderDefaultOptions,
        disableMultihops: false,
        wrappedAddress: oneinchApiParams.nativeAddress
    };

    public readonly tradeType = ON_CHAIN_TRADE_TYPE.ONE_INCH;

    public isSupportedBlockchain(blockchain: BlockchainName): boolean {
        return oneInchSupportedBlockchains.some(item => item === blockchain);
    }

    public async calculate(
        from: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>,
        options: RequiredOnChainCalculationOptions
    ): Promise<OnChainTrade | OnChainTradeError> {
        const fromBlockchain = from.blockchain as OneInchSupportedBlockchains;

        const fromAddress =
            options?.useProxy || this.defaultOptions.useProxy
                ? rubicProxyContractAddress[from.blockchain].gateway
                : this.getWalletAddress(from.blockchain as Web3PrivateSupportedBlockchain);
        const fullOptions = combineOptions(options, {
            ...this.defaultOptions,
            fromAddress
        });

        const { fromWithoutFee, proxyFeeInfo } = await this.handleProxyContract(from, fullOptions);

        const fromTokenClone = createTokenNativeAddressProxy(
            fromWithoutFee,
            oneinchApiParams.nativeAddress
        );
        const toTokenClone = createTokenNativeAddressProxy(toToken, oneinchApiParams.nativeAddress);

        const [dexContractAddress, { toTokenAmountInWei, path, data, estimatedGas }] =
            await Promise.all([
                this.loadContractAddress(fromBlockchain),
                this.getTradeInfo(fromTokenClone, toTokenClone, fromWithoutFee, fullOptions)
            ]);
        path[0] = from;
        path[path.length - 1] = toToken;

        const to = new PriceTokenAmount({
            ...toToken.asStruct,
            weiAmount: toTokenAmountInWei
        });
        const availableProtocols = this.getAvailableProtocols(fromBlockchain);

        const oneinchTradeStruct: OneinchTradeStruct = {
            dexContractAddress,
            from,
            to,
            slippageTolerance: fullOptions.slippageTolerance,
            disableMultihops: fullOptions.disableMultihops,
            path,
            gasFeeInfo: await this.getGasFeeInfo(from, estimatedGas),
            data,
            useProxy: fullOptions.useProxy,
            proxyFeeInfo,
            fromWithoutFee,
            withDeflation: fullOptions.withDeflation,
            usedForCrossChain: fullOptions.usedForCrossChain,
            availableProtocols
        };

        return new OneInchTrade(oneinchTradeStruct, fullOptions.providerAddress);
    }

    private async getTradeInfo(
        from: PriceTokenAmount,
        toToken: Token,
        fromWithoutFee: PriceTokenAmount,
        options: OneinchCalculationOptions
    ): Promise<{
        toTokenAmountInWei: BigNumber;
        estimatedGas: BigNumber;
        path: Token[];
        data: string | null;
    }> {
        const fakeAddress = '0xe388Ed184958062a2ea29B7fD049ca21244AE02e';
        const isDefaultWrappedAddress = options.wrappedAddress === oneinchApiParams.nativeAddress;
        const isNative = from.isNative || from.address === oneinchApiParams.nativeAddress;
        const fromTokenAddress =
            isNative && !isDefaultWrappedAddress ? options.wrappedAddress : from.address;
        const toTokenAddress = toToken.address;
        const availableProtocols = this.getAvailableProtocols(
            from.blockchain as OneInchSupportedBlockchains
        );
        const quoteTradeParams: OneinchQuoteRequest = {
            params: {
                src: fromTokenAddress,
                dst: toTokenAddress,
                amount: from.stringWeiAmount,
                ...(options.disableMultihops && {
                    connectorTokens: `${fromTokenAddress},${toTokenAddress}`
                }),
                ...(availableProtocols && { protocols: availableProtocols })
            }
        };

        let oneInchTrade: OneinchSwapResponse | OneinchQuoteResponse;
        let estimatedGas: BigNumber;
        let toTokenAmount: string;
        let data: string | null = null;
        let path = [] as Token[];

        try {
            if (!options.fromAddress) throw new Error('Address is not set');

            if (options.gasCalculation !== 'disabled') {
                await OneInchTrade.checkIfNeedApproveAndThrowError(
                    from,
                    toToken,
                    fromWithoutFee,
                    options.fromAddress,
                    options.useProxy
                );
            }

            const swapTradeParams: OneinchSwapRequest = {
                params: {
                    ...quoteTradeParams.params,
                    slippage: (options.slippageTolerance * 100).toString(),
                    from:
                        this.getWalletAddress(from.blockchain as Web3PrivateSupportedBlockchain) ||
                        fakeAddress,
                    disableEstimate: options.gasCalculation === 'disabled'
                }
            };
            oneInchTrade = await OneInchApiService.oneInchHttpGetRequest<OneinchSwapResponse>(
                'swap',
                from.blockchain,
                swapTradeParams
            );

            estimatedGas = new BigNumber(oneInchTrade.tx.gas);
            toTokenAmount = oneInchTrade.dstAmount;
            data = oneInchTrade.tx.data;
        } catch (_err) {
            oneInchTrade = await OneInchApiService.oneInchHttpGetRequest<OneinchQuoteResponse>(
                'quote',
                from.blockchain,
                quoteTradeParams
            );
            if (oneInchTrade.hasOwnProperty('errors') || !oneInchTrade.dstAmount) {
                throw new RubicSdkError('1inch quote error');
            }

            estimatedGas = new BigNumber(oneInchTrade.gas);
            toTokenAmount = oneInchTrade.dstAmount;
        }

        if (oneInchTrade?.protocols?.length) {
            path = await this.extractPath(from, toToken, oneInchTrade);
        }

        return { toTokenAmountInWei: new BigNumber(toTokenAmount), estimatedGas, path, data };
    }

    protected async getGasFeeInfo(
        from: PriceTokenAmount<EvmBlockchainName>,
        gasLimit: BigNumber
    ): Promise<GasFeeInfo | null> {
        try {
            const gasPriceInfo = await getGasPriceInfo(from.blockchain);

            return getGasFeeInfo(gasPriceInfo, { gasLimit });
        } catch {
            return null;
        }
    }

    private getAvailableProtocols(fromBlockchain: OneInchSupportedBlockchains): string | undefined {
        if (fromBlockchain === BLOCKCHAIN_NAME.ARBITRUM) {
            return oneinchArbitrumProtocols.join(',');
        }
        if (fromBlockchain === BLOCKCHAIN_NAME.ZK_SYNC) {
            return 'ZKSYNC_MUTE,ZKSYNC_PMMX,ZKSYNC_SPACEFI,ZKSYNC_SYNCSWAP,ZKSYNC_GEM,ZKSYNC_MAVERICK_V1';
        }
        return undefined;
    }

    /**
     * Extracts tokens path from oneInch api response.
     * @returns Promise<Token[]> Tokens array, used in the route.
     */
    private async extractPath(
        fromToken: Token,
        toToken: Token,
        oneInchTrade: OneinchSwapResponse | OneinchQuoteResponse
    ): Promise<Token[]> {
        const addressesPath = oneInchTrade.protocols[0].map(protocol => {
            if (!protocol?.[0]) {
                throw new RubicSdkError('Protocol array must not be empty');
            }
            return protocol[0].toTokenAddress;
        });
        addressesPath.pop();

        const tokensPathWithoutNative = await Token.createTokens(
            addressesPath.filter(tokenAddress => tokenAddress !== oneinchApiParams.nativeAddress),
            fromToken.blockchain
        );
        let tokensPathWithoutNativeIndex = 0;
        const tokensPath = addressesPath.map(tokenAddress => {
            if (tokenAddress === oneinchApiParams.nativeAddress) {
                return nativeTokensList[fromToken.blockchain];
            }

            const token = tokensPathWithoutNative[tokensPathWithoutNativeIndex];
            if (!token) {
                throw new RubicSdkError('Token has to be defined');
            }

            tokensPathWithoutNativeIndex++;

            return token;
        });

        return [fromToken, ...tokensPath, toToken];
    }

    private async loadContractAddress(
        fromBlockchain: OneInchSupportedBlockchains
    ): Promise<string> {
        const response = await OneInchApiService.oneInchHttpGetApproveRequest<{
            address: string;
        }>('approve/spender', fromBlockchain);
        return response.address;
    }
}
