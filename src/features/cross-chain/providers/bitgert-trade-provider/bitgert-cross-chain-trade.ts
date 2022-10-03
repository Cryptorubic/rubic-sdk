import BigNumber from 'bignumber.js';
import { PriceTokenAmount, Web3Public } from 'src/core';
import { Injector } from 'src/core/sdk/injector';
import { SwapTransactionOptions } from 'src/features/instant-trades';
import { ContractParams } from '../../models/contract-params';
import { CROSS_CHAIN_TRADE_TYPE } from '../../models/cross-chain-trade-type';
import { GasData } from '../../models/gas-data';
import { ItType } from '../../models/it-type';
import { CrossChainTrade } from '../common/cross-chain-trade';
import { FeeInfo } from '../common/models/fee';

export class BitgertCrossChainTrade extends CrossChainTrade {
    public readonly type = CROSS_CHAIN_TRADE_TYPE.BITGERT_BRIDGE;

    public from: PriceTokenAmount;

    public to: PriceTokenAmount;

    public toTokenAmountMin: BigNumber;

    public gasData: GasData;

    public readonly cryptoFeeToken: PriceTokenAmount;

    protected fromWeb3Public: Web3Public;

    protected get fromContractAddress(): string {
        throw new Error('Method not implemented.');
    }

    public itType: ItType = {
        from: undefined,
        to: undefined
    };

    public feeInfo: FeeInfo;

    public readonly slippage: number;

    constructor(
        crossChainTrade: {
            from: PriceTokenAmount;
            to: PriceTokenAmount;
            toTokenAmountMin: BigNumber;
            slippageTolerance: number;
            cryptoFeeToken: PriceTokenAmount;
            gasData: GasData | null;
            feeInfo: FeeInfo;
        },
        providerAddress: string
    ) {
        super(providerAddress);
        this.from = crossChainTrade.from;
        this.to = crossChainTrade.to;
        this.toTokenAmountMin = crossChainTrade.toTokenAmountMin;
        this.slippage = crossChainTrade.slippageTolerance;
        this.gasData = crossChainTrade.gasData;
        this.feeInfo = crossChainTrade.feeInfo;
        this.cryptoFeeToken = crossChainTrade.cryptoFeeToken;
        this.fromWeb3Public = Injector.web3PublicService.getWeb3Public(
            crossChainTrade.from.blockchain
        );
    }

    public swap(options?: SwapTransactionOptions | undefined): Promise<string> {
        console.log(options);
        throw new Error('Method not implemented.');
    }

    public getContractParams(options: {
        fromAddress?: string | undefined;
        receiverAddress?: string | undefined;
    }): Promise<ContractParams> {
        console.log(options);
        throw new Error('Method not implemented.');
    }

    public getTradeAmountRatio(fromUsd: BigNumber): BigNumber {
        console.log(fromUsd);
        throw new Error('Method not implemented.');
    }
}
