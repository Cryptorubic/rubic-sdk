import BigNumber from 'bignumber.js';
import { ethers } from 'ethers';
import { PriceTokenAmount } from 'src/common/tokens';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';
import { ContractParams } from 'src/features/common/models/contract-params';
import { getFromWithoutFee } from 'src/features/common/utils/get-from-without-fee';
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
import { MESON_ABI } from 'src/features/cross-chain/calculation-manager/providers/meson-provider/constants/meson-abi';
import { mesonContractAddresses } from 'src/features/cross-chain/calculation-manager/providers/meson-provider/constants/meson-contract-addresses';
import { MesonSupportedBlockchain } from 'src/features/cross-chain/calculation-manager/providers/meson-provider/constants/meson-cross-chain-supported-chains';
import { MesonCrossChainEvmTradeConstructorParams } from 'src/features/cross-chain/calculation-manager/providers/meson-provider/models/meson-trade-types';
import { MesonCcrApiService } from 'src/features/cross-chain/calculation-manager/providers/meson-provider/services/meson-cross-chain-api-service';
import { SymbiosisUtils } from 'src/features/cross-chain/calculation-manager/providers/symbiosis-provider/symbiosis-utils';

export class MesonCrossChainEvmTrade extends EvmCrossChainTrade {
    /**ABSTRACT PROPS */
    public readonly type: CrossChainTradeType = CROSS_CHAIN_TRADE_TYPE.MESON;

    public readonly isAggregator: boolean = false;

    public readonly to: PriceTokenAmount;

    public readonly from: PriceTokenAmount<EvmBlockchainName>; // 0.0011

    public readonly toTokenAmountMin: BigNumber;

    public readonly feeInfo: FeeInfo;

    public readonly onChainSubtype: OnChainSubtype = { from: undefined, to: undefined };

    public readonly bridgeType: BridgeType = BRIDGE_TYPE.MESON;

    public readonly gasData: GasData;

    public readonly priceImpact: number | null;
    /** */

    /* Used in swap-request, example `bnb:usdc` */
    private readonly sourceAssetString: string;

    private readonly targetAssetString: string;

    private get fromBlockchain(): MesonSupportedBlockchain {
        return this.from.blockchain as MesonSupportedBlockchain;
    }

    protected get fromContractAddress(): string {
        return this.isProxyTrade
            ? rubicProxyContractAddress[this.fromBlockchain].gateway
            : mesonContractAddresses[this.fromBlockchain];
    }

    protected get methodName(): string {
        return 'startBridgeTokensViaGenericCrossChain';
    }

    constructor(params: MesonCrossChainEvmTradeConstructorParams) {
        super(params.providerAddress, params.routePath, params.useProxy);
        this.to = params.crossChainTrade.to;
        this.from = params.crossChainTrade.from;
        this.feeInfo = params.crossChainTrade.feeInfo;
        this.gasData = params.crossChainTrade.gasData;
        this.priceImpact = params.crossChainTrade.priceImpact;
        this.toTokenAmountMin = this.to.tokenAmount;
        this.sourceAssetString = params.crossChainTrade.sourceAssetString;
        this.targetAssetString = params.crossChainTrade.targetAssetString;
    }

    public async getContractParams(options: GetContractParamsOptions): Promise<ContractParams> {
        const receiverAddress = options?.receiverAddress || this.walletAddress;
        const {
            data,
            value: providerValue, //  0.001078
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

        const bridgeData = ProxyCrossChainEvmTrade.getBridgeData(
            { ...options, receiverAddress: proxyReceiver },
            {
                walletAddress: receiverAddress,
                fromTokenAmount: this.from, // 0.0011
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
        const value = this.getSwapValue(providerValue); // 0.0011
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

    protected async getTransactionConfigAndAmount(
        receiverAddress?: string
    ): Promise<{ config: EvmEncodeConfig; amount: string }> {
        const rubicMultiProxyAddress = rubicProxyContractAddress[this.fromBlockchain].router;
        const fromAddress = this.isProxyTrade ? rubicMultiProxyAddress : this.walletAddress;

        const fromWithoutFee = getFromWithoutFee(
            this.from,
            this.feeInfo.rubicProxy?.platformFee?.percent
        );

        const { encoded, initiator } = await MesonCcrApiService.fetchInfoForTx({
            sourceAssetString: this.sourceAssetString,
            targetAssetString: this.targetAssetString,
            amount: fromWithoutFee.tokenAmount.toFixed(),
            fromAddress,
            receiverAddress: receiverAddress || this.walletAddress,
            useProxy: this.isProxyTrade
        });
        const postingValue = ethers.utils.solidityPack(['address', 'uint40'], [initiator, 1]);

        const methodName = 'postSwapFromContract';
        const methodArgs = [encoded, postingValue, rubicMultiProxyAddress];
        const value = this.from.isNative ? fromWithoutFee.stringWeiAmount : '0';

        const config = EvmWeb3Pure.encodeMethodCall(
            mesonContractAddresses[this.fromBlockchain],
            MESON_ABI,
            methodName,
            methodArgs,
            value
        );

        return { config, amount: this.to.stringWeiAmount };
    }

    public getTradeInfo(): TradeInfo {
        return {
            estimatedGas: this.estimatedGas,
            feeInfo: this.feeInfo,
            priceImpact: this.priceImpact || null,
            slippage: 0,
            routePath: this.routePath
        };
    }
}
