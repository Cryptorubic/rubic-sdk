import { TronBlockchainName } from '@cryptorubic/core';
import { PriceTokenAmount } from 'src/common/tokens';
import { GasData } from 'src/features/cross-chain/calculation-manager/providers/common/evm-cross-chain-trade/models/gas-data';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { OnChainSubtype } from 'src/features/cross-chain/calculation-manager/providers/common/models/on-chain-subtype';
import { TronOnChainTrade } from 'src/features/on-chain/calculation-manager/common/on-chain-trade/tron-on-chain-trade/tron-on-chain-trade';
import { OnChainTradeType } from 'src/features/on-chain/calculation-manager/models/on-chain-trade-type';
import { TronApiOnChainConstructor } from 'src/features/ws-api/chains/tron/tron-api-on-chain-constructor';

export class TronApiOnChainTrade extends TronOnChainTrade {
    public readonly feeInfo: FeeInfo;

    public readonly from: PriceTokenAmount<TronBlockchainName>;

    public readonly gasData: GasData;

    public readonly onChainSubtype: OnChainSubtype = { from: undefined, to: undefined };

    public readonly to: PriceTokenAmount<TronBlockchainName>;

    public readonly type: OnChainTradeType;

    private readonly _priceImpact: number | null;

    public get priceImpact(): number | null {
        return this._priceImpact;
    }

    public readonly slippageTolerance: number;

    public readonly isAggregator = false;

    public readonly dexContractAddress = '';

    // @TODO API
    public readonly path = [];

    // @TODO API
    public readonly spenderAddress = '';

    constructor(params: TronApiOnChainConstructor) {
        super(params.apiQuote.integratorAddress!);

        this.type = params.apiResponse.providerType as OnChainTradeType;
        this._priceImpact = params.apiResponse.estimate.priceImpact;
        this.slippageTolerance = params.apiResponse.estimate.slippage;

        this.to = params.to;
        this.feeInfo = params.feeInfo;
        this.from = params.from;
        this.gasData = null;
    }
}
