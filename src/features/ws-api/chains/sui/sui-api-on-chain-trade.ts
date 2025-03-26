import { SuiBlockchainName } from '@cryptorubic/core';
import { PriceTokenAmount } from 'src/common/tokens';
import { GasData } from 'src/features/cross-chain/calculation-manager/providers/common/evm-cross-chain-trade/models/gas-data';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { OnChainSubtype } from 'src/features/cross-chain/calculation-manager/providers/common/models/on-chain-subtype';
import { SuiOnChainTrade } from 'src/features/on-chain/calculation-manager/common/on-chain-trade/sui-on-chain-trade/sui-on-chain-trade';
import { OnChainTradeType } from 'src/features/on-chain/calculation-manager/models/on-chain-trade-type';
import { SuiApiOnChainConstructor } from 'src/features/ws-api/chains/sui/sui-api-on-chain-trade-constructor';

export class SuiApiOnChainTrade extends SuiOnChainTrade {
    public readonly feeInfo: FeeInfo;

    public readonly from: PriceTokenAmount<SuiBlockchainName>;

    public readonly gasData: GasData;

    public readonly onChainSubtype: OnChainSubtype = { from: undefined, to: undefined };

    public readonly to: PriceTokenAmount<SuiBlockchainName>;

    public readonly type: OnChainTradeType;

    private readonly _priceImpact: number | null;

    public get priceImpact(): number | null {
        return this._priceImpact;
    }

    public readonly slippage: number;

    public readonly dexContractAddress = '';

    constructor(params: SuiApiOnChainConstructor) {
        super(
            {
                ...params,
                slippageTolerance: params.apiQuote.slippage || 0,
                fromWithoutFee: params.from,
                path: params.routePath,
                useProxy: false,
                gasFeeInfo: null,
                withDeflation: { from: { isDeflation: false }, to: { isDeflation: false } }
            },
            params.apiQuote.integratorAddress!
        );

        this.type = params.apiResponse.providerType as OnChainTradeType;
        this._priceImpact = params.apiResponse.estimate.priceImpact;
        this.slippage = params.apiResponse.estimate.slippage;

        this.to = params.to;
        this.feeInfo = params.feeInfo;
        this.from = params.from;
        this.gasData = null;
    }
}
