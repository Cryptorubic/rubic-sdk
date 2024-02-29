import BigNumber from 'bignumber.js';
import { PriceTokenAmount } from 'src/common/tokens';
import { BLOCKCHAIN_NAME, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';
import { ContractParams } from 'src/features/common/models/contract-params';
import { SwapTransactionOptions } from 'src/features/common/models/swap-transaction-options';
import { CROSS_CHAIN_TRADE_TYPE } from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { ArchonContractService } from 'src/features/cross-chain/calculation-manager/providers/archon-bridge/archon-contract-service';
import { archonBridgeAbi } from 'src/features/cross-chain/calculation-manager/providers/archon-bridge/constants/archon-bridge-abi';
import { archonBridgeOutContractAddress } from 'src/features/cross-chain/calculation-manager/providers/archon-bridge/constants/archon-bridge-out-contract-address';
import { ArchonBridgeSupportedBlockchain } from 'src/features/cross-chain/calculation-manager/providers/archon-bridge/constants/archon-bridge-supported-blockchain';
import { rubicProxyContractAddress } from 'src/features/cross-chain/calculation-manager/providers/common/constants/rubic-proxy-contract-address';
import { evmCommonCrossChainAbi } from 'src/features/cross-chain/calculation-manager/providers/common/emv-cross-chain-trade/constants/evm-common-cross-chain-abi';
import { gatewayRubicCrossChainAbi } from 'src/features/cross-chain/calculation-manager/providers/common/emv-cross-chain-trade/constants/gateway-rubic-cross-chain-abi';
import { EvmCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/common/emv-cross-chain-trade/evm-cross-chain-trade';
import { GasData } from 'src/features/cross-chain/calculation-manager/providers/common/emv-cross-chain-trade/models/gas-data';
import { BRIDGE_TYPE } from 'src/features/cross-chain/calculation-manager/providers/common/models/bridge-type';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { GetContractParamsOptions } from 'src/features/cross-chain/calculation-manager/providers/common/models/get-contract-params-options';
import { RubicStep } from 'src/features/cross-chain/calculation-manager/providers/common/models/rubicStep';
import { TradeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/trade-info';
import { ProxyCrossChainEvmTrade } from 'src/features/cross-chain/calculation-manager/providers/common/proxy-cross-chain-evm-facade/proxy-cross-chain-evm-trade';

export class ArchonBridgeTrade extends EvmCrossChainTrade {
    /** @internal */
    public static async getGasData(
        _from: PriceTokenAmount<EvmBlockchainName>,
        _to: PriceTokenAmount<EvmBlockchainName>
    ): Promise<GasData | null> {
        return null;
    }

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
        const contract =
            this.from.blockchain === BLOCKCHAIN_NAME.HORIZEN_EON
                ? archonBridgeOutContractAddress[
                      this.to.blockchain as Exclude<
                          ArchonBridgeSupportedBlockchain,
                          typeof BLOCKCHAIN_NAME.HORIZEN_EON
                      >
                  ]
                : archonBridgeOutContractAddress[
                      this.to.blockchain as Exclude<
                          ArchonBridgeSupportedBlockchain,
                          typeof BLOCKCHAIN_NAME.HORIZEN_EON
                      >
                  ];

        return this.isProxyTrade ? contract.rubicRouter : contract.providerGateway;
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
        },
        providerAddress: string,
        routePath: RubicStep[]
    ) {
        super(providerAddress, routePath);

        this.from = crossChainTrade.from;
        this.to = crossChainTrade.to;
        this.gasData = crossChainTrade.gasData;
        this.toTokenAmountMin = crossChainTrade.to.tokenAmount;
    }

    protected async swapDirect(options: SwapTransactionOptions = {}): Promise<string | never> {
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

        // eslint-disable-next-line no-useless-catch
        try {
            const { data, value, to } = await this.fetchSwapData(options?.receiverAddress);

            await this.web3Private.trySendTransaction(to, {
                data,
                value,
                onTransactionHash,
                gas: gasLimit,
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
        } = await this.fetchSwapData(options?.receiverAddress);

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

    private async fetchSwapData(receiverAddress?: string): Promise<EvmEncodeConfig> {
        const methodArguments = [];
        if (!this.from.isNative) {
            methodArguments.push(this.from.address);
        }
        methodArguments.push(
            this.from.stringWeiAmount,
            receiverAddress || this.walletAddress,
            [this.walletAddress, '0x0000000000000000000000000000000000000000'],
            '0x'
        );

        const { contractAddress } = ArchonContractService.getWeb3AndAddress(
            this.fromBlockchain,
            this.to.blockchain as ArchonBridgeSupportedBlockchain
        );
        const fromValueAmount = this.from.isNative ? this.from.tokenAmount : new BigNumber(0);

        return EvmWeb3Pure.encodeMethodCall(
            contractAddress.providerRouter,
            archonBridgeAbi,
            this.from.isNative ? 'bridgeNative' : 'bridge',
            methodArguments,
            fromValueAmount.plus(this.feeInfo.provider!.cryptoFee!.amount).toFixed()
        );
    }
}
