import BigNumber from 'bignumber.js';
import {
    LowSlippageDeflationaryTokenError,
    NotWhitelistedProviderError,
    RubicSdkError,
    SwapRequestError
} from 'src/common/errors';
import { PriceToken } from 'src/common/tokens';
import { nativeTokensList } from 'src/common/tokens/constants/native-tokens';
import { PriceTokenAmount } from 'src/common/tokens/price-token-amount';
import { parseError } from 'src/common/utils/errors';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { CHAIN_TYPE } from 'src/core/blockchain/models/chain-type';
import { EvmWeb3Private } from 'src/core/blockchain/web3-private-service/web3-private/evm-web3-private/evm-web3-private';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { Injector } from 'src/core/injector/injector';
import { EncodeTransactionOptions } from 'src/features/common/models/encode-transaction-options';
import { checkUnsupportedReceiverAddress } from 'src/features/common/utils/check-unsupported-receiver-address';
import { rubicProxyContractAddress } from 'src/features/cross-chain/calculation-manager/providers/common/constants/rubic-proxy-contract-address';
import { GetContractParamsOptions } from 'src/features/cross-chain/calculation-manager/providers/common/models/get-contract-params-options';
import { ProxyCrossChainEvmTrade } from 'src/features/cross-chain/calculation-manager/providers/common/proxy-cross-chain-evm-facade/proxy-cross-chain-evm-trade';
import { openOceanApiUrl } from 'src/features/on-chain/calculation-manager/providers/aggregators/open-ocean/constants/get-open-ocean-api-url';
import { openOceanBlockchainName } from 'src/features/on-chain/calculation-manager/providers/aggregators/open-ocean/constants/open-ocean-blockchain';
import { OpenoceanOnChainSupportedBlockchain } from 'src/features/on-chain/calculation-manager/providers/aggregators/open-ocean/constants/open-ocean-on-chain-supported-blockchain';
import { OpenoceanSwapQuoteResponse } from 'src/features/on-chain/calculation-manager/providers/aggregators/open-ocean/models/open-cean-swap-quote-response';
import { OpenOceanTradeStruct } from 'src/features/on-chain/calculation-manager/providers/aggregators/open-ocean/models/open-ocean-trade-struct';
import { ON_CHAIN_TRADE_TYPE } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { getOnChainGasData } from 'src/features/on-chain/calculation-manager/utils/get-on-chain-gas-data';

import { AggregatorEvmOnChainTrade } from '../../common/on-chain-aggregator/aggregator-evm-on-chain-trade-abstract';
import { GetToAmountAndTxDataResponse } from '../../common/on-chain-aggregator/models/aggregator-on-chain-types';
import { ARBITRUM_GAS_PRICE } from './constants/arbitrum-gas-price';

export class OpenOceanTrade extends AggregatorEvmOnChainTrade {
    /** @internal */
    public static async getGasLimit(
        openOceanTradeStruct: OpenOceanTradeStruct
    ): Promise<BigNumber | null> {
        const openOceanTrade = new OpenOceanTrade(openOceanTradeStruct, EvmWeb3Pure.EMPTY_ADDRESS);
        return getOnChainGasData(openOceanTrade);
    }

    public readonly type = ON_CHAIN_TRADE_TYPE.OPEN_OCEAN;

    private readonly _toTokenAmountMin: PriceTokenAmount;

    public static readonly nativeAddress = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';

    protected get spenderAddress(): string {
        const openOceanContractAddress =
            this.from.blockchain === BLOCKCHAIN_NAME.OKE_X_CHAIN
                ? '0xc0006Be82337585481044a7d11941c0828FFD2D4'
                : '0x6352a56caadC4F1E25CD6c75970Fa768A3304e64';

        return this.useProxy
            ? rubicProxyContractAddress[this.from.blockchain].gateway
            : openOceanContractAddress;
    }

    public get dexContractAddress(): string {
        throw new RubicSdkError('Dex address is unknown before swap is started');
    }

    public get toTokenAmountMin(): PriceTokenAmount {
        return this._toTokenAmountMin;
    }

    constructor(tradeStruct: OpenOceanTradeStruct, providerAddress: string) {
        super(tradeStruct, providerAddress);

        this._toTokenAmountMin = new PriceTokenAmount({
            ...this.to.asStruct,
            weiAmount: tradeStruct.toTokenWeiAmountMin
        });
    }

