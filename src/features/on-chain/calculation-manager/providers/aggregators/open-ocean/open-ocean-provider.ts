import BigNumber from 'bignumber.js';
import { RubicSdkError } from 'src/common/errors';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { nativeTokensList } from 'src/common/tokens/constants/native-tokens';
import pTimeout from 'src/common/utils/p-timeout';
import {
    BLOCKCHAIN_NAME,
    BlockchainName,
    EvmBlockchainName
} from 'src/core/blockchain/models/blockchain-name';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { Injector } from 'src/core/injector/injector';
import { OnChainTradeError } from 'src/features/on-chain/calculation-manager/models/on-chain-trade-error';
import { openOceanApiUrl } from 'src/features/on-chain/calculation-manager/providers/aggregators/open-ocean/constants/get-open-ocean-api-url';
import { openOceanBlockchainName } from 'src/features/on-chain/calculation-manager/providers/aggregators/open-ocean/constants/open-ocean-blockchain';
import {
    OpenoceanOnChainSupportedBlockchain,
    openoceanOnChainSupportedBlockchains
} from 'src/features/on-chain/calculation-manager/providers/aggregators/open-ocean/constants/open-ocean-on-chain-supported-blockchain';
import {
    OpenOceanQuoteRequest,
    OpenOceanQuoteResponse
} from 'src/features/on-chain/calculation-manager/providers/aggregators/open-ocean/models/open-ocean-quote-response';
import { OpenOceanTokenListResponse } from 'src/features/on-chain/calculation-manager/providers/aggregators/open-ocean/models/open-ocean-token-list-response';
import { OpenOceanTradeStruct } from 'src/features/on-chain/calculation-manager/providers/aggregators/open-ocean/models/open-ocean-trade-struct';
import { OpenOceanTrade } from 'src/features/on-chain/calculation-manager/providers/aggregators/open-ocean/open-ocean-trade';
import { RequiredOnChainCalculationOptions } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-calculation-options';
import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { GasFeeInfo } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/models/gas-fee-info';
import { OnChainTrade } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/on-chain-trade';
import { getGasFeeInfo } from 'src/features/on-chain/calculation-manager/providers/common/utils/get-gas-fee-info';
import { getGasPriceInfo } from 'src/features/on-chain/calculation-manager/providers/common/utils/get-gas-price-info';

import { AggregatorOnChainProvider } from '../../common/on-chain-aggregator/aggregator-on-chain-provider-abstract';
import { OpenOceanApiService } from '../common/open-ocean/open-ocean-api-service';
import { X_API_KEY } from './constants/api-key';
import { ARBITRUM_GAS_PRICE } from './constants/arbitrum-gas-price';

export class OpenOceanProvider extends AggregatorOnChainProvider {
    public readonly tradeType: OnChainTradeType = ON_CHAIN_TRADE_TYPE.OPEN_OCEAN;

    public static readonly nativeAddress = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';

    protected isSupportedBlockchain(blockchain: BlockchainName): boolean {
        return openoceanOnChainSupportedBlockchains.some(item => item === blockchain);
    }

