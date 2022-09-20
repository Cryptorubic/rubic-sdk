import { CROSS_CHAIN_TRADE_TYPE } from 'src/features/cross-chain/models/cross-chain-trade-type';
import { TronBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { FeeInfo } from 'src/features/cross-chain/providers/common/models/fee';
import { PriceTokenAmount } from 'src/common/tokens';
import { rubicProxyContractAddress } from 'src/features/cross-chain/providers/common/constants/rubic-proxy-contract-address';
import BigNumber from 'bignumber.js';
import { BridgersEvmCrossChainSupportedBlockchain } from 'src/features/cross-chain/providers/bridgers-trade-provider/constants/bridgers-cross-chain-supported-blockchain';
import { EvmCrossChainTrade } from 'src/features/cross-chain/providers/common/emv-cross-chain-trade/evm-cross-chain-trade';
import { GasData } from 'src/features/cross-chain/providers/common/emv-cross-chain-trade/models/gas-data';
import { ContractParams } from 'src/features/cross-chain/providers/common/models/contract-params';
import { GetContractParamsOptions } from 'src/features/cross-chain/providers/common/models/get-contract-params-options';
import { MarkRequired } from 'ts-essentials';
import { getMethodArgumentsAndTransactionData } from 'src/features/cross-chain/providers/bridgers-trade-provider/utils/get-method-arguments-and-transaction-data';
import { EvmBridgersTransactionData } from 'src/features/cross-chain/providers/bridgers-trade-provider/evm-bridgers-trade/models/evm-bridgers-transaction-data';
import { evmCommonCrossChainAbi } from 'src/features/cross-chain/providers/common/emv-cross-chain-trade/constants/evm-common-cross-chain-abi';

export class EvmBridgersCrossChainTrade extends EvmCrossChainTrade {
    public readonly type = CROSS_CHAIN_TRADE_TYPE.BRIDGERS;

    public readonly from: PriceTokenAmount<BridgersEvmCrossChainSupportedBlockchain>;

    public readonly to: PriceTokenAmount<TronBlockchainName>;

    public readonly toTokenAmountMin: BigNumber;

    public readonly gasData: GasData = null;

    public readonly feeInfo: FeeInfo;

    public readonly itType = { from: undefined, to: undefined };

    protected get fromContractAddress(): string {
        return rubicProxyContractAddress[this.from.blockchain];
    }

    constructor(
        crossChainTrade: {
            from: PriceTokenAmount<BridgersEvmCrossChainSupportedBlockchain>;
            to: PriceTokenAmount<TronBlockchainName>;
            toTokenAmountMin: BigNumber;
            feeInfo: FeeInfo;
        },
        providerAddress: string
    ) {
        super(providerAddress);

        this.from = crossChainTrade.from;
        this.to = crossChainTrade.to;
        this.toTokenAmountMin = crossChainTrade.toTokenAmountMin;
        this.feeInfo = crossChainTrade.feeInfo;
    }

    protected async getContractParams(
        options: MarkRequired<GetContractParamsOptions, 'receiverAddress'>
    ): Promise<ContractParams> {
        const { methodArguments, transactionData } =
            await getMethodArgumentsAndTransactionData<EvmBridgersTransactionData>(
                this.from,
                this.to,
                this.toTokenAmountMin,
                this.walletAddress,
                options
            );

        const encodedData = transactionData.data;
        methodArguments.push(encodedData);

        const value = new BigNumber(transactionData.value)
            .plus(this.feeInfo.fixedFee?.amount || 0)
            .toFixed();

        return {
            contractAddress: transactionData.to,
            contractAbi: evmCommonCrossChainAbi,
            methodName: this.methodName,
            methodArguments,
            value
        };
    }

    getTradeAmountRatio(fromUsd: BigNumber): BigNumber {
        return fromUsd.dividedBy(this.to.tokenAmount);
    }
}
