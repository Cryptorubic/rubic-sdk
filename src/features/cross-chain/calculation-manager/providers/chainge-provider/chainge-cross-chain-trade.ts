import BigNumber from 'bignumber.js';
import { PriceTokenAmount } from 'src/common/tokens';
import { BlockchainName, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { ContractParams } from 'src/features/common/models/contract-params';
import { TradeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/trade-info';
import { CROSS_CHAIN_TRADE_TYPE } from '../../models/cross-chain-trade-type';
import { EvmCrossChainTrade } from '../common/emv-cross-chain-trade/evm-cross-chain-trade';
import { GasData } from '../common/emv-cross-chain-trade/models/gas-data';
import { BridgeType } from '../common/models/bridge-type';
import { FeeInfo } from '../common/models/fee-info';
import { GetContractParamsOptions } from '../common/models/get-contract-params-options';
import { OnChainSubtype } from '../common/models/on-chain-subtype';

export class ChaingeCrossChainTrade extends EvmCrossChainTrade {
    public readonly from: PriceTokenAmount<EvmBlockchainName>;

    public readonly gasData: GasData;

    protected getContractParams(_options: GetContractParamsOptions): Promise<ContractParams> {
        throw new Error('Method not implemented.');
    }

    public readonly type = CROSS_CHAIN_TRADE_TYPE.CHAINGE;

    public readonly to: PriceTokenAmount<BlockchainName>;

    public readonly toTokenAmountMin: BigNumber;

    public readonly feeInfo: FeeInfo;

    public readonly onChainSubtype: OnChainSubtype = {
        from: undefined,
        to: undefined
    };

    public readonly bridgeType: BridgeType = 'across';

    public readonly isAggregator = true;

    private readonly priceImpact: number;

    private readonly slippage: number;

    protected get fromContractAddress(): string {
        throw new Error('Method not implemented.');
    }

    constructor(
        crossChainTrade: {
            from: PriceTokenAmount<EvmBlockchainName>;
            to: PriceTokenAmount<EvmBlockchainName>;
            gasData: GasData | null;
            toTokenAmountMin: BigNumber;
            feeInfo: FeeInfo;
            priceImpact: number;
            slippage: number;
        },
        providerAddress: string
    ) {
        super(providerAddress);

        this.from = crossChainTrade.from;
        this.to = crossChainTrade.to;
        this.gasData = crossChainTrade.gasData;
        this.feeInfo = crossChainTrade.feeInfo;
        this.toTokenAmountMin = crossChainTrade.toTokenAmountMin;
        this.priceImpact = crossChainTrade.priceImpact;
        this.slippage = crossChainTrade.slippage;
    }

    public getUsdPrice(): BigNumber {
        return this.from.price.multipliedBy(this.from.tokenAmount);
    }

    public getTradeInfo(): TradeInfo {
        return {
            estimatedGas: this.estimatedGas,
            feeInfo: this.feeInfo,
            priceImpact: this.priceImpact ? { total: this.priceImpact } : null,
            slippage: { total: this.slippage * 100 }
        };
    }

    public getTradeAmountRatio(fromUsd: BigNumber): BigNumber {
        return fromUsd.dividedBy(this.to.tokenAmount);
    }
}
