import BigNumber from 'bignumber.js';
import { RubicSdkError } from 'src/common/errors';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { BlockchainName, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { FAKE_WALLET_ADDRESS } from 'src/features/common/constants/fake-wallet-address';

import { OnChainTradeError } from '../../../models/on-chain-trade-error';
import { RequiredOnChainCalculationOptions } from '../../common/models/on-chain-calculation-options';
import { ON_CHAIN_TRADE_TYPE } from '../../common/models/on-chain-trade-type';
import { AggregatorOnChainProvider } from '../../common/on-chain-aggregator/aggregator-on-chain-provider-abstract';
import { GasFeeInfo } from '../../common/on-chain-trade/evm-on-chain-trade/models/gas-fee-info';
import { OnChainTrade } from '../../common/on-chain-trade/on-chain-trade';
import { getGasFeeInfo } from '../../common/utils/get-gas-fee-info';
import { getGasPriceInfo } from '../../common/utils/get-gas-price-info';
import {
    GetBestRouteReturnType,
    OkuQuoteRequestBody,
    OkuQuoteResponse
} from './models/okuswap-api-types';
import { OKUSWAP_BLOCKCHAINS } from './models/okuswap-chain-names';
import {
    OKUSWAP_ON_CHAIN_SUPPORTED_BLOCKCHAINS,
    OkuSwapSupportedBlockchain
} from './models/okuswap-on-chain-supported-chains';
import { OkuSwapOnChainTradeStruct } from './models/okuswap-trade-types';
import { OkuSwapOnChainTrade } from './okuswap-on-chain-trade';
import { OkuSwapApiService } from './services/okuswap-api-service';

export class OkuSwapOnChainProvider extends AggregatorOnChainProvider {
    public readonly tradeType = ON_CHAIN_TRADE_TYPE.OKU_SWAP;

    public isSupportedBlockchain(blockchain: BlockchainName): boolean {
        return OKUSWAP_ON_CHAIN_SUPPORTED_BLOCKCHAINS.some(chain => chain === blockchain);
    }

    public async calculate(
        from: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>,
        options: RequiredOnChainCalculationOptions
    ): Promise<OnChainTrade | OnChainTradeError> {
        const fullOptions = { ...options, useProxy: false };

        if (!this.isSupportedBlockchain(from.blockchain)) {
            throw new RubicSdkError(`OkuSwap doesn't support ${from.blockchain} chain!`);
        }

        const fromBlockchain = from.blockchain as OkuSwapSupportedBlockchain;
        const walletAddress =
            fullOptions.fromAddress || this.getWalletAddress(fromBlockchain) || FAKE_WALLET_ADDRESS;

        try {
            const { fromWithoutFee, proxyFeeInfo } = await this.handleProxyContract(
                from,
                fullOptions
            );
            const path = this.getRoutePath(from, toToken);

            const subProviders = await OkuSwapApiService.getOkuSubProvidersForChain(
                from.blockchain
            );
            const quoteReqBody = {
                account: walletAddress,
                chain: OKUSWAP_BLOCKCHAINS[fromBlockchain],
                inTokenAddress: from.address,
                outTokenAddress: toToken.address,
                isExactIn: true,
                slippage: fullOptions.slippageTolerance * 10_000,
                inTokenAmount: fromWithoutFee.tokenAmount.toFixed()
            } as OkuQuoteRequestBody;

            const { subProvider, swapReqBody, toAmount, gas } = await this.getBestRoute(
                subProviders,
                quoteReqBody
            );

            const providerGateway = swapReqBody.coupon.raw.universalRouter;
            const permit2Address = swapReqBody.signingRequest?.permit2Address;

            const to = new PriceTokenAmount({
                ...toToken.asStruct,
                weiAmount: new BigNumber(Web3Pure.toWei(toAmount, toToken.decimals))
            });

            const tradeStruct: OkuSwapOnChainTradeStruct = {
                from,
                to,
                fromWithoutFee,
                proxyFeeInfo,
                gasFeeInfo: await this.getGasFeeInfo(from, gas),
                slippageTolerance: fullOptions.slippageTolerance,
                useProxy: fullOptions.useProxy,
                withDeflation: fullOptions.withDeflation,
                path,
                quoteReqBody,
                swapReqBody,
                subProvider,
                ...(permit2Address && { permit2ApproveAddress: permit2Address })
            };

            return new OkuSwapOnChainTrade(
                tradeStruct,
                fullOptions.providerAddress,
                providerGateway
            );
        } catch (err) {
            return {
                type: ON_CHAIN_TRADE_TYPE.OKU_SWAP,
                error: err
            };
        }
    }

    private async getBestRoute(
        subProviders: string[],
        body: OkuQuoteRequestBody
    ): Promise<GetBestRouteReturnType> {
        const promises = subProviders.map(p => OkuSwapApiService.makeQuoteRequest(p, body));
        const routes = await Promise.all(promises);
        const [bestRoute] = routes.sort((a, b) =>
            new BigNumber(b.outAmount).minus(a.outAmount).toNumber()
        ) as OkuQuoteResponse[];

        if (!bestRoute) {
            throw new RubicSdkError('[OKU_SWAP_PROVIDER] No route available!');
        }

        return {
            subProvider: bestRoute.market,
            swapReqBody: {
                coupon: bestRoute.coupon,
                signingRequest: bestRoute?.signingRequest
            },
            toAmount: bestRoute.outAmount,
            gas: bestRoute.estimatedGas
        };
    }

    protected async getGasFeeInfo(
        from: PriceTokenAmount<EvmBlockchainName>,
        gasLimit: string
    ): Promise<GasFeeInfo | null> {
        try {
            const gasPriceInfo = await getGasPriceInfo(from.blockchain);

            return getGasFeeInfo(gasPriceInfo, { gasLimit: new BigNumber(gasLimit) });
        } catch {
            return null;
        }
    }
}
