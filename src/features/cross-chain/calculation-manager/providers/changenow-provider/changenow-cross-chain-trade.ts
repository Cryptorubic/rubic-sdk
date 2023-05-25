import BigNumber from 'bignumber.js';
import {
    FailedToCheckForTransactionReceiptError,
    RubicSdkError,
    UnnecessaryApproveError
} from 'src/common/errors';
import { PriceTokenAmount } from 'src/common/tokens';
import { getGasOptions } from 'src/common/utils/options';
import { BlockchainsInfo } from 'src/core/blockchain/utils/blockchains-info/blockchains-info';
import { EvmWeb3Private } from 'src/core/blockchain/web3-private-service/web3-private/evm-web3-private/evm-web3-private';
import { ERC20_TOKEN_ABI } from 'src/core/blockchain/web3-public-service/web3-public/evm-web3-public/constants/erc-20-token-abi';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { Injector } from 'src/core/injector/injector';
import { ContractParams } from 'src/features/common/models/contract-params';
import { EncodeTransactionOptions } from 'src/features/common/models/encode-transaction-options';
import { SwapTransactionOptions } from 'src/features/common/models/swap-transaction-options';
import { changenowApiKey } from 'src/features/common/providers/changenow/constants/changenow-api-key';
import { CROSS_CHAIN_TRADE_TYPE } from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { ChangenowCrossChainSupportedBlockchain } from 'src/features/cross-chain/calculation-manager/providers/changenow-provider/constants/changenow-api-blockchain';
import { ChangenowCurrency } from 'src/features/cross-chain/calculation-manager/providers/changenow-provider/models/changenow-currencies-api';
import { ChangenowExchangeResponse } from 'src/features/cross-chain/calculation-manager/providers/changenow-provider/models/changenow-exchange-api';
import { ChangenowPaymentInfo } from 'src/features/cross-chain/calculation-manager/providers/changenow-provider/models/changenow-payment-info';
import { ChangenowTrade } from 'src/features/cross-chain/calculation-manager/providers/changenow-provider/models/changenow-trade';
import { CrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/common/cross-chain-trade';
import { GasData } from 'src/features/cross-chain/calculation-manager/providers/common/emv-cross-chain-trade/models/gas-data';
import { BRIDGE_TYPE } from 'src/features/cross-chain/calculation-manager/providers/common/models/bridge-type';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { GetContractParamsOptions } from 'src/features/cross-chain/calculation-manager/providers/common/models/get-contract-params-options';
import { TradeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/trade-info';
import { MarkRequired } from 'ts-essentials';
import { TransactionConfig } from 'web3-core';

import { convertGasDataToBN } from '../../utils/convert-gas-price';

export class ChangenowCrossChainTrade extends CrossChainTrade {
    /** @internal */
    public static async getGasData(
        changenowTrade: ChangenowTrade,
        receiverAddress: string
    ): Promise<GasData | null> {
        const fromBlockchain = changenowTrade.from.blockchain;
        const walletAddress =
            BlockchainsInfo.isEvmBlockchainName(fromBlockchain) &&
            Injector.web3PrivateService.getWeb3PrivateByBlockchain(fromBlockchain).address;
        if (!walletAddress) {
            return null;
        }

        try {
            const { contractAddress, contractAbi, methodName, methodArguments, value } =
                await new ChangenowCrossChainTrade(
                    changenowTrade,
                    EvmWeb3Pure.EMPTY_ADDRESS
                ).getContractParams({ receiverAddress });

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

    protected get methodName(): string {
        throw new RubicSdkError('No method name');
    }

    public readonly type = CROSS_CHAIN_TRADE_TYPE.CHANGENOW;

    public readonly isAggregator = false;

    public readonly from: PriceTokenAmount<ChangenowCrossChainSupportedBlockchain>;

    public readonly to: PriceTokenAmount<ChangenowCrossChainSupportedBlockchain>;

    public readonly toTokenAmountMin: BigNumber;

    public readonly gasData: GasData;

    public readonly feeInfo: FeeInfo;

    public readonly onChainSubtype = { from: undefined, to: undefined };

    public readonly bridgeType = BRIDGE_TYPE.CHANGENOW;

    public readonly priceImpact: number | null;

    /**
     * id of changenow trade, used to get trade status.
     */
    public id: string | undefined;

    private readonly fromCurrency: ChangenowCurrency;

    private readonly toCurrency: ChangenowCurrency;

    protected get fromContractAddress(): string {
        throw new RubicSdkError('No contract address');
    }

    protected get web3Private(): EvmWeb3Private {
        if (!BlockchainsInfo.isEvmBlockchainName(this.from.blockchain)) {
            throw new RubicSdkError('Cannot retrieve web3 private');
        }
        return Injector.web3PrivateService.getWeb3PrivateByBlockchain(this.from.blockchain);
    }

    public get estimatedGas(): BigNumber | null {
        if (!this.gasData) {
            return null;
        }

        if (this.gasData.baseFee && this.gasData.maxPriorityFeePerGas) {
            return Web3Pure.fromWei(this.gasData.baseFee).plus(
                Web3Pure.fromWei(this.gasData.maxPriorityFeePerGas)
            );
        }

        if (this.gasData.gasPrice) {
            return Web3Pure.fromWei(this.gasData.gasPrice).multipliedBy(this.gasData.gasLimit);
        }

        return null;
    }

    constructor(crossChainTrade: ChangenowTrade, providerAddress: string) {
        super(providerAddress);

        this.from = crossChainTrade.from;
        this.to = crossChainTrade.to;
        this.toTokenAmountMin = crossChainTrade.toTokenAmountMin;

        this.fromCurrency = crossChainTrade.fromCurrency;
        this.toCurrency = crossChainTrade.toCurrency;

        this.feeInfo = crossChainTrade.feeInfo;
        this.gasData = crossChainTrade.gasData;

        this.priceImpact = this.from.calculatePriceImpactPercent(this.to);
    }

    public async needApprove(): Promise<boolean> {
        return false;
    }

    public approve(): Promise<unknown> {
        throw new UnnecessaryApproveError();
    }

    public async swap(options: SwapTransactionOptions = {}): Promise<string | never> {
        if (!BlockchainsInfo.isEvmBlockchainName(this.from.blockchain)) {
            throw new RubicSdkError("For non-evm chains use 'getChangenowPostTrade' method");
        }

        await this.checkTradeErrors();
        await this.checkReceiverAddress(
            options.receiverAddress,
            !BlockchainsInfo.isEvmBlockchainName(this.to.blockchain),
            CROSS_CHAIN_TRADE_TYPE.CHANGENOW
        );

        const { onConfirm, gasLimit, gasPrice, gasPriceOptions } = options;
        let transactionHash: string;
        const onTransactionHash = (hash: string) => {
            if (onConfirm) {
                onConfirm(hash);
            }
            transactionHash = hash;
        };

        try {
            const { id, payinAddress } = await this.getPaymentInfo(
                this.from.tokenAmount,
                options.receiverAddress ? options.receiverAddress : this.walletAddress
            );
            this.id = id;

            if (this.from.isNative) {
                await this.web3Private.trySendTransaction(payinAddress, {
                    value: this.from.weiAmount,
                    onTransactionHash
                });
            } else {
                await this.web3Private.tryExecuteContractMethod(
                    this.from.address,
                    ERC20_TOKEN_ABI,
                    'transfer',
                    [payinAddress, this.from.stringWeiAmount],
                    {
                        onTransactionHash,
                        gas: gasLimit,
                        gasPrice,
                        gasPriceOptions
                    }
                );
            }

            return transactionHash!;
        } catch (err) {
            if (err instanceof FailedToCheckForTransactionReceiptError) {
                return transactionHash!;
            }
            throw err;
        }
    }

    public async getChangenowPostTrade(receiverAddress: string): Promise<ChangenowPaymentInfo> {
        const paymentInfo = await this.getPaymentInfo(this.from.tokenAmount, receiverAddress);
        const extraField = paymentInfo.payinExtraIdName
            ? {
                  name: paymentInfo.payinExtraIdName,
                  value: paymentInfo.payinExtraId
              }
            : null;
        return {
            id: paymentInfo.id,
            depositAddress: paymentInfo.payinAddress,
            ...(extraField && { extraField })
        };
    }

    private async getPaymentInfo(
        fromAmount: BigNumber,
        receiverAddress: string
    ): Promise<ChangenowExchangeResponse> {
        return Injector.httpClient.post<ChangenowExchangeResponse>(
            'https://api.changenow.io/v2/exchange',
            {
                fromCurrency: this.fromCurrency.ticker,
                toCurrency: this.toCurrency.ticker,
                fromNetwork: this.fromCurrency.network,
                toNetwork: this.toCurrency.network,
                fromAmount: fromAmount.toFixed(),
                address: receiverAddress,
                flow: 'standard'
            },
            {
                headers: {
                    'x-changenow-api-key': changenowApiKey
                }
            }
        );
    }

    protected getContractParams(
        _options: MarkRequired<GetContractParamsOptions, 'receiverAddress'>
    ): Promise<ContractParams> {
        throw new RubicSdkError('Not implemented');
    }

    public getTradeAmountRatio(fromUsd: BigNumber): BigNumber {
        return fromUsd.dividedBy(this.to.tokenAmount);
    }

    public getUsdPrice(): BigNumber {
        return this.from.price.multipliedBy(this.from.tokenAmount);
    }

    public getTradeInfo(): TradeInfo {
        return {
            estimatedGas: this.estimatedGas,
            feeInfo: this.feeInfo,
            priceImpact: this.priceImpact ?? null,
            slippage: 0
        };
    }

    public async encode(options: EncodeTransactionOptions): Promise<TransactionConfig> {
        if (!BlockchainsInfo.isEvmBlockchainName(this.from.blockchain)) {
            throw new RubicSdkError('Cannot encode trade for non-evm blockchain');
        }

        await this.checkFromAddress(options.fromAddress, true, CROSS_CHAIN_TRADE_TYPE.CHANGENOW);
        await this.checkReceiverAddress(
            options.receiverAddress,
            !BlockchainsInfo.isEvmBlockchainName(this.to.blockchain),
            CROSS_CHAIN_TRADE_TYPE.CHANGENOW
        );

        const { gasLimit } = options;

        const { contractAddress, contractAbi, methodName, methodArguments, value } =
            await this.getContractParams({
                fromAddress: options.fromAddress,
                receiverAddress: options.receiverAddress || options.fromAddress
            });

        return EvmWeb3Pure.encodeMethodCall(
            contractAddress,
            contractAbi,
            methodName,
            methodArguments,
            value,
            {
                gas: gasLimit || this.gasData?.gasLimit.toFixed(0),
                ...getGasOptions(options)
            }
        );
    }

    public encodeApprove(): Promise<unknown> {
        throw new RubicSdkError('Cannot encode approve for changenow');
    }
}
