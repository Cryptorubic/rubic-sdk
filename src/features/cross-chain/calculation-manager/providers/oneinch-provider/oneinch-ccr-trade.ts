import BigNumber from 'bignumber.js';
import { PriceTokenAmount } from 'src/common/tokens';
import { BLOCKCHAIN_NAME, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { ContractParams } from 'src/features/common/models/contract-params';
import { SwapTransactionOptions } from 'src/features/common/models/swap-transaction-options';
import { checkUnsupportedReceiverAddress } from 'src/features/common/utils/check-unsupported-receiver-address';
import { getFromWithoutFee } from 'src/features/common/utils/get-from-without-fee';

import { CROSS_CHAIN_TRADE_TYPE, CrossChainTradeType } from '../../models/cross-chain-trade-type';
import { EvmCrossChainTrade } from '../common/emv-cross-chain-trade/evm-cross-chain-trade';
import { GasData } from '../common/emv-cross-chain-trade/models/gas-data';
import { BRIDGE_TYPE, BridgeType } from '../common/models/bridge-type';
import { FeeInfo } from '../common/models/fee-info';
import { GetContractParamsOptions } from '../common/models/get-contract-params-options';
import { OnChainSubtype } from '../common/models/on-chain-subtype';
import { TradeInfo } from '../common/models/trade-info';
import { OneinchCcrQuoteResponse } from './models/oneinch-api-types';
import { OneinchCcrTradeParams } from './models/oneinch-ccr-trade-types';
import { OneinchCcrApiService } from './services/oneinch-ccr-api-service';
import { OneinchCcrUtils } from './services/oneinch-ccr-utils';

export class OneinchCcrTrade extends EvmCrossChainTrade {
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

    public oneinchOrderHash!: string;

    /**
     * zkSync currently unavailable in fusion+ system
     */
    protected get fromContractAddress(): string {
        return this.from.blockchain !== BLOCKCHAIN_NAME.ZK_SYNC
            ? '0x111111125421ca6dc452d289314280a0f8842a65'
            : '0x6fd4383cb451173d5f9304f041c7bcbf27d561ff';
    }

    private get permit2Address(): string {
        return this.from.blockchain !== BLOCKCHAIN_NAME.ZK_SYNC
            ? '0x000000000022D473030F116dDEE9F6B43aC78BA3'
            : '0x0000000000225e31D15943971F47aD3022F714Fa';
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
        this.toTokenAmountMin = Web3Pure.fromWei(
            this.to.weiAmountMinusSlippage(this.slippage),
            this.to.decimals
        );
        this.quote = params.crossChainTrade.quote;
    }

    public async swap(options: SwapTransactionOptions = {}): Promise<string | never> {
        if (!options?.testMode) {
            await this.checkTradeErrors();
        }

        checkUnsupportedReceiverAddress(options.receiverAddress, this.walletAddress);
        if (!options.useCacheData) {
            await this.checkRateUpdated();
        }

        const secretsCount = this.quote.presets[this.quote.recommendedPreset].secretsCount;
        const secretsData = OneinchCcrUtils.createSecretHashes(secretsCount);

        const secretHashes = secretsData.map(el => el.hashedSecret);
        const secrets = secretsData.map(el => el.secret);

        const swapOrder = await OneinchCcrApiService.buildSwapOrder({
            srcToken: this.fromWithoutFee,
            dstToken: this.to,
            walletAddress: this.walletAddress,
            quote: this.quote,
            secretHashes: secretHashes
        });

        this.oneinchOrderHash = swapOrder.orderHash;

        await OneinchCcrApiService.submitSwapOrder(
            this.quote,
            swapOrder,
            this.walletAddress,
            secretHashes
        );

        const txHash = await OneinchCcrUtils.listenForSrcTxCompleted(swapOrder.orderHash);
        options.onConfirm?.(txHash);

        OneinchCcrUtils.listenForSecretsReadiness(swapOrder.orderHash, secrets);

        return txHash;
    }

    protected async getContractParams(
        _options: GetContractParamsOptions,
        _skipAmountChangeCheck?: boolean
    ): Promise<ContractParams> {
        throw new Error(
            '[OneinchCcrTrade_getContractParams] Fee is taken in order params `fee` and `feeReceiver`.'
        );
    }

    private async checkRateUpdated(): Promise<void> {
        const { amount } = await this.getTransactionConfigAndAmount();
        this.checkAmountChange(amount, this.to.stringWeiAmount);
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
