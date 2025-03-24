import { beginCell, Cell } from '@ton/core';
import BigNumber from 'bignumber.js';
import {
    FailedToCheckForTransactionReceiptError,
    NotSupportedTokensError
} from 'src/common/errors';
import { NotSupportedRegionError } from 'src/common/errors/swap/not-supported-region';
import { PriceTokenAmount } from 'src/common/tokens';
import { BLOCKCHAIN_NAME, TonBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { TonEncodedConfig } from 'src/core/blockchain/web3-private-service/web3-private/ton-web3-private/models/ton-types';
import { TonWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/ton-web3-pure/ton-web3-pure';
import { Injector } from 'src/core/injector/injector';
import { ContractParams } from 'src/features/common/models/contract-params';
import { SwapTransactionOptions } from 'src/features/common/models/swap-transaction-options';
import { bridgersNativeAddress } from 'src/features/common/providers/bridgers/constants/bridgers-native-address';
import { toBridgersBlockchain } from 'src/features/common/providers/bridgers/constants/to-bridgers-blockchain';
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

import { CROSS_CHAIN_TRADE_TYPE } from '../../../models/cross-chain-trade-type';
import { BRIDGE_TYPE } from '../../common/models/bridge-type';
import { FeeInfo } from '../../common/models/fee-info';
import { TradeInfo } from '../../common/models/trade-info';
import { TonCrossChainTrade } from '../../common/ton-cross-chain-trade/ton-cross-chain-trade';
import { BridgersCrossChainSupportedBlockchain } from '../constants/bridgers-cross-chain-supported-blockchain';
import { BridgersTonCrossChainParams } from '../models/bridgers-cross-chain-trade-types';
import { TonBridgersTransactionData } from '../models/ton-bridgers-transaction-data';

export class TonBridgersCrossChainTrade extends TonCrossChainTrade {
    public readonly type = CROSS_CHAIN_TRADE_TYPE.BRIDGERS;

    public readonly isAggregator = false;

    public readonly from: PriceTokenAmount<TonBlockchainName>;

    public readonly to: PriceTokenAmount;

    public readonly toTokenAmountMin: BigNumber;

    public readonly feeInfo: FeeInfo;

    public readonly onChainSubtype = { from: undefined, to: undefined };

    public readonly bridgeType = BRIDGE_TYPE.BRIDGERS;

    public readonly priceImpact: number | null;

    private readonly slippage: number;

    protected get fromContractAddress(): string {
        throw new Error('Not implemented');
    }

    protected get methodName(): string {
        throw new Error('Not implemented');
    }

    constructor(params: BridgersTonCrossChainParams) {
        super(params.providerAddress, params.routePath, params.useProxy);

        this.from = params.crossChainTrade.from;
        this.to = params.crossChainTrade.to;
        this.priceImpact = this.from.calculatePriceImpactPercent(this.to);
        this.toTokenAmountMin = params.crossChainTrade.toTokenAmountMin;
        this.feeInfo = params.crossChainTrade.feeInfo;
        this.slippage = params.crossChainTrade.slippage;
    }

    public async swap(options: SwapTransactionOptions = {}): Promise<string | never> {
        if (!options?.testMode) {
            await this.checkTradeErrors();
        }
        await this.checkReceiverAddress(options.receiverAddress, true);

        const config = await this.setTransactionConfig(
            false,
            options?.useCacheData || false,
            options?.receiverAddress || this.walletAddress
        );

        const { onConfirm } = options;
        let transactionHash: string;
        const onTransactionHash = (hash: string) => {
            if (onConfirm) {
                onConfirm(hash);
            }
            transactionHash = hash;
        };

        try {
            await this.web3Private.sendTransaction({ messages: [config], onTransactionHash });

            return transactionHash!;
        } catch (err) {
            if (err instanceof FailedToCheckForTransactionReceiptError) {
                return transactionHash!;
            }
            throw err;
        }
    }

    protected getContractParams(): Promise<ContractParams> {
        throw new Error('Not implemeted');
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
    ): Promise<{ config: TonEncodedConfig; amount: string }> {
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
        const amount = quoteResponse.data?.txData?.amountOutMin;

        const fromAddress = this.walletAddress;
        const swapRequest: BridgersSwapRequest = {
            fromTokenAddress,
            toTokenAddress,
            fromAddress,
            toAddress: receiverAddress!,
            fromTokenChain: toBridgersBlockchain[fromBlockchain],
            toTokenChain: toBridgersBlockchain[toBlockchain],
            fromTokenAmount: fromWithoutFee.stringWeiAmount,
            amountOutMin: amount,
            equipmentNo: fromAddress.slice(0, 32),
            sourceFlag: 'rubic',
            slippage: this.slippage.toString()
        };

        const swapData = await Injector.httpClient.post<
            BridgersSwapResponse<TonBridgersTransactionData>
        >('https://sswap.swft.pro/api/sswap/swap', swapRequest);

        if (swapData.resCode === 1146) throw new NotSupportedRegionError();
        if (!swapData.data?.txData) throw new NotSupportedTokensError();

        const newPayloadCell = new Cell();
        const bridgersTxCell = TonWeb3Pure.fromBase64ToCell(swapData.data?.txData.payload);
        const cellWithIntegratorId = beginCell().storeStringTail(this.providerAddress).endCell();

        // const newPayloadCell = bridgersTxCell.asBuilder().storeRef(cellWithIntegratorId).endCell();

        newPayloadCell.refs.push(bridgersTxCell); // Reference the original payload
        newPayloadCell.refs.push(cellWithIntegratorId); // Add the "Rubic" parameter

        return {
            config: {
                address: swapData.data?.txData.address,
                amount: swapData.data?.txData.amount,
                payload: newPayloadCell.toBoc().toString('base64')
            },
            amount
        };
    }
}
