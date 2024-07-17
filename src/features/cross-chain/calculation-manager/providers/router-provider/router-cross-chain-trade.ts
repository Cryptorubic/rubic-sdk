import BigNumber from "bignumber.js";
import { PriceTokenAmount } from "src/common/tokens";
import { EvmBlockchainName } from "src/core/blockchain/models/blockchain-name";
import { EvmWeb3Pure } from "src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure";
import { RouterQuoteResponseConfig } from "src/features/common/providers/router/models/router-quote-response-config";
import { CrossChainTradeType, CROSS_CHAIN_TRADE_TYPE } from "../../models/cross-chain-trade-type";
import { getCrossChainGasData } from "../../utils/get-cross-chain-gas-data";
import { EvmCrossChainTrade } from "../common/emv-cross-chain-trade/evm-cross-chain-trade";
import { GasData } from "../common/emv-cross-chain-trade/models/gas-data";
import { BridgeType, BRIDGE_TYPE } from "../common/models/bridge-type";
import { FeeInfo } from "../common/models/fee-info";
import { OnChainSubtype } from "../common/models/on-chain-subtype";
import { RubicStep } from "../common/models/rubicStep";


export class RouterCrossChainTrade extends EvmCrossChainTrade {

    public static async getGasData(
        from: PriceTokenAmount<EvmBlockchainName>,
        to: PriceTokenAmount<EvmBlockchainName>,
        feeInfo: FeeInfo,
        providerAddress: string,
        receiverAddress?: string
    ): Promise<GasData | null> {
        const trade = new RouterCrossChainTrade(
            {
                from,
                to,
                feeInfo,
                gasData: null,
                priceImpact: 0
            },
            providerAddress: providerAddress || EvmWeb3Pure.EMPTY_ADDRESS,
            []
        );
        return getCrossChainGasData(trade, receiverAddress)
    }

    public readonly type: CrossChainTradeType = CROSS_CHAIN_TRADE_TYPE.ROUTER;

    public readonly to: PriceTokenAmount<EvmBlockchainName>;

    public readonly from: PriceTokenAmount<EvmBlockchainName>;

    public readonly toTokenAmountMin: BigNumber;

    public readonly feeInfo: FeeInfo;

    public readonly onChainSubtype: OnChainSubtype = { from: undefined, to: undefined };

    public readonly bridgeType: BridgeType = BRIDGE_TYPE.ROUTER;

    public readonly gasData: GasData | null;

    public readonly priceImpact: number | null;

    private readonly slippage: number;

    private readonly routerQuoteConfig: RouterQuoteResponseConfig;

    constructor(
        crossChainTrade: {
            from: PriceTokenAmount<EvmBlockchainName>,
            to: PriceTokenAmount<EvmBlockchainName>,
            feeInfo: FeeInfo,
            gasData: GasData | null,
            priceImpact: number | null,
            routerQuoteConfig: RouterQuoteResponseConfig
        },
        providerAddress: string,
        routePath: RubicStep[]
    ) {
        super(providerAddress, routePath);
        this.from = crossChainTrade.from;
        this.to = crossChainTrade.to;
        this.feeInfo = crossChainTrade.feeInfo;
        this.gasData = crossChainTrade.gasData;
        this.priceImpact = crossChainTrade.priceImpact;
        this.routerQuoteConfig = crossChainTrade.routerQuoteConfig;
    }

}