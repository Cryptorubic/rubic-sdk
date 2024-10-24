import { RubicSdkError } from 'src/common/errors';
import { PriceTokenAmount } from 'src/common/tokens';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { BlockchainsInfo } from 'src/core/blockchain/utils/blockchains-info/blockchains-info';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { Injector } from 'src/core/injector/injector';
import { getFromWithoutFee } from 'src/features/common/utils/get-from-without-fee';

import { CROSS_CHAIN_TRADE_TYPE } from '../../models/cross-chain-trade-type';
import { convertGasDataToBN } from '../../utils/convert-gas-price';
import { rubicProxyContractAddress } from '../common/constants/rubic-proxy-contract-address';
import { CrossChainTransferTrade } from '../common/cross-chain-transfer-trade/cross-chain-transfer-trade';
import { CrossChainTransferData } from '../common/cross-chain-transfer-trade/models/cross-chain-payment-info';
import { GasData } from '../common/emv-cross-chain-trade/models/gas-data';
import { BRIDGE_TYPE } from '../common/models/bridge-type';
import { FeeInfo } from '../common/models/fee-info';
import { OnChainSubtype } from '../common/models/on-chain-subtype';
import { RubicStep } from '../common/models/rubicStep';
import { TradeInfo } from '../common/models/trade-info';
import { SimpleSwapCcrSupportedChain } from './constants/simple-swap-ccr-api-blockchain';
import { SimpleSwapCurrency } from './models/simple-swap-currency';
import { SimpleSwapExchangeRequest } from './models/simple-swap-requests';
import { SimpleSwapApiService } from './services/simple-swap-api-service';

export class SimpleSwapCcrTrade extends CrossChainTransferTrade {
    /** @internal */
    public static async getGasData(
        from: PriceTokenAmount<EvmBlockchainName>,
        to: PriceTokenAmount<SimpleSwapCcrSupportedChain>,
        feeInfo: FeeInfo,
        fromCurrency: SimpleSwapCurrency,
        toCurrency: SimpleSwapCurrency,
        providerAddress: string,
        receiverAddress?: string
    ): Promise<GasData | null> {
        const fromBlockchain = from.blockchain as EvmBlockchainName;
        const walletAddress =
            BlockchainsInfo.isEvmBlockchainName(fromBlockchain) &&
            Injector.web3PrivateService.getWeb3PrivateByBlockchain(fromBlockchain).address;
        if (!walletAddress) {
            return null;
        }

        try {
            const { contractAddress, contractAbi, methodName, methodArguments, value } =
                await new SimpleSwapCcrTrade(
                    {
                        from,
                        to,
                        gasData: null,
                        feeInfo,
                        priceImpact: null,
                        fromCurrency,
                        toCurrency
                    },
                    providerAddress,
                    [],
                    false
                ).getContractParams({ receiverAddress: receiverAddress || walletAddress }, true);

            const web3Public = Injector.web3PublicService.getWeb3Public(fromBlockchain);
            const [gasLimit, gasDetails] = await Promise.all([
                web3Public.getEstimatedGas(
                    contractAbi,
                    contractAddress,
                    methodName,
                    methodArguments,
                    walletAddress,
                    value
                ),
                convertGasDataToBN(await Injector.gasPriceApi.getGasPrice(fromBlockchain))
            ]);

            if (!gasLimit?.isFinite()) {
                return null;
            }

            const increasedGasLimit = Web3Pure.calculateGasMargin(gasLimit, 1.2);
            return {
                gasLimit: increasedGasLimit,
                ...gasDetails
            };
        } catch (_err) {
            return null;
        }
    }

    public get simpleSwapId(): string {
        return this.paymentInfo ? this.paymentInfo.id : '';
    }

    public readonly type = CROSS_CHAIN_TRADE_TYPE.SIMPLE_SWAP;

    public readonly onChainSubtype: OnChainSubtype = { from: undefined, to: undefined };

    public readonly bridgeType = BRIDGE_TYPE.SIMPLE_SWAP;

    private readonly fromCurrency: SimpleSwapCurrency;

    private readonly toCurrency: SimpleSwapCurrency;

    protected get fromContractAddress(): string {
        if (this.isProxyTrade) {
            return rubicProxyContractAddress[this.from.blockchain].gateway;
        }
        throw new RubicSdkError('No contract address for simple swap provider');
    }

    constructor(
        crossChainTrade: {
            from: PriceTokenAmount<EvmBlockchainName>;
            to: PriceTokenAmount<SimpleSwapCcrSupportedChain>;
            gasData: GasData | null;
            feeInfo: FeeInfo;
            priceImpact: number | null;
            fromCurrency: SimpleSwapCurrency;
            toCurrency: SimpleSwapCurrency;
        },
        providerAddress: string,
        routePath: RubicStep[],
        useProxy: boolean
    ) {
        super(
            providerAddress,
            routePath,
            useProxy,
            null,
            crossChainTrade.from,
            crossChainTrade.to,
            crossChainTrade.to.tokenAmount,
            crossChainTrade.gasData,
            crossChainTrade.feeInfo,
            crossChainTrade.priceImpact
        );

        this.fromCurrency = crossChainTrade.fromCurrency;
        this.toCurrency = crossChainTrade.toCurrency;
    }

    protected async getPaymentInfo(receiverAddress: string): Promise<CrossChainTransferData> {
        const walletAddress =
            BlockchainsInfo.isEvmBlockchainName(this.from.blockchain) &&
            Injector.web3PrivateService.getWeb3PrivateByBlockchain(this.from.blockchain).address;

        const fromWithoutFee = getFromWithoutFee(
            this.from,
            this.feeInfo.rubicProxy?.platformFee?.percent
        );

        const exchangeParams: SimpleSwapExchangeRequest = {
            amount: fromWithoutFee.tokenAmount.toFixed(),
            currency_from: this.fromCurrency.symbol,
            currency_to: this.toCurrency.symbol,
            fixed: false,
            address_to: receiverAddress,
            extra_id_to: '',
            user_refund_address: walletAddress || '',
            user_refund_extra_id: ''
        };

        const exchnage = await SimpleSwapApiService.createExchange(exchangeParams);

        const extraInfo = exchnage.extra_id_from && this.fromCurrency.has_extra_id ?
            {
                depositExtraId: exchnage.extra_id_from,
                depositExtraIdName: this.fromCurrency.extra_id
            } : undefined;

        return {
            id: exchnage.id,
            toAmount: exchnage.amount_to,
            depositAddress: exchnage.address_from,
            ...(extraInfo && { ...extraInfo })
        };
    }

    public getTradeInfo(): TradeInfo {
        return {
            estimatedGas: this.estimatedGas,
            feeInfo: this.feeInfo,
            priceImpact: this.priceImpact ?? null,
            slippage: this.onChainTrade?.slippageTolerance
                ? this.onChainTrade.slippageTolerance * 100
                : 0,
            routePath: this.routePath
        };
    }
}
