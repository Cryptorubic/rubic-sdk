import BigNumber from 'bignumber.js';
import { PriceTokenAmount } from 'src/common/tokens';
import { TronBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { TronWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/tron-web3-pure/tron-web3-pure';
import { SwapTransactionOptions } from 'src/features/common/models/swap-transaction-options';
import { getFromWithoutFee } from 'src/features/common/utils/get-from-without-fee';
import { CROSS_CHAIN_TRADE_TYPE } from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { BridgersEvmCrossChainSupportedBlockchain } from 'src/features/cross-chain/calculation-manager/providers/bridgers-provider/constants/bridgers-cross-chain-supported-blockchain';
import { TronBridgersTransactionData } from 'src/features/cross-chain/calculation-manager/providers/bridgers-provider/tron-bridgers-trade/models/tron-bridgers-transaction-data';
import { getMethodArgumentsAndTransactionData } from 'src/features/cross-chain/calculation-manager/providers/bridgers-provider/utils/get-method-arguments-and-transaction-data';
import { BRIDGE_TYPE } from 'src/features/cross-chain/calculation-manager/providers/common/models/bridge-type';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { RubicStep } from 'src/features/cross-chain/calculation-manager/providers/common/models/rubicStep';
import { TradeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/trade-info';
import { tronCommonCrossChainAbi } from 'src/features/cross-chain/calculation-manager/providers/common/tron-cross-chain-trade/constants/tron-common-cross-chain-abi';
import { tronNativeSwapAbi } from 'src/features/cross-chain/calculation-manager/providers/common/tron-cross-chain-trade/constants/tron-native-swap-abi';
import { TronContractParams } from 'src/features/cross-chain/calculation-manager/providers/common/tron-cross-chain-trade/models/tron-contract-params';
import { TronGetContractParamsOptions } from 'src/features/cross-chain/calculation-manager/providers/common/tron-cross-chain-trade/models/tron-get-contract-params-options';
import { TronCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/common/tron-cross-chain-trade/tron-cross-chain-trade';
import { MarkRequired } from 'ts-essentials';

export class TronBridgersCrossChainTrade extends TronCrossChainTrade {
    public readonly type = CROSS_CHAIN_TRADE_TYPE.BRIDGERS;

    public readonly isAggregator = false;

    public readonly from: PriceTokenAmount<TronBlockchainName>;

    public readonly to: PriceTokenAmount<BridgersEvmCrossChainSupportedBlockchain>;

    public readonly toTokenAmountMin: BigNumber;

    public readonly feeInfo: FeeInfo;

    public readonly onChainSubtype = { from: undefined, to: undefined };

    public readonly bridgeType = BRIDGE_TYPE.BRIDGERS;

    public readonly priceImpact: number | null;

    private readonly slippage: number;

    private readonly contractAddress: string;

    protected get fromContractAddress(): string {
        // return rubicProxyContractAddress[this.from.blockchain];
        return this.contractAddress;
    }

    protected get methodName(): string {
        return '';
    }

    constructor(
        crossChainTrade: {
            from: PriceTokenAmount<TronBlockchainName>;
            to: PriceTokenAmount<BridgersEvmCrossChainSupportedBlockchain>;
            toTokenAmountMin: BigNumber;
            feeInfo: FeeInfo;
            slippage: number;
            contractAddress: string;
        },
        providerAddress: string,
        routePath: RubicStep[]
    ) {
        super(providerAddress, routePath);

        this.from = crossChainTrade.from;
        this.to = crossChainTrade.to;
        this.toTokenAmountMin = crossChainTrade.toTokenAmountMin;
        this.feeInfo = crossChainTrade.feeInfo;
        this.priceImpact = this.from.calculatePriceImpactPercent(this.to);
        this.slippage = crossChainTrade.slippage;
        this.contractAddress = crossChainTrade.contractAddress;
    }

    public async swap(
        options: MarkRequired<SwapTransactionOptions, 'receiverAddress'>
    ): Promise<string | never> {
        return this.swapDirect(options);
    }

    private async swapDirect(
        options: MarkRequired<SwapTransactionOptions, 'receiverAddress'>
    ): Promise<string | never> {
        await this.checkTradeErrors();
        await this.checkReceiverAddress(options.receiverAddress, true);
        await this.checkAllowanceAndApprove(options);

        const { onConfirm } = options;
        let transactionHash: string;
        const onTransactionHash = (hash: string) => {
            if (onConfirm) {
                onConfirm(hash);
            }
            transactionHash = hash;
        };

        // eslint-disable-next-line no-useless-catch
        try {
            const fromWithoutFee = getFromWithoutFee(
                this.from,
                this.feeInfo.rubicProxy?.platformFee?.percent
            );

            const { transactionData } =
                await getMethodArgumentsAndTransactionData<TronBridgersTransactionData>(
                    this.from,
                    fromWithoutFee,
                    this.to,
                    this.toTokenAmountMin,
                    this.walletAddress,
                    this.providerAddress,
                    options
                );

            await this.web3Private.executeContractMethod(
                transactionData.to,
                tronNativeSwapAbi,
                this.from.isNative ? 'swapEth' : 'swap',
                transactionData.parameter.map(el => el.value),
                {
                    onTransactionHash,
                    callValue: transactionData.options.callValue,
                    feeLimit: transactionData.options.feeLimit
                }
            );

            return transactionHash!;
        } catch (err) {
            throw err;
        }
    }

    protected async getContractParams(
        options: TronGetContractParamsOptions
    ): Promise<TronContractParams> {
        const fromWithoutFee = getFromWithoutFee(
            this.from,
            this.feeInfo.rubicProxy?.platformFee?.percent
        );
        const { methodArguments, transactionData } =
            await getMethodArgumentsAndTransactionData<TronBridgersTransactionData>(
                this.from,
                fromWithoutFee,
                this.to,
                this.toTokenAmountMin,
                this.walletAddress,
                this.providerAddress,
                options
            );

        const encodedData = TronWeb3Pure.encodeMethodSignature(
            transactionData.functionName,
            transactionData.parameter
        );
        methodArguments.push(encodedData);

        const value = this.getSwapValue(transactionData.options.callValue);
        const { feeLimit } = transactionData.options;

        return {
            contractAddress: this.fromContractAddress,
            contractAbi: tronCommonCrossChainAbi,
            methodName: this.methodName,
            methodArguments,
            value,
            feeLimit
        };
    }

    public getTradeAmountRatio(fromUsd: BigNumber): BigNumber {
        return fromUsd.dividedBy(this.to.tokenAmount);
    }

    public getUsdPrice(): BigNumber {
        return this.from.price.multipliedBy(this.from.tokenAmount);
    }

    public getTradeInfo(): TradeInfo {
        return {
            estimatedGas: null,
            feeInfo: this.feeInfo,
            priceImpact: this.priceImpact ?? null,
            slippage: this.slippage * 100,
            routePath: this.routePath
        };
    }
}
