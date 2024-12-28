import BigNumber from 'bignumber.js';
import { FailedToCheckForTransactionReceiptError, RubicSdkError } from 'src/common/errors';
import { PriceTokenAmount } from 'src/common/tokens';
import { BlockchainName, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { EvmWeb3Private } from 'src/core/blockchain/web3-private-service/web3-private/evm-web3-private/evm-web3-private';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';
import { Injector } from 'src/core/injector/injector';
import { ContractParams } from 'src/features/common/models/contract-params';
import { SwapTransactionOptions } from 'src/features/common/models/swap-transaction-options';
import { getFromWithoutFee } from 'src/features/common/utils/get-from-without-fee';

import { CROSS_CHAIN_TRADE_TYPE } from '../../models/cross-chain-trade-type';
import { rubicProxyContractAddress } from '../common/constants/rubic-proxy-contract-address';
import { evmCommonCrossChainAbi } from '../common/evm-cross-chain-trade/constants/evm-common-cross-chain-abi';
import { gatewayRubicCrossChainAbi } from '../common/evm-cross-chain-trade/constants/gateway-rubic-cross-chain-abi';
import { EvmCrossChainTrade } from '../common/evm-cross-chain-trade/evm-cross-chain-trade';
import { GasData } from '../common/evm-cross-chain-trade/models/gas-data';
import { BRIDGE_TYPE } from '../common/models/bridge-type';
import { FeeInfo } from '../common/models/fee-info';
import { GetContractParamsOptions } from '../common/models/get-contract-params-options';
import { OnChainSubtype } from '../common/models/on-chain-subtype';
import { RubicStep } from '../common/models/rubicStep';
import { TradeInfo } from '../common/models/trade-info';
import { ProxyCrossChainEvmTrade } from '../common/proxy-cross-chain-evm-facade/proxy-cross-chain-evm-trade';
import { StargateV2BridgeToken } from './constants/stargate-v2-bridge-token';
import { stargateV2ContractAddress } from './constants/stargate-v2-contract-address';
import { StargateV2SupportedBlockchains } from './constants/stargate-v2-cross-chain-supported-blockchains';
import { stargateV2SendTokenAbi } from './constants/stargate-v2-pool-abi';
import { stargateV2TokenAddress } from './constants/stargate-v2-token-address';
import {
    StargateV2MessagingFee,
    StargateV2QuoteParamsStruct
} from './modal/stargate-v2-quote-params-struct';

export class StargateV2CrossChainTrade extends EvmCrossChainTrade {
    protected get methodName(): string {
        return 'startBridgeTokensViaGenericCrossChain';
    }

    protected get web3Private(): EvmWeb3Private {
        return Injector.web3PrivateService.getWeb3PrivateByBlockchain(this.from.blockchain);
    }

    public readonly from: PriceTokenAmount<EvmBlockchainName>;

    public readonly to: PriceTokenAmount<BlockchainName>;

    public readonly feeInfo: FeeInfo;

    public readonly type = CROSS_CHAIN_TRADE_TYPE.STARGATE_V2;

    public readonly gasData: GasData;

    public readonly toTokenAmountMin: BigNumber;

    public readonly isAggregator = false;

    public readonly slippageTolerance: number;

    public readonly priceImpact: number | null;

    public readonly onChainSubtype: OnChainSubtype = { from: undefined, to: undefined };

    public readonly bridgeType = BRIDGE_TYPE.STARGATE_V2;

    public readonly messagingFee: StargateV2MessagingFee;

    private readonly fromTokenAddress: string;

    private readonly fromWithoutFee: PriceTokenAmount<EvmBlockchainName>;

    public get fromBlockchain(): StargateV2SupportedBlockchains {
        return this.from.blockchain as StargateV2SupportedBlockchains;
    }

    protected get fromContractAddress(): string {
        const fromTokenSymbol = stargateV2TokenAddress[
            this.from.blockchain as StargateV2SupportedBlockchains
        ][this.fromTokenAddress] as StargateV2BridgeToken;
        return this.isProxyTrade
            ? rubicProxyContractAddress[this.fromBlockchain].gateway
            : (stargateV2ContractAddress?.[this.fromBlockchain]?.[fromTokenSymbol] as string);
    }

    private readonly stargateV2SendParams: StargateV2QuoteParamsStruct;

    constructor(
        crossChainTrade: {
            from: PriceTokenAmount<EvmBlockchainName>;
            to: PriceTokenAmount<EvmBlockchainName>;
            slippageTolerance: number;
            gasData: GasData | null;
            feeInfo: FeeInfo;
            sendParams: StargateV2QuoteParamsStruct;
            messagingFee: StargateV2MessagingFee;
            priceImpact: number | null;
            toTokenAmountMin: BigNumber;
        },
        providerAddress: string,
        routePath: RubicStep[],
        useProxy: boolean
    ) {
        super(providerAddress, routePath, useProxy);
        this.from = crossChainTrade.from;
        this.to = crossChainTrade.to;
        this.feeInfo = crossChainTrade.feeInfo;
        this.gasData = crossChainTrade.gasData;
        this.slippageTolerance = crossChainTrade.slippageTolerance;
        this.stargateV2SendParams = crossChainTrade.sendParams;
        this.messagingFee = crossChainTrade.messagingFee;
        this.priceImpact = crossChainTrade.priceImpact;
        this.toTokenAmountMin = crossChainTrade.toTokenAmountMin;
        this.fromTokenAddress = this.from.address.toLowerCase();
        this.fromWithoutFee = getFromWithoutFee(
            this.from,
            this.feeInfo.rubicProxy?.platformFee?.percent
        );
    }

    protected async getContractParams(options: GetContractParamsOptions): Promise<ContractParams> {
        const {
            data,
            value: providerValue,
            to
        } = await this.setTransactionConfig(
            false,
            options?.useCacheData || false,
            options?.receiverAddress
        );
        try {
            const bridgeData = ProxyCrossChainEvmTrade.getBridgeData(
                { ...options },
                {
                    walletAddress: this.walletAddress,
                    fromTokenAmount: this.from,
                    toTokenAmount: this.to,
                    toAddress: undefined,
                    srcChainTrade: null,
                    providerAddress: this.providerAddress,
                    type: `native:${this.type}`,
                    fromAddress: this.walletAddress
                }
            );

            const extraNativeFee = this.from.isNative
                ? new BigNumber(providerValue).minus(this.fromWithoutFee.stringWeiAmount).toFixed()
                : new BigNumber(providerValue).toFixed();

            const providerData = await ProxyCrossChainEvmTrade.getGenericProviderData(
                to,
                data,
                this.fromBlockchain as EvmBlockchainName,
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
        } catch (err) {
            console.log(err?.message);
            throw err;
        }
    }

    protected async getTransactionConfigAndAmount(
        _receiverAddress?: string | undefined
    ): Promise<{ config: EvmEncodeConfig; amount: string }> {
        const fromBlockchain = this.from.blockchain as StargateV2SupportedBlockchains;
        const fromTokenSymbol = stargateV2TokenAddress[fromBlockchain][
            this.fromTokenAddress
        ] as StargateV2BridgeToken;
        const contractAddress = stargateV2ContractAddress?.[fromBlockchain]?.[fromTokenSymbol];
        if (!contractAddress) {
            throw new RubicSdkError();
        }
        const nativeFee = new BigNumber(this.messagingFee.nativeFee);

        const value = this.from.isNative
            ? new BigNumber(this.fromWithoutFee.stringWeiAmount).plus(nativeFee).toFixed()
            : this.messagingFee.nativeFee;
        const calldata = await EvmWeb3Pure.encodeMethodCall(
            contractAddress,
            stargateV2SendTokenAbi,
            'sendToken',
            [this.stargateV2SendParams, this.messagingFee, this.walletAddress],
            value
        );
        return {
            config: calldata,
            amount: this.to.stringWeiAmount
        };
    }

    protected async swapDirect(options: SwapTransactionOptions = {}): Promise<string> {
        this.checkWalletConnected();
        await this.checkTradeErrors();
        await this.checkAllowanceAndApprove(options);
        const { onConfirm, gasLimit, gasPriceOptions } = options;
        let transactionHash: string;
        const onTransactionHash = (hash: string) => {
            if (onConfirm) {
                onConfirm(hash);
            }
            transactionHash = hash;
        };

        try {
            const { data, value, to } = await this.setTransactionConfig(
                false,
                options?.useCacheData || false,
                options?.receiverAddress
            );

            await this.web3Private.trySendTransaction(to, {
                data,
                value,
                onTransactionHash,
                gas: gasLimit,
                gasPriceOptions
            });

            return transactionHash!;
        } catch (err) {
            if (err instanceof FailedToCheckForTransactionReceiptError) {
                return transactionHash!;
            }
            throw err;
        }
    }

    public getTradeAmountRatio(fromUsd: BigNumber): BigNumber {
        return fromUsd.dividedBy(this.to.tokenAmount);
    }

    public getTradeInfo(): TradeInfo {
        return {
            estimatedGas: this.estimatedGas,
            feeInfo: this.feeInfo,
            priceImpact: this.priceImpact,
            slippage: this.slippageTolerance * 100,
            routePath: this.routePath
        };
    }
}
