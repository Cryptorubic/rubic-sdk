import BigNumber from 'bignumber.js';
import { PriceTokenAmount } from 'src/common/tokens';
import { BLOCKCHAIN_NAME, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';
import { ContractParams } from 'src/features/common/models/contract-params';
import { SwapTransactionOptions } from 'src/features/common/models/swap-transaction-options';
import { checkUnsupportedReceiverAddress } from 'src/features/common/utils/check-unsupported-receiver-address';
import { getFromWithoutFee } from 'src/features/common/utils/get-from-without-fee';

import { CROSS_CHAIN_TRADE_TYPE, CrossChainTradeType } from '../../models/cross-chain-trade-type';
import { getCrossChainGasData } from '../../utils/get-cross-chain-gas-data';
import { EvmCrossChainTrade } from '../common/emv-cross-chain-trade/evm-cross-chain-trade';
import { GasData } from '../common/emv-cross-chain-trade/models/gas-data';
import { BRIDGE_TYPE, BridgeType } from '../common/models/bridge-type';
import { FeeInfo } from '../common/models/fee-info';
import { GetContractParamsOptions } from '../common/models/get-contract-params-options';
import { OnChainSubtype } from '../common/models/on-chain-subtype';
import { TradeInfo } from '../common/models/trade-info';
import { OneinchCcrQuoteResponse } from './models/oneinch-api-types';
import { OneinchCcrTradeParams, OneinchGetGasDataParams } from './models/oneinch-ccr-trade-types';
import { OneinchCcrApiService } from './services/oneinch-ccr-api-service';
import { OneinchCcrUtils } from './services/oneinch-ccr-utils';

export class OneinchCcrTrade extends EvmCrossChainTrade {
    public static async getGasData({
        feeInfo,
        from,
        providerAddress,
        quote,
        toToken,
        slippage
    }: OneinchGetGasDataParams): Promise<GasData | null> {
        try {
            const trade = new OneinchCcrTrade({
                crossChainTrade: {
                    from,
                    to: toToken,
                    gasData: null,
                    priceImpact: 0,
                    feeInfo,
                    quote,
                    slippage
                },
                providerAddress: providerAddress || EvmWeb3Pure.EMPTY_ADDRESS,
                routePath: [],
                useProxy: false
            });

            return getCrossChainGasData(trade);
        } catch (_err) {
            return null;
        }
    }

    public readonly type: CrossChainTradeType = CROSS_CHAIN_TRADE_TYPE.ONEINCH;

    public readonly isAggregator: boolean = true;

    public readonly to: PriceTokenAmount<EvmBlockchainName>;

    public readonly from: PriceTokenAmount<EvmBlockchainName>;

    public readonly toTokenAmountMin: BigNumber;

    public readonly feeInfo: FeeInfo;

    public readonly onChainSubtype: OnChainSubtype = { from: undefined, to: undefined };

    public readonly bridgeType: BridgeType = BRIDGE_TYPE.ONEINCH;

    public readonly gasData: GasData;

    public readonly priceImpact: number | null;

    private readonly slippage: number;

    private readonly quote: OneinchCcrQuoteResponse;

    private get fromWithoutFee(): PriceTokenAmount<EvmBlockchainName> {
        return getFromWithoutFee(this.from, this.feeInfo.rubicProxy?.platformFee?.percent);
    }

    /**
     * zkSync currently unavailable in fusion+ system
     */
    protected get fromContractAddress(): string {
        return this.from.blockchain === BLOCKCHAIN_NAME.ZK_SYNC
            ? '0x111111125421ca6dc452d289314280a0f8842a65'
            : '0x6fd4383cb451173d5f9304f041c7bcbf27d561ff';
    }

    protected get methodName(): string {
        throw new Error('[OneinchCcrTrade_methodName] Proxy swaps are not available.');
    }

    constructor(params: OneinchCcrTradeParams) {
        super(params.providerAddress, params.routePath, params.useProxy);
        this.to = params.crossChainTrade.to;
        this.from = params.crossChainTrade.from;
        this.feeInfo = params.crossChainTrade.feeInfo;
        this.gasData = params.crossChainTrade.gasData;
        this.priceImpact = params.crossChainTrade.priceImpact;
        this.slippage = params.crossChainTrade.slippage;
        this.toTokenAmountMin = this.to.weiAmountMinusSlippage(this.slippage);
        this.quote = params.crossChainTrade.quote;
    }

    public async swap(options: SwapTransactionOptions = {}): Promise<string | never> {
        if (!options?.testMode) {
            await this.checkTradeErrors();
        }
        checkUnsupportedReceiverAddress(options.receiverAddress, this.walletAddress);

        try {
            const secretsCount = this.quote.presets[this.quote.recommendedPreset].secretsCount;
            const secrets = OneinchCcrUtils.createSecretHashes(secretsCount);

            const swapOrder = await OneinchCcrApiService.buildSwapOrder({
                srcToken: this.fromWithoutFee,
                dstToken: this.to,
                walletAddress: this.walletAddress,
                quote: this.quote,
                secretHashes: secrets
            });
            options.onConfirm?.(swapOrder.orderHash);

            await OneinchCcrApiService.submitSwapOrder(
                this.quote,
                swapOrder,
                this.walletAddress,
                secrets
            );

            OneinchCcrUtils.listenForSecretsReadiness(swapOrder.orderHash, secrets);

            return swapOrder.orderHash;
        } catch (err) {
            throw err;
        }
    }

    protected async getContractParams(
        _options: GetContractParamsOptions,
        _skipAmountChangeCheck?: boolean
    ): Promise<ContractParams> {
        throw new Error(
            '[OneinchCcrTrade_getContractParams] Fee is taken in order params `fee` and `feeReceiver`.'
        );
    }

    protected async getTransactionConfigAndAmount(
        _receiverAddress?: string
    ): Promise<{ config: EvmEncodeConfig; amount: string }> {
        const newQuote = await OneinchCcrApiService.fetchQuote({
            srcToken: this.fromWithoutFee,
            dstToken: this.to,
            walletAddress: this.walletAddress
        });

        return {
            config: {
                data: '',
                to: '',
                value: ''
            },
            amount: newQuote.dstTokenAmount
        };
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
