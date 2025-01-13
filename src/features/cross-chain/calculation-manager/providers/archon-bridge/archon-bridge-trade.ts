import BigNumber from 'bignumber.js';
import { PriceTokenAmount } from 'src/common/tokens';
import { nativeTokensList } from 'src/common/tokens/constants/native-tokens';
import { BLOCKCHAIN_NAME, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { ContractParams } from 'src/features/common/models/contract-params';
import { SwapTransactionOptions } from 'src/features/common/models/swap-transaction-options';
import { getFromWithoutFee } from 'src/features/common/utils/get-from-without-fee';
import { CROSS_CHAIN_TRADE_TYPE } from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { ArchonContractService } from 'src/features/cross-chain/calculation-manager/providers/archon-bridge/archon-contract-service';
import { archonBridgeAbi } from 'src/features/cross-chain/calculation-manager/providers/archon-bridge/constants/archon-bridge-abi';
import { ArchonBridgeSupportedBlockchain } from 'src/features/cross-chain/calculation-manager/providers/archon-bridge/constants/archon-bridge-supported-blockchain';
import { archonWrapBridgeAbi } from 'src/features/cross-chain/calculation-manager/providers/archon-bridge/constants/archon-wrap-bridge-abi';
import { layerZeroIds } from 'src/features/cross-chain/calculation-manager/providers/archon-bridge/constants/layer-zero-ids';
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

export class ArchonBridgeTrade extends EvmCrossChainTrade {
    public readonly onChainSubtype = { from: undefined, to: undefined };

    public readonly type = CROSS_CHAIN_TRADE_TYPE.ARCHON_BRIDGE;

    public readonly isAggregator = false;

    public readonly bridgeType = BRIDGE_TYPE.ARCHON_BRIDGE;

    public readonly from: PriceTokenAmount<EvmBlockchainName>;

    public readonly to: PriceTokenAmount<EvmBlockchainName>;

    public readonly toTokenAmountMin: BigNumber;

    public readonly gasData: GasData | null;

    private get fromBlockchain(): ArchonBridgeSupportedBlockchain {
        return this.from.blockchain as ArchonBridgeSupportedBlockchain;
    }

    protected get fromContractAddress(): string {
        if (this.isProxyTrade) {
            return rubicProxyContractAddress[this.fromBlockchain].gateway;
        }
        return ArchonContractService.getWeb3AndAddress(this.from, this.to).contract.address;
    }

    public readonly feeInfo: FeeInfo = {};

    public readonly onChainTrade = null;

    protected get methodName(): string {
        return this.onChainTrade
            ? 'swapAndStartBridgeTokensViaGenericCrossChain'
            : 'startBridgeTokensViaGenericCrossChain';
    }

    constructor(
        crossChainTrade: {
            from: PriceTokenAmount<EvmBlockchainName>;
            to: PriceTokenAmount<EvmBlockchainName>;
            gasData: GasData | null;
            feeInfo: FeeInfo;
        },
        providerAddress: string,
        routePath: RubicStep[],
        useProxy: boolean
    ) {
        super(providerAddress, routePath, useProxy);

        this.from = crossChainTrade.from;
        this.to = crossChainTrade.to;
        this.gasData = crossChainTrade.gasData;
        this.toTokenAmountMin = crossChainTrade.to.tokenAmount;
        this.feeInfo = crossChainTrade.feeInfo;
    }

    protected async swapDirect(options: SwapTransactionOptions = {}): Promise<string | never> {
        await this.checkTradeErrors();
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
            const { data, value, to } = await this.setTransactionConfig(
                false,
                options?.useCacheData || false,
                options?.receiverAddress
            );

            await this.web3Private.trySendTransaction(to, {
                data,
                value,
                onTransactionHash,
                gasPriceOptions
            });

            return transactionHash!;
        } catch (err) {
            throw err;
        }
    }

    public async getContractParams(options: GetContractParamsOptions): Promise<ContractParams> {
        const {
            data,
            value: providerValue,
            to: providerRouter
        } = await this.setTransactionConfig(
            false,
            options?.useCacheData || false,
            options?.receiverAddress
        );

        const bridgeData = ProxyCrossChainEvmTrade.getBridgeData(options, {
            walletAddress: this.walletAddress,
            fromTokenAmount: this.from,
            toTokenAmount: this.to,
            srcChainTrade: null,
            providerAddress: this.providerAddress,
            type: `native:${this.bridgeType}`,
            fromAddress: this.walletAddress
        });
        const extraNativeFee = this.from.isNative
            ? new BigNumber(providerValue).minus(this.from.stringWeiAmount).toFixed()
            : new BigNumber(providerValue).toFixed();
        const providerData = await ProxyCrossChainEvmTrade.getGenericProviderData(
            providerRouter,
            data!,
            this.fromBlockchain,
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

    public getTradeAmountRatio(fromUsd: BigNumber): BigNumber {
        return fromUsd.dividedBy(this.to.tokenAmount);
    }

    public getTradeInfo(): TradeInfo {
        return {
            estimatedGas: this.estimatedGas,
            feeInfo: this.feeInfo,
            priceImpact: 0,
            slippage: 0,
            routePath: this.routePath
        };
    }

    protected async getTransactionConfigAndAmount(
        receiverAddress?: string
    ): Promise<{ config: EvmEncodeConfig; amount: string }> {
        const { contract } = ArchonContractService.getWeb3AndAddress(this.from, this.to);
        const providerFee = this.feeInfo.provider?.cryptoFee?.amount || new BigNumber(0);
        const nativeToken = nativeTokensList[this.fromBlockchain];
        const fromWithoutFee = getFromWithoutFee(
            this.from,
            this.feeInfo.rubicProxy?.platformFee?.percent
        );

        const fromValueAmount = this.from.isNative ? fromWithoutFee.tokenAmount : new BigNumber(0);
        const value = Web3Pure.toWei(fromValueAmount.plus(providerFee), nativeToken.decimals);
        const methodArguments = [];
        let config: EvmEncodeConfig | null = null;

        if (contract.type === 'originRouter') {
            if (!this.from.isNative) {
                methodArguments.push(this.from.address);
            }
            methodArguments.push(
                fromWithoutFee.stringWeiAmount,
                receiverAddress || this.walletAddress,
                [this.walletAddress, '0x0000000000000000000000000000000000000000'],
                '0x'
            );

            config = EvmWeb3Pure.encodeMethodCall(
                contract.address,
                archonBridgeAbi,
                this.from.isNative ? 'bridgeNative' : 'bridge',
                methodArguments,
                value
            );
        } else {
            methodArguments.push(
                this.from.address,
                layerZeroIds[this.to.blockchain as ArchonBridgeSupportedBlockchain],
                fromWithoutFee.stringWeiAmount,
                receiverAddress || this.walletAddress,
                true,
                [this.walletAddress, '0x0000000000000000000000000000000000000000'],
                '0x'
            );

            config = EvmWeb3Pure.encodeMethodCall(
                contract.address,
                archonWrapBridgeAbi,
                this.from.blockchain === BLOCKCHAIN_NAME.HORIZEN_EON && this.from.isNative
                    ? 'bridgeNative'
                    : 'bridge',
                methodArguments,
                value
            );
        }

        return { config, amount: this.to.stringWeiAmount };
    }
}
