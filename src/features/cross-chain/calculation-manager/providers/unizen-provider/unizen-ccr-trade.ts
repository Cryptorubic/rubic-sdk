import { QuoteRequestInterface, QuoteResponseInterface } from '@cryptorubic/core';
import BigNumber from 'bignumber.js';
import { PriceTokenAmount } from 'src/common/tokens';
import { BlockchainName, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';

import { CROSS_CHAIN_TRADE_TYPE } from '../../models/cross-chain-trade-type';
import { rubicProxyContractAddress } from '../common/constants/rubic-proxy-contract-address';
import { EvmCrossChainTrade } from '../common/evm-cross-chain-trade/evm-cross-chain-trade';
import { GasData } from '../common/evm-cross-chain-trade/models/gas-data';
import { BRIDGE_TYPE } from '../common/models/bridge-type';
import { FeeInfo } from '../common/models/fee-info';
import { OnChainSubtype } from '../common/models/on-chain-subtype';
import { RubicStep } from '../common/models/rubicStep';
import { TradeInfo } from '../common/models/trade-info';
import { UniZenCcrSupportedChain } from './constants/unizen-ccr-supported-chains';

export class UniZenCcrTrade extends EvmCrossChainTrade {
    protected get methodName(): string {
        return 'startBridgeTokensViaGenericCrossChain';
    }

    public readonly from: PriceTokenAmount<EvmBlockchainName>;

    public readonly to: PriceTokenAmount<BlockchainName>;

    public readonly feeInfo: FeeInfo;

    public readonly type = CROSS_CHAIN_TRADE_TYPE.UNIZEN;

    public readonly gasData: GasData | null;

    public readonly toTokenAmountMin: BigNumber;

    public readonly isAggregator = false;

    public readonly slippageTolerance: number;

    public readonly priceImpact: number | null;

    public readonly onChainSubtype: OnChainSubtype = { from: undefined, to: undefined };

    public readonly bridgeType = BRIDGE_TYPE.UNIZEN;

    private readonly contractAddress: string;

    constructor(
        ccrTrade: {
            from: PriceTokenAmount<EvmBlockchainName>;
            to: PriceTokenAmount<BlockchainName>;
            feeInfo: FeeInfo;
            gasData: GasData | null;
            slippage: number;
            priceImpact: number | null;
            contractAddress: string;
            toTokenAmountMin: BigNumber;
        },
        providerAddress: string,
        routePath: RubicStep[],
        useProxy: boolean,
        apiQuote: QuoteRequestInterface,
        apiResponse: QuoteResponseInterface
    ) {
        super(providerAddress, routePath, useProxy, apiQuote, apiResponse);

        this.from = ccrTrade.from;
        this.to = ccrTrade.to;
        this.feeInfo = ccrTrade.feeInfo;
        this.gasData = ccrTrade.gasData;
        this.slippageTolerance = ccrTrade.slippage;
        this.toTokenAmountMin = ccrTrade.toTokenAmountMin;
        this.priceImpact = ccrTrade.priceImpact;
        this.contractAddress = ccrTrade.contractAddress;
    }

    private get fromBlockchain(): UniZenCcrSupportedChain {
        return this.from.blockchain as UniZenCcrSupportedChain;
    }

    protected get fromContractAddress(): string {
        return this.isProxyTrade
            ? rubicProxyContractAddress[this.fromBlockchain].gateway
            : this.contractAddress;
    }

    public getTradeInfo(): TradeInfo {
        return {
            estimatedGas: this.estimatedGas,
            feeInfo: this.feeInfo,
            priceImpact: this.priceImpact,
            slippage: this.slippageTolerance * 100,
            routePath: this.routePath
        };
    }
}
