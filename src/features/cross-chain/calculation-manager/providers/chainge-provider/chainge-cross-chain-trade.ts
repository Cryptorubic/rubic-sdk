import BigNumber from 'bignumber.js';
import { PriceTokenAmount } from 'src/common/tokens';
import { EvmBlockchainName, BlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { CROSS_CHAIN_TRADE_TYPE } from '../../models/cross-chain-trade-type';
import { EvmCrossChainTrade } from '../common/emv-cross-chain-trade/evm-cross-chain-trade';
import { GasData } from '../common/emv-cross-chain-trade/models/gas-data';
import { BridgeType } from '../common/models/bridge-type';
import { ContractParams } from '../common/models/contract-params';
import { FeeInfo } from '../common/models/fee-info';
import { GetContractParamsOptions } from '../common/models/get-contract-params-options';
import { OnChainSubtype } from '../common/models/on-chain-subtype';

export class ChaingeCrossChainTrade extends EvmCrossChainTrade {
    public from: PriceTokenAmount<EvmBlockchainName>;

    public gasData: GasData;

    protected getContractParams(_options: GetContractParamsOptions): Promise<ContractParams> {
        throw new Error('Method not implemented.');
    }

    public type = CROSS_CHAIN_TRADE_TYPE.CHAINGE;

    public to: PriceTokenAmount<BlockchainName>;

    public toTokenAmountMin: BigNumber;

    public feeInfo: FeeInfo;

    public onChainSubtype: OnChainSubtype = {
        from: undefined,
        to: undefined
    };

    public bridgeType: BridgeType = 'across';

    public isAggregator = true;

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
        },
        providerAddress: string
    ) {
        super(providerAddress);

        this.from = crossChainTrade.from;
        this.to = crossChainTrade.to;
        this.gasData = crossChainTrade.gasData;
        this.feeInfo = crossChainTrade.feeInfo;
        this.toTokenAmountMin = crossChainTrade.toTokenAmountMin;
    }

    public getTradeAmountRatio(_fromUsd: BigNumber): BigNumber {
        return new BigNumber(1);
    }
}
