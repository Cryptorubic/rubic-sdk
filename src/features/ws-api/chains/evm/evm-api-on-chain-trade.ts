import { EvmBlockchainName } from '@cryptorubic/core';
import { PriceTokenAmount } from 'src/common/tokens';
import { GasData } from 'src/features/cross-chain/calculation-manager/providers/common/evm-cross-chain-trade/models/gas-data';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { OnChainSubtype } from 'src/features/cross-chain/calculation-manager/providers/common/models/on-chain-subtype';
import { EvmOnChainTrade } from 'src/features/on-chain/calculation-manager/common/on-chain-trade/evm-on-chain-trade/evm-on-chain-trade';
import { OnChainTradeType } from 'src/features/on-chain/calculation-manager/models/on-chain-trade-type';
import { EvmApiOnChainConstructor } from 'src/features/ws-api/chains/evm/evm-api-on-chain-constructor';

export class EvmApiOnChainTrade extends EvmOnChainTrade {
    public readonly feeInfo: FeeInfo;

    public readonly from: PriceTokenAmount<EvmBlockchainName>;

    public readonly gasData: GasData;

    public readonly onChainSubtype: OnChainSubtype = { from: undefined, to: undefined };

    public readonly to: PriceTokenAmount<EvmBlockchainName>;

    public readonly type: OnChainTradeType;

    private readonly _priceImpact: number | null;

    public get priceImpact(): number | null {
        return this._priceImpact;
    }

    public readonly slippage: number;

    public readonly isAggregator = false;

    public readonly dexContractAddress = '';

    constructor(params: EvmApiOnChainConstructor) {
        super(params.tradeStruct);

        this.type = params.tradeStruct.apiResponse!.providerType as OnChainTradeType;
        this._priceImpact = params.tradeStruct.apiResponse!.estimate.priceImpact;
        this.slippage = params.tradeStruct.apiResponse!.estimate.slippage;

        this.to = params.to;
        this.feeInfo = params.feeInfo;
        this.from = params.from;
        this.gasData = null;
    }
}
