import { TonBlockchainName } from '@cryptorubic/core';
import { PriceTokenAmount } from 'src/common/tokens';
import { EncodeTransactionOptions } from 'src/features/common/models/encode-transaction-options';
import { GasData } from 'src/features/cross-chain/calculation-manager/providers/common/evm-cross-chain-trade/models/gas-data';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { OnChainSubtype } from 'src/features/cross-chain/calculation-manager/providers/common/models/on-chain-subtype';
import { TonOnChainTrade } from 'src/features/on-chain/calculation-manager/common/on-chain-trade/ton-on-chain-trade/ton-on-chain-trade';
import { OnChainTradeType } from 'src/features/on-chain/calculation-manager/models/on-chain-trade-type';
import { TonApiOnChainConstructor } from 'src/features/ws-api/chains/ton/ton-api-on-chain-constructor';

export class TonApiOnChainTrade extends TonOnChainTrade {
    public readonly feeInfo: FeeInfo;

    public readonly from: PriceTokenAmount<TonBlockchainName>;

    public readonly gasData: GasData;

    public readonly onChainSubtype: OnChainSubtype = { from: undefined, to: undefined };

    public readonly to: PriceTokenAmount<TonBlockchainName>;

    public readonly type: OnChainTradeType;

    private readonly _priceImpact: number | null;

    public get priceImpact(): number | null {
        return this._priceImpact;
    }

    public readonly slippage: number;

    public readonly dexContractAddress = '';

    constructor(params: TonApiOnChainConstructor) {
        super(params.tradeStruct, params.apiQuote.integratorAddress!);

        this.type = params.apiResponse.providerType as OnChainTradeType;
        this._priceImpact = params.apiResponse.estimate.priceImpact;
        this.slippage = params.apiResponse.estimate.slippage;

        this.to = params.to;
        this.feeInfo = params.feeInfo;
        this.from = params.from;
        this.gasData = null;
    }

    protected calculateOutputAmount(_options: EncodeTransactionOptions): Promise<string> {
        // @TODO API
        throw new Error('Not implemented');
    }
}
