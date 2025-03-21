import BigNumber from 'bignumber.js';
import { NotSupportedTokensError } from 'src/common/errors';
import { NotSupportedRegionError } from 'src/common/errors/swap/not-supported-region';
import { PriceTokenAmount } from 'src/common/tokens';
import { BLOCKCHAIN_NAME, TronBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { TronTransactionConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/tron-web3-pure/models/tron-transaction-config';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { Injector } from 'src/core/injector/injector';
import { bridgersNativeAddress } from 'src/features/common/providers/bridgers/constants/bridgers-native-address';
import { toBridgersBlockchain } from 'src/features/common/providers/bridgers/constants/to-bridgers-blockchain';
import { bridgersContractAddresses } from 'src/features/common/providers/bridgers/models/bridgers-contract-addresses';
import {
    BridgersQuoteRequest,
    BridgersQuoteResponse
} from 'src/features/common/providers/bridgers/models/bridgers-quote-api';
import {
    BridgersSwapRequest,
    BridgersSwapResponse
} from 'src/features/common/providers/bridgers/models/bridgers-swap-api';
import { getFromWithoutFee } from 'src/features/common/utils/get-from-without-fee';
import { createTokenNativeAddressProxy } from 'src/features/common/utils/token-native-address-proxy';
import { CROSS_CHAIN_TRADE_TYPE } from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { BridgersCrossChainSupportedBlockchain } from 'src/features/cross-chain/calculation-manager/providers/bridgers-provider/constants/bridgers-cross-chain-supported-blockchain';
import { BridgersTronCrossChainParams } from 'src/features/cross-chain/calculation-manager/providers/bridgers-provider/models/bridgers-cross-chain-trade-types';
import { TronBridgersTransactionData } from 'src/features/cross-chain/calculation-manager/providers/bridgers-provider/models/tron-bridgers-transaction-data';
import { BRIDGE_TYPE } from 'src/features/cross-chain/calculation-manager/providers/common/models/bridge-type';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { TradeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/trade-info';
import { TronContractParams } from 'src/features/cross-chain/calculation-manager/providers/common/tron-cross-chain-trade/models/tron-contract-params';
import { TronGetContractParamsOptions } from 'src/features/cross-chain/calculation-manager/providers/common/tron-cross-chain-trade/models/tron-get-contract-params-options';
import { TronCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/common/tron-cross-chain-trade/tron-cross-chain-trade';

export class TronBridgersCrossChainTrade extends TronCrossChainTrade {
    public readonly type = CROSS_CHAIN_TRADE_TYPE.BRIDGERS;

    public readonly isAggregator = false;

    public readonly from: PriceTokenAmount<TronBlockchainName>;

    public readonly to: PriceTokenAmount;

    public readonly toTokenAmountMin: BigNumber;

    public readonly feeInfo: FeeInfo;

    public readonly onChainSubtype = { from: undefined, to: undefined };

    public readonly bridgeType = BRIDGE_TYPE.BRIDGERS;

    public readonly priceImpact: number | null;

    private readonly slippage: number;

    protected get fromContractAddress(): string {
        return bridgersContractAddresses.TRON;
    }

    protected get methodName(): string {
        return '';
    }

    constructor(params: BridgersTronCrossChainParams) {
        const { crossChainTrade, providerAddress, routePath } = params;
        super(providerAddress, routePath, false);

        this.from = crossChainTrade.from;
        this.to = crossChainTrade.to;
        this.toTokenAmountMin = crossChainTrade.toTokenAmountMin;
        this.feeInfo = crossChainTrade.feeInfo;
        this.priceImpact = this.from.calculatePriceImpactPercent(this.to);
        this.slippage = crossChainTrade.slippage;
    }

    protected async getContractParams(
        _options: TronGetContractParamsOptions
    ): Promise<TronContractParams> {
        throw new Error('Not implemeted');
    }

    public getTradeAmountRatio(fromUsd: BigNumber): BigNumber {
        return fromUsd.dividedBy(this.to.tokenAmount);
    }

    public getTradeInfo(): TradeInfo {
        return {
            estimatedGas: null,
            feeInfo: this.feeInfo,
            priceImpact: this.priceImpact ?? null,
            slippage: this.slippage * 100,
            routePath: this.routePath
        };
    }

    protected async getTransactionConfigAndAmount(
        receiverAddress?: string
    ): Promise<{ config: TronTransactionConfig; amount: string }> {
        const fromBlockchain = this.from.blockchain as BridgersCrossChainSupportedBlockchain;
        const toBlockchain = this.to.blockchain as BridgersCrossChainSupportedBlockchain;

        const fromWithoutFee = getFromWithoutFee(
            this.from,
            this.feeInfo.rubicProxy?.platformFee?.percent
        );

        const fromTokenAddress = createTokenNativeAddressProxy(
            fromWithoutFee,
            bridgersNativeAddress,
            false
        ).address;

        const toTokenAddress = createTokenNativeAddressProxy(
            this.to,
            bridgersNativeAddress,
            this.to.blockchain !== BLOCKCHAIN_NAME.TRON
        ).address;

        const quoteRequest: BridgersQuoteRequest = {
            fromTokenAddress,
            toTokenAddress,
            fromTokenAmount: fromWithoutFee.stringWeiAmount,
            fromTokenChain: toBridgersBlockchain[fromBlockchain],
            toTokenChain: toBridgersBlockchain[toBlockchain],
            sourceFlag: 'rubic'
        };
        const quoteResponse = await Injector.httpClient.post<BridgersQuoteResponse>(
            'https://sswap.swft.pro/api/sswap/quote',
            quoteRequest
        );
        const amountMinWei = Web3Pure.toWei(
            fromWithoutFee.tokenAmount
                .minus(quoteResponse.data.txData.serviceFee)
                .multipliedBy(quoteResponse.data.txData.instantRate)
                .minus(quoteResponse.data.txData.chainFee),
            this.to.decimals
        );

        const fromAddress = this.walletAddress;
        const swapRequest: BridgersSwapRequest = {
            fromTokenAddress,
            toTokenAddress,
            fromAddress,
            toAddress: receiverAddress!,
            fromTokenChain: toBridgersBlockchain[fromBlockchain],
            toTokenChain: toBridgersBlockchain[toBlockchain],
            fromTokenAmount: fromWithoutFee.stringWeiAmount,
            amountOutMin: amountMinWei,
            equipmentNo: fromAddress.slice(0, 32),
            sourceFlag: 'rubic',
            slippage: this.slippage.toString()
        };

        const swapData = await Injector.httpClient.post<
            BridgersSwapResponse<TronBridgersTransactionData>
        >('https://sswap.swft.pro/api/sswap/swap', swapRequest);
        if (swapData.resCode === 1146) {
            throw new NotSupportedRegionError();
        }
        if (!swapData.data?.txData) {
            throw new NotSupportedTokensError();
        }

        const config = swapData.data?.txData;

        return {
            amount: amountMinWei,
            config: {
                signature: config.functionName,
                arguments: config.parameter,
                to: config.to,
                feeLimit: config?.options?.feeLimit,
                callValue: config?.options?.callValue
            }
        };
    }
}
