import { EvmBlockchainName, Token } from '@cryptorubic/core';
import BigNumber from 'bignumber.js';
import { PriceTokenAmount } from 'src/common/tokens';
import { CrossChainTradeType } from 'src/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { EvmCrossChainTrade } from 'src/features/cross-chain/calculation-manager/providers/common/evm-cross-chain-trade/evm-cross-chain-trade';
import { GasData } from 'src/features/cross-chain/calculation-manager/providers/common/evm-cross-chain-trade/models/gas-data';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { OnChainSubtype } from 'src/features/cross-chain/calculation-manager/providers/common/models/on-chain-subtype';
import { TradeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/trade-info';
import { EvmApiCrossChainConstructor } from 'src/features/ws-api/chains/evm/evm-api-cross-chain-constructor';

export class EvmApiCrossChainTrade extends EvmCrossChainTrade {
    public readonly feeInfo: FeeInfo;

    public readonly from: PriceTokenAmount<EvmBlockchainName>;

    public readonly gasData: GasData;

    public readonly onChainSubtype: OnChainSubtype = { from: undefined, to: undefined };

    public readonly to: PriceTokenAmount;

    public readonly toTokenAmountMin: BigNumber;

    public readonly type: CrossChainTradeType;

    public readonly priceImpact: number | null;

    public readonly slippage: number;

    public readonly bridgeType: CrossChainTradeType;

    public readonly isAggregator = false;

    protected readonly isWalletAuth: boolean;

    public get needAuthWallet(): boolean {
        return this.isWalletAuth;
    }

    constructor(params: EvmApiCrossChainConstructor) {
        super(
            params.apiQuote.integratorAddress!,
            params.routePath,
            params.apiQuote,
            params.apiResponse
        );

        this.type = params.apiResponse.providerType as CrossChainTradeType;
        this.bridgeType = this.type;
        this.toTokenAmountMin = Token.fromWei(
            params.apiResponse.estimate.destinationWeiMinAmount,
            params.to.decimals
        );
        this.priceImpact = params.apiResponse.estimate.priceImpact;
        this.slippage = params.apiResponse.estimate.slippage;

        this.to = params.to;
        this.feeInfo = params.feeInfo;
        this.from = params.from;
        this.gasData = null;
        this.isWalletAuth = Boolean(params.needAuthWallet);
    }

    public getTradeInfo(): TradeInfo {
        return {
            estimatedGas: null,
            feeInfo: this.feeInfo,
            priceImpact: this.priceImpact,
            slippage: this.slippage * 100,
            routePath: this.routePath
        };
    }
}
