import BigNumber from 'bignumber.js';
import { PriceTokenAmount } from 'src/common/tokens';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import {
    CROSS_CHAIN_TRADE_TYPE,
    CrossChainTradeType
} from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { EvmCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/common/evm-cross-chain-trade/evm-cross-chain-trade';
import { GasData } from 'src/features/cross-chain/calculation-manager/providers/common/evm-cross-chain-trade/models/gas-data';
import {
    BRIDGE_TYPE,
    BridgeType
} from 'src/features/cross-chain/calculation-manager/providers/common/models/bridge-type';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { OnChainSubtype } from 'src/features/cross-chain/calculation-manager/providers/common/models/on-chain-subtype';
import { TradeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/trade-info';
import { MesonCrossChainEvmTradeConstructorParams } from 'src/features/cross-chain/calculation-manager/providers/meson-provider/models/meson-trade-types';

export class MesonCrossChainEvmTrade extends EvmCrossChainTrade {
    /**ABSTRACT PROPS */
    public readonly type: CrossChainTradeType = CROSS_CHAIN_TRADE_TYPE.MESON;

    public readonly isAggregator: boolean = false;

    public readonly to: PriceTokenAmount;

    public readonly from: PriceTokenAmount<EvmBlockchainName>; // 0.0011

    public readonly toTokenAmountMin: BigNumber;

    public readonly feeInfo: FeeInfo;

    public readonly onChainSubtype: OnChainSubtype = { from: undefined, to: undefined };

    public readonly bridgeType: BridgeType = BRIDGE_TYPE.MESON;

    public readonly gasData: GasData;

    public readonly priceImpact: number | null;
    /** */

    /* Used in swap-request, example `bnb:usdc` */
    private readonly sourceAssetString: string;

    private readonly targetAssetString: string;

    protected get methodName(): string {
        return 'startBridgeTokensViaGenericCrossChain';
    }

    constructor(params: MesonCrossChainEvmTradeConstructorParams) {
        super(params.providerAddress, params.routePath, params.apiQuote, params.apiResponse);
        this.to = params.crossChainTrade.to;
        this.from = params.crossChainTrade.from;
        this.feeInfo = params.crossChainTrade.feeInfo;
        this.gasData = params.crossChainTrade.gasData;
        this.priceImpact = params.crossChainTrade.priceImpact;
        this.toTokenAmountMin = this.to.tokenAmount;
        this.sourceAssetString = params.crossChainTrade.sourceAssetString;
        this.targetAssetString = params.crossChainTrade.targetAssetString;
    }

    public getTradeInfo(): TradeInfo {
        return {
            estimatedGas: this.estimatedGas,
            feeInfo: this.feeInfo,
            priceImpact: this.priceImpact || null,
            slippage: 0,
            routePath: this.routePath
        };
    }
}
