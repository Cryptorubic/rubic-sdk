import BigNumber from 'bignumber.js';
import { PriceTokenAmount } from 'src/common/tokens';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';
import { ContractParams } from 'src/features/common/models/contract-params';
import {
    CROSS_CHAIN_TRADE_TYPE,
    CrossChainTradeType
} from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { rubicProxyContractAddress } from 'src/features/cross-chain/calculation-manager/providers/common/constants/rubic-proxy-contract-address';
import { evmCommonCrossChainAbi } from 'src/features/cross-chain/calculation-manager/providers/common/evm-cross-chain-trade/constants/evm-common-cross-chain-abi';
import { gatewayRubicCrossChainAbi } from 'src/features/cross-chain/calculation-manager/providers/common/evm-cross-chain-trade/constants/gateway-rubic-cross-chain-abi';
import { EvmCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/common/evm-cross-chain-trade/evm-cross-chain-trade';
import { GasData } from 'src/features/cross-chain/calculation-manager/providers/common/evm-cross-chain-trade/models/gas-data';
import {
    BRIDGE_TYPE,
    BridgeType
} from 'src/features/cross-chain/calculation-manager/providers/common/models/bridge-type';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { GetContractParamsOptions } from 'src/features/cross-chain/calculation-manager/providers/common/models/get-contract-params-options';
import { OnChainSubtype } from 'src/features/cross-chain/calculation-manager/providers/common/models/on-chain-subtype';
import { TradeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/trade-info';
import { ProxyCrossChainEvmTrade } from 'src/features/cross-chain/calculation-manager/providers/common/proxy-cross-chain-evm-facade/proxy-cross-chain-evm-trade';
import { ORBITER_ROUTER_V3_ABI } from 'src/features/cross-chain/calculation-manager/providers/orbiter-bridge/constants/orbiter-router-v3-abi';
import { OrbiterQuoteConfig } from 'src/features/cross-chain/calculation-manager/providers/orbiter-bridge/models/orbiter-api-quote-types';
import { OrbiterEvmTradeParams } from 'src/features/cross-chain/calculation-manager/providers/orbiter-bridge/models/orbiter-bridge-trade-types';
import { orbiterContractAddresses } from 'src/features/cross-chain/calculation-manager/providers/orbiter-bridge/models/orbiter-contract-addresses';
import { OrbiterSupportedBlockchain } from 'src/features/cross-chain/calculation-manager/providers/orbiter-bridge/models/orbiter-supported-blockchains';
import { OrbiterUtils } from 'src/features/cross-chain/calculation-manager/providers/orbiter-bridge/services/orbiter-utils';
import { SymbiosisUtils } from 'src/features/cross-chain/calculation-manager/providers/symbiosis-provider/symbiosis-utils';

export class OrbiterEvmBridgeTrade extends EvmCrossChainTrade {
    /**ABSTRACT PROPS */
    public readonly type: CrossChainTradeType = CROSS_CHAIN_TRADE_TYPE.ORBITER_BRIDGE;

    public readonly isAggregator: boolean = false;

    public readonly to: PriceTokenAmount;

    public readonly from: PriceTokenAmount<EvmBlockchainName>;

    public readonly toTokenAmountMin: BigNumber;

    public readonly feeInfo: FeeInfo;

    public readonly onChainSubtype: OnChainSubtype = { from: undefined, to: undefined };

    public readonly bridgeType: BridgeType = BRIDGE_TYPE.ORBITER_BRIDGE;

    public readonly gasData: GasData;

    public readonly priceImpact: number | null;
    /** */

    /* used to get extraNativeFee(tradeFee) and orbiter contract params */
    private quoteConfig: OrbiterQuoteConfig;

    private get fromBlockchain(): OrbiterSupportedBlockchain {
        return this.from.blockchain as OrbiterSupportedBlockchain;
    }

    protected get fromContractAddress(): string {
        return this.isProxyTrade
            ? rubicProxyContractAddress[this.fromBlockchain].gateway
            : orbiterContractAddresses[this.fromBlockchain];
    }

    protected get methodName(): string {
        return 'startBridgeTokensViaGenericCrossChain';
    }

    constructor(params: OrbiterEvmTradeParams) {
        super(params.providerAddress, params.routePath, params.useProxy);
        this.to = params.crossChainTrade.to;
        this.from = params.crossChainTrade.from;
        this.toTokenAmountMin = params.crossChainTrade.toTokenAmountMin;
        this.feeInfo = params.crossChainTrade.feeInfo;
        this.gasData = params.crossChainTrade.gasData;
        this.priceImpact = params.crossChainTrade.priceImpact;
        this.quoteConfig = params.crossChainTrade.quoteConfig;
    }

    public async getContractParams(options: GetContractParamsOptions): Promise<ContractParams> {
        const receiverAddress = options?.receiverAddress || this.walletAddress;
        const {
            data,
            value: providerValue,
            to: providerRouter
        } = await this.setTransactionConfig(
            false,
            options?.useCacheData || false,
            options?.receiverAddress || this.walletAddress
        );

        const { receiverAddress: proxyReceiver, toAddress } = await SymbiosisUtils.getReceiver(
            this.from,
            this.to,
            this.walletAddress,
            options?.receiverAddress
        );

        const percentFee = (this.feeInfo.rubicProxy?.platformFee?.percent || 0) / 100;
        const fromWeiAmountWithHiddenCode = new BigNumber(
            OrbiterUtils.getFromAmountWithoutFeeWithCode(this.from, this.feeInfo, this.quoteConfig)
        )
            .dividedBy(1 - percentFee)
            .decimalPlaces(0, 1);
        const fromWithCode = new PriceTokenAmount({
            ...this.from.asStruct,
            weiAmount: fromWeiAmountWithHiddenCode
        });

        const bridgeData = ProxyCrossChainEvmTrade.getBridgeData(
            { ...options, receiverAddress: proxyReceiver },
            {
                walletAddress: receiverAddress,
                fromTokenAmount: this.from,
                toTokenAmount: this.to,
                srcChainTrade: null,
                providerAddress: this.providerAddress,
                type: `native:${this.bridgeType}`,
                fromAddress: this.walletAddress,
                toAddress
            }
        );

        const extraNativeFee = '0';
        const providerData = await ProxyCrossChainEvmTrade.getGenericProviderData(
            providerRouter,
            data,
            this.from.blockchain,
            providerRouter,
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

    protected async getTransactionConfigAndAmount(receiverAddress?: string): Promise<{
        config: EvmEncodeConfig;
        amount: string;
    }> {
        // Orbiter deposit address to send funds money to receiverWalletAddress after transfer confirmation
        const orbiterTokensDispenser = this.quoteConfig.endpoint;

        // const transferAmount = this.from.stringWeiAmount;

        const transferAmount = OrbiterUtils.getFromAmountWithoutFeeWithCode(
            this.from,
            this.feeInfo,
            this.quoteConfig
        );

        const encodedReceiverAndCode = OrbiterUtils.getHexDataArg(
            this.quoteConfig.vc,
            receiverAddress || this.walletAddress
        );

        const methodName = this.from.isNative ? 'transfer' : 'transferToken';
        const methodArgs = this.from.isNative
            ? [orbiterTokensDispenser, encodedReceiverAndCode]
            : [this.from.address, orbiterTokensDispenser, transferAmount, encodedReceiverAndCode];
        const value = this.from.isNative ? transferAmount : '0';

        const config = EvmWeb3Pure.encodeMethodCall(
            orbiterContractAddresses[this.fromBlockchain],
            ORBITER_ROUTER_V3_ABI,
            methodName,
            methodArgs,
            value
        );

        return {
            config,
            amount: this.to.stringWeiAmount
        };
    }

    public getTradeInfo(): TradeInfo {
        return {
            estimatedGas: this.estimatedGas,
            feeInfo: this.feeInfo,
            priceImpact: this.priceImpact,
            slippage: 0,
            routePath: this.routePath
        };
    }
}
