import BigNumber from 'bignumber.js';
import { PriceTokenAmount } from 'src/common/tokens';
import { BitcoinBlockchainName, BlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { RouterQuoteResponseConfig } from 'src/features/common/providers/router/models/router-quote-response-config';
import { BitcoinCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/common/bitcoin-cross-chain-trade/bitcoin-cross-chain-trade';
import { RouterBitcoinConstructorParams } from 'src/features/cross-chain/calculation-manager/providers/router-provider/models/router-constructor-params';

import {
    CROSS_CHAIN_TRADE_TYPE,
    CrossChainTradeType
} from '../../../models/cross-chain-trade-type';
import { rubicProxyContractAddress } from '../../common/constants/rubic-proxy-contract-address';
import { GasData } from '../../common/evm-cross-chain-trade/models/gas-data';
import { BRIDGE_TYPE, BridgeType } from '../../common/models/bridge-type';
import { FeeInfo } from '../../common/models/fee-info';
import { OnChainSubtype } from '../../common/models/on-chain-subtype';
import { TradeInfo } from '../../common/models/trade-info';
import { RouterCrossChainSupportedBlockchains } from '../constants/router-cross-chain-supported-chains';

export class RouterBitcoinCrossChainTrade extends BitcoinCrossChainTrade {
    public readonly type: CrossChainTradeType = CROSS_CHAIN_TRADE_TYPE.ROUTER;

    public readonly to: PriceTokenAmount<BlockchainName>;

    public readonly from: PriceTokenAmount<BitcoinBlockchainName>;

    public readonly toTokenAmountMin: BigNumber;

    public readonly feeInfo: FeeInfo;

    public readonly onChainSubtype: OnChainSubtype = { from: undefined, to: undefined };

    public readonly bridgeType: BridgeType = BRIDGE_TYPE.ROUTER;

    public readonly gasData: GasData | null;

    public readonly priceImpact: number | null;

    private readonly slippage: number;

    public readonly isAggregator = false;

    private readonly routerQuoteConfig: RouterQuoteResponseConfig;

    private get fromBlockchain(): RouterCrossChainSupportedBlockchains {
        return this.from.blockchain as RouterCrossChainSupportedBlockchains;
    }

    protected get fromContractAddress(): string {
        return this.useProxy
            ? rubicProxyContractAddress[this.fromBlockchain].gateway
            : this.routerQuoteConfig.allowanceTo;
    }

    protected get methodName(): string {
        return 'startBridgeTokensViaGenericCrossChain';
    }

    public readonly memo: string = '';

    constructor(params: RouterBitcoinConstructorParams) {
        const { providerAddress, routePath, crossChainTrade, apiQuote, apiResponse } = params;
        super(providerAddress, routePath, apiQuote, apiResponse);
        this.from = crossChainTrade.from;
        this.to = crossChainTrade.to;
        this.feeInfo = crossChainTrade.feeInfo;
        this.gasData = crossChainTrade.gasData;
        this.priceImpact = crossChainTrade.priceImpact;
        this.routerQuoteConfig = crossChainTrade.routerQuoteConfig;
        this.slippage = crossChainTrade.slippage;
        this.toTokenAmountMin = this.to.tokenAmount.multipliedBy(1 - this.slippage);
    }

    public getTradeInfo(): TradeInfo {
        return {
            estimatedGas: this.estimatedGas,
            feeInfo: this.feeInfo,
            priceImpact: this.priceImpact,
            slippage: this.slippage * 100,
            routePath: this.routePath
        };
    }
}
