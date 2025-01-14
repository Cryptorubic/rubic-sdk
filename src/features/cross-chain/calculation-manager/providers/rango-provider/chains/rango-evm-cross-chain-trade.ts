import BigNumber from 'bignumber.js';
import { RubicSdkError } from 'src/common/errors';
import { PriceTokenAmount } from 'src/common/tokens';
import { compareAddresses } from 'src/common/utils/blockchain';
import { BlockchainName, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';
import { ContractParams } from 'src/features/common/models/contract-params';
import { SwapTransactionOptions } from 'src/features/common/models/swap-transaction-options';
import { rangoContractAddresses } from 'src/features/common/providers/rango/constants/rango-contract-address';
import { RangoTransaction } from 'src/features/common/providers/rango/models/rango-api-swap-types';
import { RangoSwapQueryParams } from 'src/features/common/providers/rango/models/rango-parser-types';
import { RangoSupportedBlockchain } from 'src/features/common/providers/rango/models/rango-supported-blockchains';
import { getFromWithoutFee } from 'src/features/common/utils/get-from-without-fee';

import {
    CROSS_CHAIN_TRADE_TYPE,
    CrossChainTradeType
} from '../../../models/cross-chain-trade-type';
import { rubicProxyContractAddress } from '../../common/constants/rubic-proxy-contract-address';
import { evmCommonCrossChainAbi } from '../../common/evm-cross-chain-trade/constants/evm-common-cross-chain-abi';
import { gatewayRubicCrossChainAbi } from '../../common/evm-cross-chain-trade/constants/gateway-rubic-cross-chain-abi';
import { EvmCrossChainTrade } from '../../common/evm-cross-chain-trade/evm-cross-chain-trade';
import { GasData } from '../../common/evm-cross-chain-trade/models/gas-data';
import { BRIDGE_TYPE, BridgeType } from '../../common/models/bridge-type';
import { FeeInfo } from '../../common/models/fee-info';
import { GetContractParamsOptions } from '../../common/models/get-contract-params-options';
import { OnChainSubtype } from '../../common/models/on-chain-subtype';
import { TradeInfo } from '../../common/models/trade-info';
import { ProxyCrossChainEvmTrade } from '../../common/proxy-cross-chain-evm-facade/proxy-cross-chain-evm-trade';
import { RangoCrossChainTradeConstructorParams } from '../model/rango-cross-chain-parser-types';
import { RangoCrossChainApiService } from '../services/rango-cross-chain-api-service';

export class RangoEvmCrossChainTrade extends EvmCrossChainTrade {
    public readonly type: CrossChainTradeType = CROSS_CHAIN_TRADE_TYPE.RANGO;

    public readonly isAggregator: boolean = true;

    public readonly to: PriceTokenAmount<BlockchainName>;

    public readonly from: PriceTokenAmount<EvmBlockchainName>;

    public readonly toTokenAmountMin: BigNumber;

    public readonly feeInfo: FeeInfo;

    public readonly onChainSubtype: OnChainSubtype = { from: undefined, to: undefined };

    public readonly bridgeType: BridgeType = BRIDGE_TYPE.RANGO;

    public readonly gasData: GasData;

    public readonly priceImpact: number | null;

    private readonly slippage: number;

    /**
     * @description UUID returned by rango-api to track transaction status in getRangoDstSwapStatus
     */
    public rangoRequestId: string | undefined;

    private readonly swapQueryParams: RangoSwapQueryParams;

    private get fromBlockchain(): RangoSupportedBlockchain {
        return this.from.blockchain as RangoSupportedBlockchain;
    }

    protected get fromContractAddress(): string {
        return this.isProxyTrade
            ? rubicProxyContractAddress[this.fromBlockchain].gateway
            : rangoContractAddresses[this.fromBlockchain].providerGateway;
    }

    protected get methodName(): string {
        return 'startBridgeTokensViaGenericCrossChain';
    }

    constructor(params: RangoCrossChainTradeConstructorParams<EvmBlockchainName>) {
        super(params.providerAddress, params.routePath, params.useProxy);
        this.to = params.crossChainTrade.to;
        this.from = params.crossChainTrade.from;
        this.toTokenAmountMin = params.crossChainTrade.toTokenAmountMin;
        this.feeInfo = params.crossChainTrade.feeInfo;
        this.gasData = params.crossChainTrade.gasData;
        this.priceImpact = params.crossChainTrade.priceImpact;
        this.slippage = params.crossChainTrade.slippage;
        this.swapQueryParams = params.crossChainTrade.swapQueryParams;
        this.bridgeType = params.crossChainTrade.bridgeSubtype || BRIDGE_TYPE.RANGO;
    }

    public async getContractParams(options: GetContractParamsOptions): Promise<ContractParams> {
        const receiverAddress = options?.receiverAddress || this.walletAddress;

        const {
            data,
            value: providerValue,
            to: providerRouter
        } = await this.setTransactionConfig(false, options?.useCacheData || false, receiverAddress);
        if (
            !compareAddresses(
                providerRouter,
                rangoContractAddresses[this.from.blockchain as RangoSupportedBlockchain]!
                    .providerRouter
            )
        ) {
            throw new RubicSdkError('Rubic proxy does not support non proxy Rango routers');
        }

        const bridgeData = ProxyCrossChainEvmTrade.getBridgeData(options, {
            walletAddress: receiverAddress,
            fromTokenAmount: this.from,
            toTokenAmount: this.to,
            srcChainTrade: null,
            providerAddress: this.providerAddress,
            type: `rango:${this.bridgeType}`,
            fromAddress: this.walletAddress
        });

        const fromWithoutFee = getFromWithoutFee(
            this.from,
            this.feeInfo?.rubicProxy?.platformFee?.percent
        );
        const extraNativeFee = this.from.isNative
            ? new BigNumber(providerValue).minus(fromWithoutFee.stringWeiAmount).toFixed()
            : new BigNumber(providerValue).toFixed();

        const providerData = await ProxyCrossChainEvmTrade.getGenericProviderData(
            providerRouter,
            data!,
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

    protected async swapDirect(options: SwapTransactionOptions = {}): Promise<string> {
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
            const receiverAddress = options?.receiverAddress || this.walletAddress;
            const { data, value, to } = await this.setTransactionConfig(
                false,
                options?.useCacheData || false,
                receiverAddress
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

    protected async getTransactionConfigAndAmount(
        receiverAddress?: string
    ): Promise<{ config: EvmEncodeConfig; amount: string }> {
        const { route, tx, error, requestId } = await RangoCrossChainApiService.getSwapTransaction({
            ...this.swapQueryParams,
            toAddress: receiverAddress || this.swapQueryParams.toAddress
        });

        this.rangoRequestId = requestId;

        if (!route || !tx) {
            throw new RubicSdkError('Invalid data after sending swap request. Error text:' + error);
        }

        const { txData, value, txTo } = tx as RangoTransaction;

        const config = {
            data: txData!,
            value: value || '0',
            to: txTo
        };

        return { config, amount: route.outputAmount };
    }

    public getTradeInfo(): TradeInfo {
        return {
            estimatedGas: this.estimatedGas,
            feeInfo: this.feeInfo,
            priceImpact: this.priceImpact || null,
            slippage: this.slippage * 100,
            routePath: this.routePath
        };
    }
}
