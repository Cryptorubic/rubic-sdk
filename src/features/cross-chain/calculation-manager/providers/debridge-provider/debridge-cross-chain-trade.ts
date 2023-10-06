import BigNumber from 'bignumber.js';
import { BytesLike } from 'ethers';
import {
    FailedToCheckForTransactionReceiptError,
    RubicSdkError,
    TooLowAmountError
} from 'src/common/errors';
import { UpdatedRatesError } from 'src/common/errors/cross-chain/updated-rates-error';
import { PriceTokenAmount } from 'src/common/tokens';
import { parseError } from 'src/common/utils/errors';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { Injector } from 'src/core/injector/injector';
import { ContractParams } from 'src/features/common/models/contract-params';
import { SwapTransactionOptions } from 'src/features/common/models/swap-transaction-options';
import { CROSS_CHAIN_TRADE_TYPE } from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { rubicProxyContractAddress } from 'src/features/cross-chain/calculation-manager/providers/common/constants/rubic-proxy-contract-address';
import { evmCommonCrossChainAbi } from 'src/features/cross-chain/calculation-manager/providers/common/emv-cross-chain-trade/constants/evm-common-cross-chain-abi';
import { gatewayRubicCrossChainAbi } from 'src/features/cross-chain/calculation-manager/providers/common/emv-cross-chain-trade/constants/gateway-rubic-cross-chain-abi';
import { EvmCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/common/emv-cross-chain-trade/evm-cross-chain-trade';
import { GasData } from 'src/features/cross-chain/calculation-manager/providers/common/emv-cross-chain-trade/models/gas-data';
import { BRIDGE_TYPE } from 'src/features/cross-chain/calculation-manager/providers/common/models/bridge-type';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { GetContractParamsOptions } from 'src/features/cross-chain/calculation-manager/providers/common/models/get-contract-params-options';
import { TradeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/trade-info';
import { ProxyCrossChainEvmTrade } from 'src/features/cross-chain/calculation-manager/providers/common/proxy-cross-chain-evm-facade/proxy-cross-chain-evm-trade';
import { DeBridgeCrossChainSupportedBlockchain } from 'src/features/cross-chain/calculation-manager/providers/debridge-provider/constants/debridge-cross-chain-supported-blockchain';
import { portalAddresses } from 'src/features/cross-chain/calculation-manager/providers/debridge-provider/constants/portal-address';
import { DebridgeCrossChainProvider } from 'src/features/cross-chain/calculation-manager/providers/debridge-provider/debridge-cross-chain-provider';
import { Estimation } from 'src/features/cross-chain/calculation-manager/providers/debridge-provider/models/estimation-response';
import { TransactionRequest } from 'src/features/cross-chain/calculation-manager/providers/debridge-provider/models/transaction-request';
import { TransactionResponse } from 'src/features/cross-chain/calculation-manager/providers/debridge-provider/models/transaction-response';
import { meteRouterAbi } from 'src/features/cross-chain/calculation-manager/providers/symbiosis-provider/constants/mete-router-abi';
import { MethodDecoder } from 'src/features/cross-chain/calculation-manager/utils/decode-method';
import { ON_CHAIN_TRADE_TYPE } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { EvmOnChainTrade } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/evm-on-chain-trade';
import { oneinchApiParams } from 'src/features/on-chain/calculation-manager/providers/dexes/common/oneinch-abstract/constants';

import { convertGasDataToBN } from '../../utils/convert-gas-price';

/**
 * Calculated DeBridge cross-chain trade.
 */
export class DebridgeCrossChainTrade extends EvmCrossChainTrade {
    protected useProxyByDefault = false;

    /** @internal */
    public readonly transitAmount: BigNumber;

    public readonly maxTheoreticalAmount: BigNumber;

    private readonly cryptoFeeToken: PriceTokenAmount;

    private readonly transactionRequest: TransactionRequest;

    private readonly slippage: number;

    private readonly onChainTrade: EvmOnChainTrade | null;

    /** @internal */
    public static async getGasData(
        from: PriceTokenAmount<EvmBlockchainName>,
        to: PriceTokenAmount<EvmBlockchainName>,
        transactionRequest: TransactionRequest
    ): Promise<GasData | null> {
        const fromBlockchain = from.blockchain as DeBridgeCrossChainSupportedBlockchain;
        const walletAddress =
            Injector.web3PrivateService.getWeb3PrivateByBlockchain(fromBlockchain).address;
        if (!walletAddress) {
            return null;
        }

        try {
            const { contractAddress, contractAbi, methodName, methodArguments, value } =
                await new DebridgeCrossChainTrade(
                    {
                        from,
                        to,
                        transactionRequest,
                        gasData: null,
                        priceImpact: 0,
                        allowanceTarget: '',
                        slippage: 0,
                        feeInfo: {},
                        transitAmount: new BigNumber(NaN),
                        maxTheoreticalAmount: new BigNumber(NaN),
                        cryptoFeeToken: from,
                        onChainTrade: null
                    },
                    EvmWeb3Pure.EMPTY_ADDRESS
                ).getContractParams({});

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
                convertGasDataToBN(await Injector.gasPriceApi.getGasPrice(from.blockchain))
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

    public readonly type = CROSS_CHAIN_TRADE_TYPE.DEBRIDGE;

    public readonly isAggregator = false;

    public readonly onChainSubtype = {
        from: ON_CHAIN_TRADE_TYPE.ONE_INCH,
        to: ON_CHAIN_TRADE_TYPE.ONE_INCH
    };

    public readonly bridgeType = BRIDGE_TYPE.DEBRIDGE;

    public readonly from: PriceTokenAmount<EvmBlockchainName>;

    public readonly to: PriceTokenAmount<EvmBlockchainName>;

    public readonly toTokenAmountMin: BigNumber;

    public readonly priceImpact: number | null;

    public readonly allowanceTarget: string;

    public readonly gasData: GasData | null;

    private get fromBlockchain(): DeBridgeCrossChainSupportedBlockchain {
        return this.from.blockchain as DeBridgeCrossChainSupportedBlockchain;
    }

    protected get fromContractAddress(): string {
        return this.allowanceTarget;
    }

    public readonly feeInfo: FeeInfo;

    protected get methodName(): string {
        return 'startBridgeTokensViaGenericCrossChain';
    }

    constructor(
        crossChainTrade: {
            from: PriceTokenAmount<EvmBlockchainName>;
            to: PriceTokenAmount<EvmBlockchainName>;
            transactionRequest: TransactionRequest;
            gasData: GasData | null;
            priceImpact: number | null;
            allowanceTarget: string;
            slippage: number;
            feeInfo: FeeInfo;
            transitAmount: BigNumber;
            maxTheoreticalAmount: BigNumber;
            cryptoFeeToken: PriceTokenAmount;
            onChainTrade: EvmOnChainTrade | null;
        },
        providerAddress: string
    ) {
        super(providerAddress);

        this.from = crossChainTrade.from;
        this.to = crossChainTrade.to;
        this.transactionRequest = crossChainTrade.transactionRequest;
        this.gasData = crossChainTrade.gasData;
        this.priceImpact = crossChainTrade.priceImpact;
        this.allowanceTarget = crossChainTrade.allowanceTarget;
        this.slippage = crossChainTrade.slippage;
        this.onChainTrade = crossChainTrade.onChainTrade;
        this.toTokenAmountMin = this.to.tokenAmount.multipliedBy(1 - crossChainTrade.slippage);
        this.feeInfo = crossChainTrade.feeInfo;
        this.cryptoFeeToken = crossChainTrade.cryptoFeeToken;

        this.transitAmount = crossChainTrade.transitAmount;
        this.maxTheoreticalAmount = crossChainTrade.maxTheoreticalAmount;
    }

    protected async swapDirect(options: SwapTransactionOptions = {}): Promise<string | never> {
        this.checkWalletConnected();
        await this.checkAllowanceAndApprove(options);
        let transactionHash: string;

        try {
            const { tx } = await this.getTransactionRequest(options?.receiverAddress);
            const { data, value, to } = tx;
            const { onConfirm } = options;
            const onTransactionHash = (hash: string) => {
                if (onConfirm) {
                    onConfirm(hash);
                }
                transactionHash = hash;
            };
            await this.web3Private.trySendTransaction(to, {
                onTransactionHash,
                data,
                value,
                gas: options.gasLimit,
                gasPrice: options.gasPrice,
                gasPriceOptions: options.gasPriceOptions
            });

            return transactionHash!;
        } catch (err) {
            if (err?.error?.errorId === 'ERROR_LOW_GIVE_AMOUNT') {
                throw new TooLowAmountError();
            }
            if (err instanceof FailedToCheckForTransactionReceiptError) {
                return transactionHash!;
            }
            throw parseError(err);
        }
    }

    public async getContractParams(options: GetContractParamsOptions): Promise<ContractParams> {
        const { fixFee, tx } = await this.getTransactionRequest(options?.receiverAddress);
        const { data, value: providerValue, to } = tx;

        const bridgeData = ProxyCrossChainEvmTrade.getBridgeData(options, {
            walletAddress: this.walletAddress,
            fromTokenAmount: this.from,
            toTokenAmount: this.to,
            srcChainTrade: null,
            providerAddress: this.providerAddress,
            type: `native:${this.type}`,
            fromAddress: this.walletAddress
        });
        const swapData =
            this.onChainTrade &&
            (await ProxyCrossChainEvmTrade.getSwapData(options, {
                walletAddress: this.walletAddress,
                contractAddress: rubicProxyContractAddress[this.from.blockchain].router,
                fromTokenAmount: this.from,
                toTokenAmount: this.onChainTrade.to,
                onChainEncodeFn: this.onChainTrade.encode.bind(this.onChainTrade)
            }));
        const providerData = await ProxyCrossChainEvmTrade.getGenericProviderData(
            to,
            data! as string,
            this.fromBlockchain,
            this.fromContractAddress,
            fixFee
        );

        const methodArguments = swapData
            ? [bridgeData, swapData, providerData]
            : [bridgeData, providerData];

        const value = this.getSwapValue(providerValue);

        const transactionConfiguration = EvmWeb3Pure.encodeMethodCall(
            rubicProxyContractAddress[this.from.blockchain].router,
            evmCommonCrossChainAbi,
            this.methodName,
            methodArguments,
            value
        );
        const sendingToken = this.from.isNative ? [] : [this.from.address];
        const sendingAmount = this.from.isNative ? [] : [this.from.stringWeiAmount];

        return {
            contractAddress: rubicProxyContractAddress[this.from.blockchain].gateway,
            contractAbi: gatewayRubicCrossChainAbi,
            methodName: 'startViaRubic',
            methodArguments: [sendingToken, sendingAmount, transactionConfiguration.data],
            value
        };
    }

    public getTradeAmountRatio(fromUsd: BigNumber): BigNumber {
        const usdCryptoFee = this.cryptoFeeToken.price.multipliedBy(
            this.cryptoFeeToken.tokenAmount
        );
        return fromUsd
            .plus(usdCryptoFee.isNaN() ? 0 : usdCryptoFee)
            .dividedBy(this.maxTheoreticalAmount);
    }

    private async getTransactionRequest(receiverAddress?: string): Promise<{
        fixFee: string;
        tx: {
            data: string;
            value: string;
            to: string;
        };
    }> {
        const walletAddress = this.web3Private.address;
        const params = {
            ...this.transactionRequest,
            ...(receiverAddress && { dstChainTokenOutRecipient: receiverAddress }),
            // @TODO Check proxy when deBridge proxy returned
            senderAddress: walletAddress,
            srcChainRefundAddress: walletAddress,
            dstChainOrderAuthorityAddress: receiverAddress || walletAddress,
            srcChainOrderAuthorityAddress: receiverAddress || walletAddress,
            referralCode: '4350'
        };

        const { tx, estimation, fixFee } = await Injector.httpClient.get<TransactionResponse>(
            `${DebridgeCrossChainProvider.apiEndpoint}/order/create-tx`,
            { params }
        );

        await this.checkOrderAmount(estimation);

        return { fixFee, tx };
    }

    public getUsdPrice(): BigNumber {
        return this.transitAmount;
    }

    public getTradeInfo(): TradeInfo {
        return {
            estimatedGas: this.estimatedGas,
            feeInfo: this.feeInfo,
            priceImpact: this.priceImpact ?? null,
            slippage: 0
        };
    }

    protected getBridgeData(options: GetContractParamsOptions): unknown[] {
        const receiverAddress = options?.receiverAddress || this.walletAddress;
        const toChainId = blockchainId[this.to.blockchain];
        const fromToken = this.onChainTrade ? this.onChainTrade.to : this.from;
        const hasSwapBeforeBridge = this.onChainTrade !== null;

        return [
            EvmWeb3Pure.randomHex(32),
            `native:${this.type.toLowerCase()}`,
            this.providerAddress,
            EvmWeb3Pure.randomHex(20),
            fromToken.address,
            receiverAddress,
            fromToken.stringWeiAmount,
            toChainId,
            hasSwapBeforeBridge,
            false
        ];
    }

    protected async getSwapData(options: GetContractParamsOptions): Promise<unknown[]> {
        const fromAddress =
            options.fromAddress || this.walletAddress || oneinchApiParams.nativeAddress;
        const swapData = await this.onChainTrade!.encode({
            fromAddress,
            receiverAddress: this.fromContractAddress
        });

        return [
            [
                swapData.to,
                swapData.to,
                this.from.address,
                this.onChainTrade!.to.address,
                this.from.stringWeiAmount,
                swapData.data,
                true
            ]
        ];
    }

    protected getProviderData(sourceData: BytesLike): unknown[] {
        const targetCallData = this.decodeCallData(sourceData);
        const portalAddress = portalAddresses[this.fromBlockchain];

        return [
            '0x',
            '0x',
            EvmWeb3Pure.EMPTY_ADDRESS,
            this.from.address,
            EvmWeb3Pure.EMPTY_ADDRESS,
            EvmWeb3Pure.EMPTY_ADDRESS,
            portalAddress,
            targetCallData
        ];
    }

    private decodeCallData(data: ArrayLike<number> | string | undefined): string {
        if (typeof data === 'string') {
            const decodeData = MethodDecoder.decodeMethod(
                meteRouterAbi.find(method => method.name === 'metaRoute')!,
                data
            )!.params[0]!.value as unknown as { otherSideCalldata: string };
            return decodeData.otherSideCalldata;
        }
        throw new RubicSdkError('Wrong call data');
    }

    private async checkOrderAmount(estimation: Estimation): Promise<never | void> {
        const newAmount = Web3Pure.fromWei(estimation.dstChainTokenOut.amount, this.to.decimals);

        const acceptableExpensesChangePercent = 3;
        const acceptablePriceChangeFromAmount = 0.05;

        const feeAmount = Web3Pure.fromWei(
            estimation.costsDetails.find(fee => fee.type === 'EstimatedOperatingExpenses')?.payload
                .feeAmount || '0',
            this.to.decimals
        );

        const acceptablePriceChangeFromExpenses = feeAmount
            .dividedBy(newAmount)
            .multipliedBy(acceptableExpensesChangePercent);

        const acceptablePriceChange = acceptablePriceChangeFromExpenses.plus(
            acceptablePriceChangeFromAmount
        );

        const amountPlusPercent = this.to.tokenAmount.multipliedBy(
            acceptablePriceChange.dividedBy(100).plus(1)
        );
        const amountMinusPercent = this.to.tokenAmount.multipliedBy(
            new BigNumber(1).minus(acceptablePriceChange.dividedBy(100))
        );

        if (amountPlusPercent.lt(newAmount) || amountMinusPercent.gt(newAmount)) {
            const newTo = await PriceTokenAmount.createFromToken({
                ...this.to,
                tokenAmount: newAmount
            });
            throw new UpdatedRatesError(
                new DebridgeCrossChainTrade(
                    {
                        from: this.from,
                        to: newTo,
                        transactionRequest: this.transactionRequest,
                        gasData: this.gasData,
                        priceImpact: this.from.calculatePriceImpactPercent(newTo),
                        allowanceTarget: this.allowanceTarget,
                        slippage: 0,
                        feeInfo: this.feeInfo,
                        transitAmount: this.transitAmount,
                        maxTheoreticalAmount: this.maxTheoreticalAmount,
                        cryptoFeeToken: this.cryptoFeeToken,
                        onChainTrade: null
                    },
                    this.providerAddress
                )
            );
        }
    }
}
