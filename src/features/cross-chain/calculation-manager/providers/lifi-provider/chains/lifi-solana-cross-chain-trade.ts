import { QuoteRequestInterface, QuoteResponseInterface } from '@cryptorubic/core';
import BigNumber from 'bignumber.js';
import { PriceTokenAmount } from 'src/common/tokens';
import { BlockchainName, SolanaBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';

import { CROSS_CHAIN_TRADE_TYPE } from '../../../models/cross-chain-trade-type';
import { rubicProxyContractAddress } from '../../common/constants/rubic-proxy-contract-address';
import { BridgeType } from '../../common/models/bridge-type';
import { FeeInfo } from '../../common/models/fee-info';
import { OnChainSubtype } from '../../common/models/on-chain-subtype';
import { RubicStep } from '../../common/models/rubicStep';
import { TradeInfo } from '../../common/models/trade-info';
import { SolanaCrossChainTrade } from '../../common/solana-cross-chain-trade/solana-cross-chain-trade';
import { LifiCrossChainSupportedBlockchain } from '../constants/lifi-cross-chain-supported-blockchain';
import { LifiCrossChainTradeConstructor } from '../models/lifi-cross-chain-trade-constructor';
import { Route } from '../models/lifi-route';

export class LifiSolanaCrossChainTrade extends SolanaCrossChainTrade {
    /** @internal */
    public readonly type = CROSS_CHAIN_TRADE_TYPE.LIFI;

    public readonly isAggregator = false;

    public readonly from: PriceTokenAmount<SolanaBlockchainName>;

    public readonly to: PriceTokenAmount<BlockchainName>;

    public readonly toTokenAmountMin: BigNumber;

    private readonly route: Route;

    private readonly providerGateway: string;

    public readonly onChainSubtype: OnChainSubtype;

    public readonly bridgeType: BridgeType;

    public readonly priceImpact: number | null;

    public readonly feeInfo: FeeInfo;

    private readonly slippage: number;

    private get fromBlockchain(): LifiCrossChainSupportedBlockchain {
        return this.from.blockchain as LifiCrossChainSupportedBlockchain;
    }

    protected get fromContractAddress(): string {
        if (this.useProxy) {
            throw new Error('Solana contract is not implemented yet');
        }
        return rubicProxyContractAddress[this.fromBlockchain].gateway;
    }

    protected get methodName(): string {
        return 'startBridgeTokensViaGenericCrossChain';
    }

    protected override get amountToCheck(): string {
        return Web3Pure.toWei(this.toTokenAmountMin, this.to.decimals);
    }

    constructor(
        crossChainTrade: LifiCrossChainTradeConstructor<SolanaBlockchainName>,
        providerAddress: string,
        routePath: RubicStep[],
        apiQuote: QuoteRequestInterface,
        apiResponse: QuoteResponseInterface
    ) {
        super(providerAddress, routePath, apiQuote, apiResponse);

        this.from = crossChainTrade.from;
        this.to = crossChainTrade.to;
        this.route = crossChainTrade.route;
        this.providerGateway = this.route.steps[0]!.estimate.approvalAddress;

        this.toTokenAmountMin = crossChainTrade.toTokenAmountMin;
        this.feeInfo = crossChainTrade.feeInfo;
        this.slippage = crossChainTrade.slippage;
        this.priceImpact = crossChainTrade.priceImpact;
        this.onChainSubtype = crossChainTrade.onChainSubtype;
        this.bridgeType = crossChainTrade.bridgeType;
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

    public getTradeAmountRatio(fromUsd: BigNumber): BigNumber {
        return fromUsd.dividedBy(this.to.tokenAmount);
    }
}
