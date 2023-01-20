import BigNumber from 'bignumber.js';
import { RubicSdkError } from 'src/common/errors';
import { OnChainIsUnavailableError } from 'src/common/errors/on-chain';
import { nativeTokensList, PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { BlockchainName, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { Injector } from 'src/core/injector/injector';
import { getFromWithoutFee } from 'src/features/common/utils/get-from-without-fee';
import { OnChainTradeError } from 'src/features/on-chain/calculation-manager/models/on-chain-trade-error';
import { RequiredOnChainCalculationOptions } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-calculation-options';
import { OnChainProxyFeeInfo } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-proxy-fee-info';
import { ON_CHAIN_TRADE_TYPE } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { OnChainProxyService } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-proxy-service/on-chain-proxy-service';
import { GasFeeInfo } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/models/gas-fee-info';
import { OnChainTrade } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/on-chain-trade';
import { getGasFeeInfo } from 'src/features/on-chain/calculation-manager/providers/common/utils/get-gas-fee-info';
import { getGasPriceInfo } from 'src/features/on-chain/calculation-manager/providers/common/utils/get-gas-price-info';
import { openOceanApiUrl } from 'src/features/on-chain/calculation-manager/providers/open-ocean/constants/get-open-ocean-api-url';
import { openOceanBlockchainName } from 'src/features/on-chain/calculation-manager/providers/open-ocean/constants/open-ocean-blockchain';
import {
    OpenoceanOnChainSupportedBlockchain,
    openoceanOnChainSupportedBlockchains
} from 'src/features/on-chain/calculation-manager/providers/open-ocean/constants/open-ocean-on-chain-supported-blockchain';
import { OpenOceanQuoteResponse } from 'src/features/on-chain/calculation-manager/providers/open-ocean/models/open-ocean-quote-response';
import { OpenOceanTokenListResponse } from 'src/features/on-chain/calculation-manager/providers/open-ocean/models/open-ocean-token-list-response';
import { OpenOceanTradeStruct } from 'src/features/on-chain/calculation-manager/providers/open-ocean/models/open-ocean-trade-struct';
import { OpenOceanTrade } from 'src/features/on-chain/calculation-manager/providers/open-ocean/open-ocean-trade';

export class OpenOceanProvider {
    private readonly onChainProxyService = new OnChainProxyService();

    constructor() {}

    public async calculate(
        from: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceToken<EvmBlockchainName>,
        options: RequiredOnChainCalculationOptions
    ): Promise<OnChainTrade | OnChainTradeError> {
        try {
            this.checkIsSupportedBlockchain(from.blockchain);
            await this.checkIsSupportedTokens(from, toToken);
            const { fromWithoutFee, proxyFeeInfo } = await this.handleProxyContract(from, options);
            const blockchain = from.blockchain as OpenoceanOnChainSupportedBlockchain;
            const gasPrice = await Injector.web3PublicService
                .getWeb3Public(blockchain)
                .getGasPrice();
            const apiUrl = openOceanApiUrl.quote(openOceanBlockchainName[blockchain]);
            const quoteResponse = await Injector.httpClient.get<OpenOceanQuoteResponse>(apiUrl, {
                params: {
                    chain: openOceanBlockchainName[blockchain],
                    inTokenAddress: fromWithoutFee.address,
                    outTokenAddress: toToken.address,
                    amount: fromWithoutFee.tokenAmount.toString() as unknown as number,
                    slippage: options.slippageTolerance! * 100,
                    gasPrice: Web3Pure.fromWei(gasPrice, nativeTokensList[from.blockchain].decimals)
                        .multipliedBy(10 ** 9)
                        .toFixed(0)
                }
            });

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
            const openOceanTradeStruct = {
                from,
                to,
                gasFeeInfo: null,
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

    private async checkContractState(fromBlockchain: EvmBlockchainName): Promise<void | never> {
        const isPaused = await this.onChainProxyService.isContractPaused(fromBlockchain);
        if (isPaused) {
            throw new OnChainIsUnavailableError();
        }
    }

    protected async handleProxyContract(
        from: PriceTokenAmount<EvmBlockchainName>,
        fullOptions: RequiredOnChainCalculationOptions
    ): Promise<{
        fromWithoutFee: PriceTokenAmount<EvmBlockchainName>;
        proxyFeeInfo: OnChainProxyFeeInfo | undefined;
    }> {
        let fromWithoutFee: PriceTokenAmount<EvmBlockchainName>;
        let proxyFeeInfo: OnChainProxyFeeInfo | undefined;
        if (fullOptions.useProxy) {
            await this.checkContractState(from.blockchain);

            proxyFeeInfo = await this.onChainProxyService.getFeeInfo(
                from,
                fullOptions.providerAddress
            );
            fromWithoutFee = getFromWithoutFee(from, proxyFeeInfo.platformFee.percent);
        } else {
            fromWithoutFee = from;
        }
        return {
            fromWithoutFee,
            proxyFeeInfo
        };
    }

    private async getGasFeeInfo(tradeStruct: OpenOceanTradeStruct): Promise<GasFeeInfo | null> {
        try {
            const gasPriceInfo = await getGasPriceInfo(tradeStruct.from.blockchain);
            const gasLimit = await OpenOceanTrade.getGasLimit(tradeStruct);
            return getGasFeeInfo(gasLimit, gasPriceInfo);
        } catch {
            return null;
        }
    }

    private checkIsSupportedBlockchain(blockchain: BlockchainName): void {
        if (!openoceanOnChainSupportedBlockchains.some(item => item === blockchain)) {
            throw new RubicSdkError('Unsupported blockchain');
        }
    }

    private async checkIsSupportedTokens(from: PriceTokenAmount, to: PriceToken): Promise<void> {
        const apiUrl = openOceanApiUrl.tokenList(
            openOceanBlockchainName[from.blockchain as OpenoceanOnChainSupportedBlockchain]
        );
        const tokenListResponse = await Injector.httpClient.get<OpenOceanTokenListResponse>(apiUrl);
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
