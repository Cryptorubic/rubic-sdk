import BigNumber from 'bignumber.js';
import { PriceTokenAmount } from 'src/common/tokens';
import {
    BLOCKCHAIN_NAME,
    EvmBlockchainName,
    TronBlockchainName
} from 'src/core/blockchain/models/blockchain-name';
import { BlockchainsInfo } from 'src/core/blockchain/utils/blockchains-info/blockchains-info';
import { TronWeb3Public } from 'src/core/blockchain/web3-public-service/web3-public/tron-web3-public/tron-web3-public';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';
import { TronWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/tron-web3-pure/tron-web3-pure';
import { Injector } from 'src/core/injector/injector';
import { ContractParams } from 'src/features/common/models/contract-params';
import { EncodeTransactionOptions } from 'src/features/common/models/encode-transaction-options';
import { SwapTransactionOptions } from 'src/features/common/models/swap-transaction-options';
import { bridgersContractAddresses } from 'src/features/common/providers/bridgers/models/bridgers-contract-addresses';
import { getFromWithoutFee } from 'src/features/common/utils/get-from-without-fee';
import { CROSS_CHAIN_TRADE_TYPE } from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { BridgersEvmCrossChainSupportedBlockchain } from 'src/features/cross-chain/calculation-manager/providers/bridgers-provider/constants/bridgers-cross-chain-supported-blockchain';
import { EvmBridgersTransactionData } from 'src/features/cross-chain/calculation-manager/providers/bridgers-provider/evm-bridgers-trade/models/evm-bridgers-transaction-data';
import { getProxyMethodArgumentsAndTransactionData } from 'src/features/cross-chain/calculation-manager/providers/bridgers-provider/utils/get-proxy-method-arguments-and-transaction-data';
import { rubicProxyContractAddress } from 'src/features/cross-chain/calculation-manager/providers/common/constants/rubic-proxy-contract-address';
import { evmCommonCrossChainAbi } from 'src/features/cross-chain/calculation-manager/providers/common/evm-cross-chain-trade/constants/evm-common-cross-chain-abi';
import { gatewayRubicCrossChainAbi } from 'src/features/cross-chain/calculation-manager/providers/common/evm-cross-chain-trade/constants/gateway-rubic-cross-chain-abi';
import { EvmCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/common/evm-cross-chain-trade/evm-cross-chain-trade';
import { GasData } from 'src/features/cross-chain/calculation-manager/providers/common/evm-cross-chain-trade/models/gas-data';
import { BRIDGE_TYPE } from 'src/features/cross-chain/calculation-manager/providers/common/models/bridge-type';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { GetContractParamsOptions } from 'src/features/cross-chain/calculation-manager/providers/common/models/get-contract-params-options';
import { RubicStep } from 'src/features/cross-chain/calculation-manager/providers/common/models/rubicStep';
import { TradeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/trade-info';
import { ProxyCrossChainEvmTrade } from 'src/features/cross-chain/calculation-manager/providers/common/proxy-cross-chain-evm-facade/proxy-cross-chain-evm-trade';
import { getCrossChainGasData } from 'src/features/cross-chain/calculation-manager/utils/get-cross-chain-gas-data';
import { MarkRequired } from 'ts-essentials';

export class EvmBridgersCrossChainTrade extends EvmCrossChainTrade {
    /** @internal */
    public static async getGasData(
        from: PriceTokenAmount<BridgersEvmCrossChainSupportedBlockchain>,
        to: PriceTokenAmount<TronBlockchainName>,
        receiverAddress: string,
        providerAddress: string,
        feeInfo: FeeInfo
    ): Promise<GasData | null> {
        const trade = new EvmBridgersCrossChainTrade(
            {
                from,
                to,
                toTokenAmountMin: new BigNumber(0),
                feeInfo,
                gasData: null,
                slippage: 0
            },
            providerAddress || EvmWeb3Pure.EMPTY_ADDRESS,
            [],
            false
        );

        return getCrossChainGasData(trade, receiverAddress);
    }

    private get tronWeb3Public(): TronWeb3Public {
        return Injector.web3PublicService.getWeb3Public(BLOCKCHAIN_NAME.TRON);
    }

    public readonly type = CROSS_CHAIN_TRADE_TYPE.BRIDGERS;

    public readonly isAggregator = false;

    public readonly from: PriceTokenAmount<BridgersEvmCrossChainSupportedBlockchain>;

    public readonly to: PriceTokenAmount<TronBlockchainName>;

    public readonly toTokenAmountMin: BigNumber;

    public readonly gasData: GasData;

    public readonly feeInfo: FeeInfo;

    public readonly onChainSubtype = { from: undefined, to: undefined };

    public readonly bridgeType = BRIDGE_TYPE.BRIDGERS;

    public readonly priceImpact: number | null;

    private readonly slippage: number;

    protected get fromContractAddress(): string {
        return this.isProxyTrade
            ? rubicProxyContractAddress[this.from.blockchain].gateway
            : bridgersContractAddresses[this.from.blockchain];
    }

    protected get methodName(): string {
        return 'startBridgeTokensViaGenericCrossChain';
    }

    constructor(
        crossChainTrade: {
            from: PriceTokenAmount<BridgersEvmCrossChainSupportedBlockchain>;
            to: PriceTokenAmount<TronBlockchainName>;
            toTokenAmountMin: BigNumber;
            feeInfo: FeeInfo;
            gasData: GasData;
            slippage: number;
        },
        providerAddress: string,
        routePath: RubicStep[],
        useProxy: boolean
    ) {
        super(providerAddress, routePath, useProxy);

        this.from = crossChainTrade.from;
        this.to = crossChainTrade.to;
        this.toTokenAmountMin = crossChainTrade.toTokenAmountMin;
        this.feeInfo = crossChainTrade.feeInfo;
        this.gasData = crossChainTrade.gasData;
        this.priceImpact = this.from.calculatePriceImpactPercent(this.to);
        this.slippage = crossChainTrade.slippage;
    }

    protected override async swapDirect(
        options: MarkRequired<SwapTransactionOptions, 'receiverAddress'>
    ): Promise<string | never> {
        await this.checkTradeErrors();
        await this.checkReceiverAddress(options.receiverAddress, true);

        await this.checkAllowanceAndApprove(options);

        const { onConfirm, gasPriceOptions } = options;
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
                await getProxyMethodArgumentsAndTransactionData<EvmBridgersTransactionData>(
                    this.from,
                    fromWithoutFee,
                    this.to,
                    this.toTokenAmountMin,
                    this.walletAddress,
                    this.providerAddress,
                    options,
                    this.checkAmountChange
                );

            await this.web3Private.trySendTransaction(transactionData.to, {
                data: transactionData.data,
                value: transactionData.value,
                onTransactionHash,
                gasPriceOptions
            });

            return transactionHash!;
        } catch (err) {
            throw err;
        }
    }

    public async encode(
        options: MarkRequired<EncodeTransactionOptions, 'receiverAddress'>
    ): Promise<EvmEncodeConfig> {
        return super.encode(options);
    }

    protected async getContractParams(
        options: MarkRequired<GetContractParamsOptions, 'receiverAddress'>
    ): Promise<ContractParams> {
        const {
            data,
            value: providerValue,
            to
        } = await this.setTransactionConfig(
            false,
            options?.useCacheData || false,
            options?.receiverAddress
        );

        const isEvmDestination = BlockchainsInfo.isEvmBlockchainName(this.to.blockchain);
        let receiverAddress = isEvmDestination
            ? options.receiverAddress || this.walletAddress
            : options.receiverAddress;
        let toAddress = this.to.address;

        if (this.to.blockchain === BLOCKCHAIN_NAME.TRON) {
            receiverAddress = TronWeb3Pure.addressToHex(receiverAddress);
            toAddress = TronWeb3Pure.addressToHex(toAddress);
        }

        const bridgeData = ProxyCrossChainEvmTrade.getBridgeData(
            { ...options, receiverAddress },
            {
                walletAddress: this.walletAddress,
                fromTokenAmount: this.from,
                toTokenAmount: this.to,
                toAddress,
                srcChainTrade: null,
                providerAddress: this.providerAddress,
                type: `native:${this.type}`,
                fromAddress: this.walletAddress
            }
        );

        const providerData = await ProxyCrossChainEvmTrade.getGenericProviderData(
            to!,
            data! as string,
            this.from.blockchain as EvmBlockchainName,
            to,
            '0'
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
        return fromUsd.dividedBy(this.to.tokenAmount);
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
        receiverAddress?: string
    ): Promise<{ config: EvmBridgersTransactionData; amount: string }> {
        const fromWithoutFee = getFromWithoutFee(
            this.from,
            this.feeInfo.rubicProxy?.platformFee?.percent
        );
        const { transactionData: config, amountOut: amount } =
            await getProxyMethodArgumentsAndTransactionData<EvmBridgersTransactionData>(
                this.from,
                fromWithoutFee,
                this.to,
                this.toTokenAmountMin,
                this.walletAddress,
                this.providerAddress,
                { receiverAddress: receiverAddress! },
                this.checkAmountChange
            );

        return { config, amount };
    }
}
