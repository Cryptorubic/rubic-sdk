import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { OnChainTradeError } from 'src/features/on-chain/calculation-manager/models/on-chain-trade-error';

import { RequiredOnChainCalculationOptions } from '../../../common/models/on-chain-calculation-options';
import { AggregatorOnChainProvider } from '../../../common/on-chain-aggregator/aggregator-on-chain-provider-abstract';
import {
    AllSupportedNetworks,
    blockchainNameMapping
} from './constants/native-router-abstract-supported-blockchains';
import { NativeRouterQuoteRequestParams } from './models/native-router-quote';
import {
    NativeRouterTradeInstance,
    NativeRouterTradeStruct
} from './models/native-router-trade-struct';
import { NativeRouterAbstractTrade } from './native-router-abstract-trade';
import { NativeRouterApiService } from './services/native-router-api-service';

export abstract class NativeRouterAbstractProvider<
    T extends NativeRouterAbstractTrade = NativeRouterAbstractTrade
> extends AggregatorOnChainProvider {
    private readonly nativeTokenAddress = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';

    protected abstract createNativeRouterTradeInstance(tradeInstance: NativeRouterTradeInstance): T;

    public async calculate(
        from: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>,
        options: RequiredOnChainCalculationOptions
    ): Promise<T | OnChainTradeError> {
        try {
            const fakeAddress = '0xe388Ed184958062a2ea29B7fD049ca21244AE02e';
            const { fromWithoutFee, proxyFeeInfo } = await this.handleProxyContract(from, options);
            const fromAddress = this.getWalletAddress(from.blockchain) || fakeAddress;
            const fromChain = this.getBlockchainById(from.blockchain);
            const toChain = this.getBlockchainById(toToken.blockchain);
            const path = this.getRoutePath(from, toToken);
            const fromTokenAddress = from.isNative ? this.nativeTokenAddress : from.address;
            const toTokenAddress = toToken.isNative ? this.nativeTokenAddress : toToken.address;

            const nativeRouterQuoteParams: NativeRouterQuoteRequestParams = {
                src_chain: fromChain,
                dst_chain: toChain,
                token_out: toTokenAddress,
                token_in: fromTokenAddress,
                amount: fromWithoutFee.tokenAmount.toString(),
                from_address: fromAddress,
                slippage: options.slippageTolerance * 100
            };
            const { amountOut, txRequest } = await NativeRouterApiService.getFirmQuote(
                nativeRouterQuoteParams
            );
            const providerGateway = txRequest.target;
            const to = new PriceTokenAmount({
                ...toToken.asStruct,
                tokenAmount: Web3Pure.fromWei(amountOut, toToken.decimals)
            });
            const tradeStruct: NativeRouterTradeStruct = {
                from,
                to,
                slippageTolerance: options.slippageTolerance,
                path,
                gasFeeInfo: await this.getGasFeeInfo(),
                useProxy: options.useProxy,
                proxyFeeInfo,
                fromWithoutFee,
                withDeflation: options.withDeflation,
                usedForCrossChain: options.usedForCrossChain,
                txRequest
            };

            const tradeInstance: NativeRouterTradeInstance = {
                tradeStruct,
                providerAddress: options.providerAddress,
                nativeRouterQuoteParams,
                providerGateway
            };
            return this.createNativeRouterTradeInstance(tradeInstance);
        } catch (err) {
            return {
                type: this.tradeType,
                error: err
            };
        }
    }

    public getBlockchainById(blockchain: string): string {
        return blockchainNameMapping[blockchain as AllSupportedNetworks];
    }
}