    public async calculate(
        from: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>,
        options: RequiredOnChainCalculationOptions
    ): Promise<OnChainTrade | OnChainTradeError> {
        try {
            if (!this.isSupportedBlockchain(from.blockchain)) {
                throw new RubicSdkError(`Open Ocean doesn't support ${from.blockchain} chain!`);
            }

            await this.checkIsSupportedTokens(from, toToken);
            const { fromWithoutFee, proxyFeeInfo } = await this.handleProxyContract(from, options);
            const blockchain = from.blockchain as OpenoceanOnChainSupportedBlockchain;
            const gasPrice = await Injector.web3PublicService
                .getWeb3Public(blockchain)
                .getGasPrice();
            const isArbitrum = blockchain === BLOCKCHAIN_NAME.ARBITRUM;

            const quoteResponse = await pTimeout(
                this.getQuote(from, toToken, options.slippageTolerance, isArbitrum, gasPrice),
                7_000
            );

            if ([500, 400].includes(quoteResponse.code)) {
                return {
                    type: ON_CHAIN_TRADE_TYPE.OPEN_OCEAN,
                    error: new RubicSdkError(quoteResponse.error)
                };
            }

            const to = new PriceTokenAmount({
                ...toToken.asStruct,
                weiAmount: new BigNumber(quoteResponse.data.outAmount)
            });
            const toTokenWeiAmountMin = new BigNumber(quoteResponse.data.outAmount).multipliedBy(
                1 - options.slippageTolerance
            );
            const openOceanTradeStruct: OpenOceanTradeStruct = {
                from,
                to,
                gasFeeInfo: {
                    gasLimit: new BigNumber(quoteResponse.data.estimatedGas)
                },
                slippageTolerance: options.slippageTolerance!,
                path: [from, to],
                toTokenWeiAmountMin,
                useProxy: options.useProxy,
                proxyFeeInfo,
                fromWithoutFee,
                withDeflation: options.withDeflation
            };
            const gasFeeInfo =
                options.gasCalculation === 'calculate'
                    ? await this.getGasFeeInfo(openOceanTradeStruct)
                    : null;

            return new OpenOceanTrade(
                {
                    ...openOceanTradeStruct,
                    gasFeeInfo
                },
                options.providerAddress
            );
        } catch (error) {
            return {
                type: ON_CHAIN_TRADE_TYPE.OPEN_OCEAN,
                error
            };
        }
    }

    protected getTokenAddress(token: PriceToken): string {
        if (token.isNative) {
            if (token.blockchain === BLOCKCHAIN_NAME.METIS) {
                return '0xdeaddeaddeaddeaddeaddeaddeaddeaddead0000';
            }

            return OpenOceanProvider.nativeAddress;
        }
        return token.address;
    }

    protected async getGasFeeInfo(tradeStruct: OpenOceanTradeStruct): Promise<GasFeeInfo | null> {
        try {
            const gasPriceInfo = await getGasPriceInfo(tradeStruct.from.blockchain);
            const gasLimit =
                tradeStruct?.gasFeeInfo?.gasLimit ||
                (await OpenOceanTrade.getGasLimit(tradeStruct));
            return getGasFeeInfo(gasLimit, gasPriceInfo);
        } catch {
            return null;
        }
    }

    protected async getQuote(
        from: PriceTokenAmount,
        toToken: PriceToken,
        slippage: number,
        isArbitrum: boolean,
        gasPrice: string
    ): Promise<OpenOceanQuoteResponse> {
        const blockchain = from.blockchain as OpenoceanOnChainSupportedBlockchain;
        const apiUrl = openOceanApiUrl.quote(openOceanBlockchainName[blockchain]);

        const quoteRequestParams: OpenOceanQuoteRequest = {
            chain: openOceanBlockchainName[blockchain],
            inTokenAddress: this.getTokenAddress(from),
            outTokenAddress: this.getTokenAddress(toToken),
            amount: from.tokenAmount.toString(),
            slippage: slippage * 100,
            gasPrice: isArbitrum
                ? ARBITRUM_GAS_PRICE
                : Web3Pure.fromWei(gasPrice, nativeTokensList[from.blockchain].decimals)
                      .multipliedBy(10 ** 9)
                      .toString()
        };

        return OpenOceanApiService.getQuote<OpenOceanQuoteRequest, OpenOceanQuoteResponse>(
            quoteRequestParams,
            apiUrl,
            X_API_KEY
        );
    }

    private async checkIsSupportedTokens(from: PriceTokenAmount, to: PriceToken): Promise<void> {
        const apiUrl = openOceanApiUrl.tokenList(
            openOceanBlockchainName[from.blockchain as OpenoceanOnChainSupportedBlockchain]
        );

        const tokenListResponse =
            await OpenOceanApiService.getSupportedTokenList<OpenOceanTokenListResponse>(
                apiUrl,
                X_API_KEY
            );

        const tokens = tokenListResponse?.data?.map(token => token.address.toLocaleLowerCase());
        const isSupportedTokens =
            Boolean(tokens.length) &&
            (from.isNative || tokens.includes(from.address.toLocaleLowerCase())) &&
            (to.isNative || tokens.includes(to.address.toLocaleLowerCase()));

        if (!isSupportedTokens) {
            throw new RubicSdkError('Unsupported token pair');
        }
    }
}
