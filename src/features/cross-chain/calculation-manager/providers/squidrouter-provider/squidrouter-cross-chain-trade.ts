import BigNumber from 'bignumber.js';
import { FailedToCheckForTransactionReceiptError, TimeoutError } from 'src/common/errors';
import { PriceTokenAmount } from 'src/common/tokens';
import { parseError } from 'src/common/utils/errors';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';
import { Injector } from 'src/core/injector/injector';
import { ContractParams } from 'src/features/common/models/contract-params';
import { SwapTransactionOptions } from 'src/features/common/models/swap-transaction-options';
import { SquidrouterTransactionRequest } from 'src/features/common/providers/squidrouter/models/transaction-request';
import { SquidRouterApiService } from 'src/features/common/providers/squidrouter/services/squidrouter-api-service';
import { getFromWithoutFee } from 'src/features/common/utils/get-from-without-fee';
import { CROSS_CHAIN_TRADE_TYPE } from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { rubicProxyContractAddress } from 'src/features/cross-chain/calculation-manager/providers/common/constants/rubic-proxy-contract-address';
import { evmCommonCrossChainAbi } from 'src/features/cross-chain/calculation-manager/providers/common/evm-cross-chain-trade/constants/evm-common-cross-chain-abi';
import { gatewayRubicCrossChainAbi } from 'src/features/cross-chain/calculation-manager/providers/common/evm-cross-chain-trade/constants/gateway-rubic-cross-chain-abi';
import { EvmCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/common/evm-cross-chain-trade/evm-cross-chain-trade';
import { GasData } from 'src/features/cross-chain/calculation-manager/providers/common/evm-cross-chain-trade/models/gas-data';
import { BRIDGE_TYPE } from 'src/features/cross-chain/calculation-manager/providers/common/models/bridge-type';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { GetContractParamsOptions } from 'src/features/cross-chain/calculation-manager/providers/common/models/get-contract-params-options';
import { OnChainSubtype } from 'src/features/cross-chain/calculation-manager/providers/common/models/on-chain-subtype';
import { RubicStep } from 'src/features/cross-chain/calculation-manager/providers/common/models/rubicStep';
import { TradeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/trade-info';
import { ProxyCrossChainEvmTrade } from 'src/features/cross-chain/calculation-manager/providers/common/proxy-cross-chain-evm-facade/proxy-cross-chain-evm-trade';
import { SquidrouterContractAddress } from 'src/features/cross-chain/calculation-manager/providers/squidrouter-provider/constants/squidrouter-contract-address';
import { SquidrouterCrossChainSupportedBlockchain } from 'src/features/cross-chain/calculation-manager/providers/squidrouter-provider/constants/squidrouter-cross-chain-supported-blockchain';
import { getCrossChainGasData } from 'src/features/cross-chain/calculation-manager/utils/get-cross-chain-gas-data';
import { EvmOnChainTrade } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/evm-on-chain-trade';

/**
 * Calculated DeBridge cross-chain trade.
 */
export class SquidrouterCrossChainTrade extends EvmCrossChainTrade {
    /** @internal */
    private readonly cryptoFeeToken: PriceTokenAmount;

    private readonly slippage: number;

    private readonly onChainTrade: EvmOnChainTrade | null;

    private readonly transactionRequest: SquidrouterTransactionRequest;

    public squidrouterRequestId: string | undefined;

    /** @internal */
    public static async getGasData(
        from: PriceTokenAmount<EvmBlockchainName>,
        toToken: PriceTokenAmount<EvmBlockchainName>,
        transactionRequest: SquidrouterTransactionRequest,
        feeInfo: FeeInfo,
        receiverAddress: string,
        providerAddress: string
    ): Promise<GasData | null> {
        const fromBlockchain = from.blockchain as SquidrouterCrossChainSupportedBlockchain;
        const walletAddress =
            Injector.web3PrivateService.getWeb3PrivateByBlockchain(fromBlockchain).address;
        if (!walletAddress) {
            return null;
        }

        try {
            const trade = new SquidrouterCrossChainTrade(
                {
                    from,
                    to: toToken,
                    gasData: null,
                    priceImpact: 0,
                    allowanceTarget: '',
                    slippage: 0,
                    feeInfo,
                    cryptoFeeToken: from,
                    onChainTrade: null,
                    onChainSubtype: { from: undefined, to: undefined },
                    transactionRequest
                },
                providerAddress || EvmWeb3Pure.EMPTY_ADDRESS,
                [],
                false
            );

            return getCrossChainGasData(trade, receiverAddress);
        } catch (_err) {
            return null;
        }
    }

    public readonly type = CROSS_CHAIN_TRADE_TYPE.SQUIDROUTER;

    public readonly isAggregator = false;

    public readonly onChainSubtype: OnChainSubtype = {
        from: undefined,
        to: undefined
    };

    public readonly bridgeType = BRIDGE_TYPE.SQUIDROUTER;

    public readonly from: PriceTokenAmount<EvmBlockchainName>;

    public readonly to: PriceTokenAmount<EvmBlockchainName>;

    public readonly toTokenAmountMin: BigNumber;

    public readonly priceImpact: number | null;

    public readonly allowanceTarget: string;

    public readonly gasData: GasData | null;

    private get fromBlockchain(): SquidrouterCrossChainSupportedBlockchain {
        return this.from.blockchain as SquidrouterCrossChainSupportedBlockchain;
    }

    protected get fromContractAddress(): string {
        return this.isProxyTrade
            ? rubicProxyContractAddress[this.fromBlockchain].gateway
            : SquidrouterContractAddress[this.fromBlockchain].providerGateway;
    }

    public readonly feeInfo: FeeInfo;

    protected get methodName(): string {
        return 'startBridgeTokensViaGenericCrossChain';
    }

    private readonly creationTimestamp: number;

    private readonly timeLimitMs: number = 25 * 1_000;

    constructor(
        crossChainTrade: {
            from: PriceTokenAmount<EvmBlockchainName>;
            to: PriceTokenAmount<EvmBlockchainName>;
            gasData: GasData | null;
            priceImpact: number | null;
            allowanceTarget: string;
            slippage: number;
            feeInfo: FeeInfo;
            cryptoFeeToken: PriceTokenAmount;
            onChainTrade: EvmOnChainTrade | null;
            onChainSubtype: OnChainSubtype;
            transactionRequest: SquidrouterTransactionRequest;
        },
        providerAddress: string,
        routePath: RubicStep[],
        useProxy: boolean
    ) {
        super(providerAddress, routePath, useProxy);

        this.creationTimestamp = Date.now();
        this.from = crossChainTrade.from;
        this.to = crossChainTrade.to;
        this.gasData = crossChainTrade.gasData;
        this.priceImpact = crossChainTrade.priceImpact;
        this.allowanceTarget = crossChainTrade.allowanceTarget;
        this.slippage = crossChainTrade.slippage;
        this.onChainTrade = crossChainTrade.onChainTrade;
        this.toTokenAmountMin = this.to.tokenAmount.multipliedBy(1 - crossChainTrade.slippage);
        this.feeInfo = crossChainTrade.feeInfo;
        this.cryptoFeeToken = crossChainTrade.cryptoFeeToken;
        this.onChainSubtype = crossChainTrade.onChainSubtype;
        this.transactionRequest = crossChainTrade.transactionRequest;
    }

    protected async swapDirect(options: SwapTransactionOptions = {}): Promise<string | never> {
        this.checkWalletConnected();
        await this.checkAllowanceAndApprove(options);
        let transactionHash: string;

        try {
            const { data, value, to } = await this.setTransactionConfig(
                false,
                options?.useCacheData || false,
                options?.receiverAddress || this.walletAddress
            );

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
                gasPriceOptions: options.gasPriceOptions
            });

            return transactionHash!;
        } catch (err) {
            if (err instanceof FailedToCheckForTransactionReceiptError) {
                return transactionHash!;
            }
            throw parseError(err);
        }
    }

    public async getContractParams(options: GetContractParamsOptions): Promise<ContractParams> {
        const {
            data,
            value: providerValue,
            to
        } = await this.setTransactionConfig(
            false,
            options?.useCacheData || false,
            options?.receiverAddress || this.walletAddress
        );

        const bridgeData = ProxyCrossChainEvmTrade.getBridgeData(options, {
            walletAddress: this.walletAddress,
            fromTokenAmount: this.from,
            toTokenAmount: this.to,
            srcChainTrade: this.onChainTrade,
            providerAddress: this.providerAddress,
            type: `native:${this.type}`,
            fromAddress: this.walletAddress
        });

        const fromWithoutFee = getFromWithoutFee(
            this.from,
            this.feeInfo.rubicProxy?.platformFee?.percent
        );
        const extraNativeFee = this.from.isNative
            ? new BigNumber(providerValue).minus(fromWithoutFee.stringWeiAmount).toFixed()
            : new BigNumber(providerValue).toFixed();

        const providerData = await ProxyCrossChainEvmTrade.getGenericProviderData(
            to,
            data!,
            this.fromBlockchain,
            to,
            extraNativeFee
        );

        const methodArguments = [bridgeData, providerData];

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
        return fromUsd.plus(usdCryptoFee.isNaN() ? 0 : usdCryptoFee).dividedBy(this.to.tokenAmount);
    }

    public getTradeInfo(): TradeInfo {
        return {
            estimatedGas: this.estimatedGas,
            feeInfo: this.feeInfo,
            priceImpact: this.priceImpact ?? null,
            slippage: this.slippage * 100,
            routePath: this.routePath
        };
    }

    protected async getTransactionConfigAndAmount(
        receiverAddress: string
    ): Promise<{ config: EvmEncodeConfig; amount: string }> {
        const currentTimestamp = Date.now();
        const spentTime = currentTimestamp - this.creationTimestamp;
        if (spentTime > this.timeLimitMs) {
            throw new TimeoutError(
                `Coral trade lives only 25 seconds from creation. Already spent ${
                    spentTime / 1000
                } seconds.`
            );
        }

        const requestParams: SquidrouterTransactionRequest = {
            ...this.transactionRequest,
            toAddress: receiverAddress
        };

        const res = await SquidRouterApiService.getRoute(requestParams);
        this.squidrouterRequestId = res['x-request-id'];

        const route = res.route;

        return {
            config: {
                data: route.transactionRequest.data,
                value: route.transactionRequest.value,
                to: route.transactionRequest.target
            },
            amount: route.estimate.toAmount
        };
    }
}
