import BigNumber from 'bignumber.js';
import { PriceTokenAmount } from 'src/common/tokens';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';

import { CROSS_CHAIN_TRADE_TYPE, CrossChainTradeType } from '../../models/cross-chain-trade-type';
import { EvmCrossChainTrade } from '../common/emv-cross-chain-trade/evm-cross-chain-trade';
import { GasData } from '../common/emv-cross-chain-trade/models/gas-data';
import { BridgeType } from '../common/models/bridge-type';
import { FeeInfo } from '../common/models/fee-info';
import { OnChainSubtype } from '../common/models/on-chain-subtype';
import { RangoCrossChainTradeConstructorParams } from './model/rango-types';

export class RangoCrossChainTrade extends EvmCrossChainTrade {
    public type: CrossChainTradeType = CROSS_CHAIN_TRADE_TYPE.RANGO;

    public isAggregator: boolean = true;

    public to: PriceTokenAmount<EvmBlockchainName>;

    public from: PriceTokenAmount<EvmBlockchainName>;

    public toTokenAmountMin: BigNumber;

    public feeInfo: FeeInfo;

    public onChainSubtype: OnChainSubtype;

    public bridgeType: BridgeType;

    public gasData: GasData;

    constructor(params: RangoCrossChainTradeConstructorParams) {
        super(params.providerAddress, params.routePath);
        this.to = params.crossChainTrade.to;
        this.from = params.crossChainTrade.from;
        this.toTokenAmountMin = params.crossChainTrade.toTokenAmountMin;
        this.feeInfo = params.crossChainTrade.feeInfo;
        this.onChainSubtype = params.crossChainTrade.onChainSubtype;
        this.bridgeType = params.crossChainTrade.bridgeType;
        this.gasData = params.crossChainTrade.gasData;
    }
}