    public async encodeDirect(options: EncodeTransactionOptions): Promise<EvmEncodeConfig> {
        await this.checkFromAddress(options.fromAddress, true);
        checkUnsupportedReceiverAddress(
            options?.receiverAddress,
            options?.fromAddress || this.walletAddress
        );

        try {
            const transactionData = await this.getTxConfigAndCheckAmount(
                false,
                options?.useCacheData || false,
                options?.receiverAddress,
                options?.fromAddress
            );
            const { gas, gasPrice } = this.getGasParams(options, {
                gasLimit: transactionData.gas,
                gasPrice: transactionData.gasPrice
            });

            return {
                to: transactionData.to,
                data: transactionData.data,
                value: this.fromWithoutFee.isNative ? this.fromWithoutFee.stringWeiAmount : '0',
                gas,
                gasPrice
            };
        } catch (err) {
            if ([400, 500, 503].includes(err.code)) {
                throw new SwapRequestError();
            }
            if (this.isDeflationError()) {
                throw new LowSlippageDeflationaryTokenError();
            }
            throw parseError(err);
        }
    }

    protected async getTransactionConfigAndAmount(
        receiverAddress?: string
    ): Promise<GetToAmountAndTxDataResponse> {
        const gasPrice = await Injector.web3PublicService
            .getWeb3Public(this.from.blockchain)
            .getGasPrice();
        const walletAddress = (
            Injector.web3PrivateService.getWeb3Private(CHAIN_TYPE.EVM) as EvmWeb3Private
        ).address;
        const apiUrl = openOceanApiUrl.swapQuote(
            openOceanBlockchainName[this.from.blockchain as OpenoceanOnChainSupportedBlockchain]
        );
        const isArbitrum = this.from.blockchain === BLOCKCHAIN_NAME.ARBITRUM;
        const swapQuoteResponse = await Injector.httpClient.get<OpenoceanSwapQuoteResponse>(
            apiUrl,
            {
                headers: { apikey: 'sndfje3u4b3fnNSDNFUSDNVSunw345842hrnfd3b4nt4' },
                params: {
                    chain: openOceanBlockchainName[
                        this.from.blockchain as OpenoceanOnChainSupportedBlockchain
                    ],
                    inTokenAddress: this.getTokenAddress(this.from),
                    outTokenAddress: this.getTokenAddress(this.to),
                    amount: this.fromWithoutFee.tokenAmount.toString(),
                    gasPrice: isArbitrum
                        ? ARBITRUM_GAS_PRICE
                        : Web3Pure.fromWei(
                              gasPrice,
                              nativeTokensList[this.from.blockchain].decimals
                          )
                              .multipliedBy(10 ** 9)
                              .toString(),
                    slippage: this.slippageTolerance * 100,
                    account: receiverAddress || walletAddress,
                    referrer: '0x429A3A1a2623DFb520f1D93F64F38c0738418F1f'
                }
            }
        );
        const { data, to, value, outAmount: toAmount } = swapQuoteResponse.data;

        return {
            tx: {
                data,
                to,
                value
            },
            toAmount
        };
    }

    private getTokenAddress(token: PriceToken): string {
        if (token.isNative) {
            if (token.blockchain === BLOCKCHAIN_NAME.METIS) {
                return '0xdeaddeaddeaddeaddeaddeaddeaddeaddead0000';
            }

            return OpenOceanTrade.nativeAddress;
        }
        return token.address;
    }

    protected async getSwapData(options: GetContractParamsOptions): Promise<unknown[]> {
        const directTransactionConfig = await this.encodeDirect({
            ...options,
            fromAddress: rubicProxyContractAddress[this.from.blockchain].router,
            supportFee: false,
            receiverAddress: rubicProxyContractAddress[this.from.blockchain].router
        });
        const availableDexs = (
            await ProxyCrossChainEvmTrade.getWhitelistedDexes(this.from.blockchain)
        ).map(address => address.toLowerCase());

        const routerAddress = directTransactionConfig.to;
        const method = directTransactionConfig.data.slice(0, 10);

        if (!availableDexs.includes(routerAddress.toLowerCase())) {
            throw new NotWhitelistedProviderError(routerAddress, undefined, 'dex');
        }
        await ProxyCrossChainEvmTrade.checkDexWhiteList(
            this.from.blockchain,
            routerAddress,
            method
        );

        return [
            [
                routerAddress,
                routerAddress,
                this.from.isNative && this.from.blockchain === BLOCKCHAIN_NAME.METIS
                    ? '0xdeaddeaddeaddeaddeaddeaddeaddeaddead0000'
                    : this.from.address,
                this.to.address,
                this.from.stringWeiAmount,
                directTransactionConfig.data,
                true
            ]
        ];
    }
}
