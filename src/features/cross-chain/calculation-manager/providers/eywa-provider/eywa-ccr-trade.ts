import BigNumber from 'bignumber.js';
import { PriceTokenAmount } from 'src/common/tokens';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { ContractParams } from 'src/features/common/models/contract-params';

import { CROSS_CHAIN_TRADE_TYPE, CrossChainTradeType } from '../../models/cross-chain-trade-type';
import { getCrossChainGasData } from '../../utils/get-cross-chain-gas-data';
import { rubicProxyContractAddress } from '../common/constants/rubic-proxy-contract-address';
import { evmCommonCrossChainAbi } from '../common/emv-cross-chain-trade/constants/evm-common-cross-chain-abi';
import { gatewayRubicCrossChainAbi } from '../common/emv-cross-chain-trade/constants/gateway-rubic-cross-chain-abi';
import { EvmCrossChainTrade } from '../common/emv-cross-chain-trade/evm-cross-chain-trade';
import { GasData } from '../common/emv-cross-chain-trade/models/gas-data';
import { BRIDGE_TYPE, BridgeType } from '../common/models/bridge-type';
import { FeeInfo } from '../common/models/fee-info';
import { GetContractParamsOptions } from '../common/models/get-contract-params-options';
import { OnChainSubtype } from '../common/models/on-chain-subtype';
import { RubicStep } from '../common/models/rubicStep';
import { TradeInfo } from '../common/models/trade-info';
import { ProxyCrossChainEvmTrade } from '../common/proxy-cross-chain-evm-facade/proxy-cross-chain-evm-trade';
import { eywaStartAbi } from './constants/eywa-abi';
import { EywaCcrSupportedChains } from './constants/eywa-ccr-supported-chains';
import { eywaContractAddresses } from './constants/eywa-contract-address';
import { EywaRoutingResponse } from './models/request-routing-params';
import { EywaApiService } from './services/eywa-api-service';

export class EywaCrossChainTrade extends EvmCrossChainTrade {
    /** @internal */
    public static async getGasData(
        from: PriceTokenAmount<EvmBlockchainName>,
        to: PriceTokenAmount<EvmBlockchainName>,
        feeInfo: FeeInfo,
        providerAddress: string,
        toTokenAmountMin: BigNumber,
        eywaRoute: EywaRoutingResponse
    ): Promise<GasData | null> {
        const trade = new EywaCrossChainTrade(
            {
                from,
                to,
                feeInfo,
                priceImpact: null,
                toTokenAmountMin,
                gasData: null,
                slippage: 0,
                eywaRoute
            },
            providerAddress,
            []
        );

        return getCrossChainGasData(trade);
    }

    public readonly type: CrossChainTradeType = CROSS_CHAIN_TRADE_TYPE.EYWA_V2;

    public readonly isAggregator: boolean = false;

    public readonly to: PriceTokenAmount<EvmBlockchainName>;

    public readonly from: PriceTokenAmount<EvmBlockchainName>;

    public readonly toTokenAmountMin: BigNumber;

    public readonly feeInfo: FeeInfo;

    public readonly onChainSubtype: OnChainSubtype = { from: undefined, to: undefined };

    public readonly bridgeType: BridgeType = BRIDGE_TYPE.EYWA_V2;

    public readonly gasData: GasData;

    public readonly priceImpact: number | null;

    private readonly slippage: number;

    private readonly eywaRoute: EywaRoutingResponse;

    private get fromBlockchain(): EywaCcrSupportedChains {
        return this.from.blockchain as EywaCcrSupportedChains;
    }

    protected get fromContractAddress(): string {
        return this.isProxyTrade
            ? rubicProxyContractAddress[this.fromBlockchain].gateway
            : eywaContractAddresses[this.fromBlockchain];
    }

    protected get methodName(): string {
        return 'startBridgeTokensViaGenericCrossChain';
    }

    constructor(
        crossChainTrade: {
            from: PriceTokenAmount<EvmBlockchainName>;
            to: PriceTokenAmount<EvmBlockchainName>;
            feeInfo: FeeInfo;
            priceImpact: number | null;
            toTokenAmountMin: BigNumber;
            gasData: GasData | null;
            slippage: number;
            eywaRoute: EywaRoutingResponse;
        },
        providerAddress: string,
        routePath: RubicStep[]
    ) {
        super(providerAddress, routePath);

        this.to = crossChainTrade.to;
        this.from = crossChainTrade.from;
        this.feeInfo = crossChainTrade.feeInfo;
        this.toTokenAmountMin = Web3Pure.fromWei(
            crossChainTrade.toTokenAmountMin,
            crossChainTrade.to.decimals
        );
        this.gasData = crossChainTrade.gasData;
        this.priceImpact = crossChainTrade.priceImpact;
        this.slippage = crossChainTrade.slippage;
        this.eywaRoute = crossChainTrade.eywaRoute;
    }

    protected async getTransactionConfigAndAmount(
        receiverAddress?: string
    ): Promise<{ config: EvmEncodeConfig; amount: string }> {
        const feeEstimation = await EywaApiService.getFeeEstimation(this.eywaRoute);

        const txData = await EywaApiService.getSwapTx({
            routing: this.eywaRoute,
            from: this.walletAddress,
            recipient: receiverAddress || this.walletAddress,
            estimate: feeEstimation
        });

        const value = new BigNumber(txData.value).plus(feeEstimation.executionPrice);

        const evmConfig = EvmWeb3Pure.encodeMethodCall(
            txData.to,
            eywaStartAbi,
            'start',
            [
                txData.args[0],
                txData.args[1],
                [
                    txData.args[2].executionPrice,
                    txData.args[2].deadline,
                    txData.args[2].v,
                    txData.args[2].r,
                    txData.args[2].s
                ]
            ],
            value.toFixed()
        );

        return { config: evmConfig, amount: this.to.stringWeiAmount };
    }

    protected async getContractParams(
        options: GetContractParamsOptions,
        skipAmountChangeCheck?: boolean
    ): Promise<ContractParams> {
        const receiverAddress = options?.receiverAddress || this.walletAddress;

        const {
            data,
            value: providerValue,
            to: providerRouter
        } = await this.setTransactionConfig(
            skipAmountChangeCheck ?? false,
            options?.useCacheData || false,
            receiverAddress
        );

        const bridgeData = ProxyCrossChainEvmTrade.getBridgeData(options, {
            walletAddress: receiverAddress,
            fromTokenAmount: this.from,
            toTokenAmount: this.to,
            srcChainTrade: null,
            providerAddress: this.providerAddress,
            type: `native:${this.bridgeType}`,
            fromAddress: this.walletAddress
        });

        const providerData = await ProxyCrossChainEvmTrade.getGenericProviderData(
            providerRouter,
            data!,
            this.from.blockchain,
            providerRouter,
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

    public getTradeInfo(): TradeInfo {
        return {
            estimatedGas: this.estimatedGas,
            feeInfo: this.feeInfo,
            priceImpact: this.priceImpact,
            slippage: this.slippage * 100,
            routePath: this.routePath
        };
    }
}
