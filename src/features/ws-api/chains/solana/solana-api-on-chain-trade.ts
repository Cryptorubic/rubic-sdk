import { SolanaBlockchainName } from '@cryptorubic/core';
import { PriceTokenAmount } from 'src/common/tokens';
import { GasData } from 'src/features/cross-chain/calculation-manager/providers/common/evm-cross-chain-trade/models/gas-data';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { OnChainSubtype } from 'src/features/cross-chain/calculation-manager/providers/common/models/on-chain-subtype';
import { SolanaOnChainTrade } from 'src/features/on-chain/calculation-manager/common/on-chain-trade/solana-on-chain-trade/solana-on-chain-trade';
import { OnChainTradeType } from 'src/features/on-chain/calculation-manager/models/on-chain-trade-type';
import { SolanaApiOnChainConstructor } from 'src/features/ws-api/chains/solana/solana-api-on-chain-constructor';

export class SolanaApiOnChainTrade extends SolanaOnChainTrade {
    public readonly feeInfo: FeeInfo;

    public readonly from: PriceTokenAmount<SolanaBlockchainName>;

    public readonly gasData: GasData;

    public readonly onChainSubtype: OnChainSubtype = { from: undefined, to: undefined };

    public readonly to: PriceTokenAmount<SolanaBlockchainName>;

    public readonly type: OnChainTradeType;

    private readonly _priceImpact: number | null;

    public get priceImpact(): number | null {
        return this._priceImpact;
    }

    public readonly slippage: number;

    public readonly dexContractAddress = '';

    constructor(params: SolanaApiOnChainConstructor) {
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
