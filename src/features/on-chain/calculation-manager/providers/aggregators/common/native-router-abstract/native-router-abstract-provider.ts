import { RubicSdkError } from 'src/common/errors';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { BlockchainName, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { OnChainTradeError } from 'src/features/on-chain/calculation-manager/models/on-chain-trade-error';

import { RequiredOnChainCalculationOptions } from '../../../common/models/on-chain-calculation-options';
import { OnChainTradeType } from '../../../common/models/on-chain-trade-type';
import { AggregatorOnChainProvider } from '../../../common/on-chain-aggregator/aggregator-on-chain-provider-abstract';
import { GasFeeInfo } from '../../../common/on-chain-trade/evm-on-chain-trade/models/gas-fee-info';
import { OnChainTrade } from '../../../common/on-chain-trade/on-chain-trade';
import { getGasFeeInfo } from '../../../common/utils/get-gas-fee-info';
import { getGasPriceInfo } from '../../../common/utils/get-gas-price-info';
import { evmProviderDefaultOptions } from '../../../dexes/common/on-chain-provider/evm-on-chain-provider/constants/evm-provider-default-options';
import { nativeRouterAbstractSupportedBlockchains } from './constants/native-router-abstract-supported-blockchains';
import { NativeRouterQuoteRequestParams } from './models/native-router-quote';
import { NativeRouterTradeStruct } from './models/native-router-trade-struct';
import { NativeRouterAbstractTrade } from './native-router-abstract-trade';
import { NativeRouterApiService } from './services/native-router-api-service';

export class NativeRouterAbstractProvider extends AggregatorOnChainProvider {
    public readonly tradeType: OnChainTradeType;

    private readonly defaultOptions: RequiredOnChainCalculationOptions = {
        ...evmProviderDefaultOptions
    };

    protected isSupportedBlockchain(blockchain: BlockchainName): boolean {
        if (blockchain) {
            return true;
        }
        return false;
    }

    constructor(tradeType: OnChainTradeType) {
        super();
        this.tradeType = tradeType;
    }

    public async calculate(
        from: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>,
        options: RequiredOnChainCalculationOptions
    ): Promise<OnChainTrade | OnChainTradeError> {
        const fromChainId = blockchainId[from.blockchain];
        const toChainId = blockchainId[toToken.blockchain];
        if (fromChainId !== toChainId) {
            throw new RubicSdkError();
        }
        try {
            const { fromWithoutFee, proxyFeeInfo } = await this.handleProxyContract(from, options);
            const fromAddress = this.getWalletAddress(from.blockchain);
            const chain = (await this.getBlockchainById(fromChainId)) as string;
            const path = this.getRoutePath(from, toToken);

            const nativeRouterQuoteParams: NativeRouterQuoteRequestParams = {
                srcChain: chain,
                dstChain: chain,
                tokenIn: from.address,
                tokenOut: toToken.address,
                amount: fromWithoutFee.tokenAmount.toString(),
                fromAddress: fromAddress,
                slippage: this.defaultOptions.slippageTolerance
            };
            const { amountOut, txRequest } = await NativeRouterApiService.getFirmQuote(
                nativeRouterQuoteParams
            );
            const providerGateway = txRequest.target;
            const to = new PriceTokenAmount({
                ...toToken.asStruct,
                tokenAmount: Web3Pure.fromWei(amountOut, toToken.decimals)
            });
            const nativeRouterTradeStruct: NativeRouterTradeStruct = {
                from,
                to,
                slippageTolerance: this.defaultOptions.slippageTolerance,
                path,
                gasFeeInfo: null,
                useProxy: this.defaultOptions.useProxy,
                proxyFeeInfo,
                fromWithoutFee,
                withDeflation: this.defaultOptions.withDeflation,
                usedForCrossChain: this.defaultOptions.usedForCrossChain,
                txRequest
            };
            const gasFeeInfo =
                options.gasCalculation === 'calculate'
                    ? await this.getGasFeeInfo(nativeRouterTradeStruct, providerGateway)
                    : null;
            return new NativeRouterAbstractTrade(
                {
                    ...nativeRouterTradeStruct,
                    gasFeeInfo
                },
                options.providerAddress,
                nativeRouterQuoteParams,
                providerGateway
            );
        } catch (err) {
            return {
                type: this.tradeType,
                error: err
            };
        }
    }

    protected async getGasFeeInfo(
        tradeStruct: NativeRouterTradeStruct,
        providerGateway: string
    ): Promise<GasFeeInfo | null> {
        try {
            const gasPriceInfo = await getGasPriceInfo(tradeStruct.from.blockchain);
            const gasLimit = await NativeRouterAbstractTrade.getGasLimit(
                tradeStruct,
                providerGateway
            );
            return getGasFeeInfo(gasLimit, gasPriceInfo);
        } catch {
            return null;
        }
    }

    public getBlockchainById(blockchainId: number): string | undefined {
        return nativeRouterAbstractSupportedBlockchains.filter(
            chain => chain.chainId === blockchainId
        )[0]?.chain;
    }
}
