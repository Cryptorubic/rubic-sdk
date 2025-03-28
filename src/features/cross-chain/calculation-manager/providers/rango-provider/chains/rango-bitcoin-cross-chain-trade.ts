import BigNumber from 'bignumber.js';
import { PriceTokenAmount } from 'src/common/tokens';
import { BitcoinBlockchainName, BlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { RangoSwapQueryParams } from 'src/features/common/providers/rango/models/rango-parser-types';
import { RangoSupportedBlockchain } from 'src/features/common/providers/rango/models/rango-supported-blockchains';
import { BitcoinCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/common/bitcoin-cross-chain-trade/bitcoin-cross-chain-trade';

import {
    CROSS_CHAIN_TRADE_TYPE,
    CrossChainTradeType
} from '../../../models/cross-chain-trade-type';
import { GasData } from '../../common/evm-cross-chain-trade/models/gas-data';
import { BRIDGE_TYPE, BridgeType } from '../../common/models/bridge-type';
import { FeeInfo } from '../../common/models/fee-info';
import { OnChainSubtype } from '../../common/models/on-chain-subtype';
import { TradeInfo } from '../../common/models/trade-info';
import { RangoCrossChainTradeConstructorParams } from '../model/rango-cross-chain-parser-types';

export class RangoBitcoinCrossChainTrade extends BitcoinCrossChainTrade {
    public readonly type: CrossChainTradeType = CROSS_CHAIN_TRADE_TYPE.RANGO;

    public readonly isAggregator: boolean = true;

    public readonly to: PriceTokenAmount<BlockchainName>;

    public readonly from: PriceTokenAmount<BitcoinBlockchainName>;

    public readonly toTokenAmountMin: BigNumber;

    public readonly feeInfo: FeeInfo;

    public readonly onChainSubtype: OnChainSubtype = { from: undefined, to: undefined };

    public readonly bridgeType: BridgeType = BRIDGE_TYPE.RANGO;

    public readonly gasData: GasData;

    public readonly priceImpact: number | null;

    private readonly slippage: number;

    protected readonly needProvidePubKey = false;

    /**
     * @description UUID returned by rango-api to track transaction status in getRangoDstSwapStatus
     */
    public rangoRequestId: string | undefined;

    private readonly swapQueryParams: RangoSwapQueryParams;

    private get fromBlockchain(): RangoSupportedBlockchain {
        return this.from.blockchain as RangoSupportedBlockchain;
    }

    protected get fromContractAddress(): string {
        throw new Error('Method not supported');
    }

    protected get methodName(): string {
        throw new Error('Method not supported');
    }

    public readonly memo: string;

    constructor(params: RangoCrossChainTradeConstructorParams<BitcoinBlockchainName>) {
        super(params.providerAddress, params.routePath, params.apiQuote, params.apiResponse);
        this.to = params.crossChainTrade.to;
        this.from = params.crossChainTrade.from;
        this.toTokenAmountMin = params.crossChainTrade.toTokenAmountMin;
        this.feeInfo = params.crossChainTrade.feeInfo;
        this.gasData = params.crossChainTrade.gasData;
        this.priceImpact = params.crossChainTrade.priceImpact;
        this.slippage = params.crossChainTrade.slippage;
        this.swapQueryParams = params.crossChainTrade.swapQueryParams;
        this.bridgeType = params.crossChainTrade.bridgeSubtype || BRIDGE_TYPE.RANGO;
        this.memo = params.crossChainTrade.memo!;
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
