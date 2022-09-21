import { CROSS_CHAIN_TRADE_TYPE } from 'src/features/cross-chain/models/cross-chain-trade-type';
import { TronCrossChainTrade } from 'src/features/cross-chain/providers/common/tron-cross-chain-trade/tron-cross-chain-trade';
import { TronWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/tron-web3-pure/tron-web3-pure';
import { TronBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { FeeInfo } from 'src/features/cross-chain/providers/common/models/fee';
import { PriceTokenAmount } from 'src/common/tokens';
import { rubicProxyContractAddress } from 'src/features/cross-chain/providers/common/constants/rubic-proxy-contract-address';
import BigNumber from 'bignumber.js';
import { tronCommonCrossChainAbi } from 'src/features/cross-chain/providers/common/tron-cross-chain-trade/constants/tron-common-cross-chain-abi';
import { BridgersEvmCrossChainSupportedBlockchain } from 'src/features/cross-chain/providers/bridgers-trade-provider/constants/bridgers-cross-chain-supported-blockchain';
import { TronGetContractParamsOptions } from 'src/features/cross-chain/providers/common/tron-cross-chain-trade/models/tron-get-contract-params-options';
import { TronContractParams } from 'src/features/cross-chain/providers/common/tron-cross-chain-trade/models/tron-contract-params';
import { getMethodArgumentsAndTransactionData } from 'src/features/cross-chain/providers/bridgers-trade-provider/utils/get-method-arguments-and-transaction-data';

import { TronBridgersTransactionData } from 'src/features/cross-chain/providers/bridgers-trade-provider/tron-bridgers-trade/models/tron-bridgers-transaction-data';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';

export class TronBridgersCrossChainTrade extends TronCrossChainTrade {
    public readonly type = CROSS_CHAIN_TRADE_TYPE.BRIDGERS;

    public readonly from: PriceTokenAmount<TronBlockchainName>;

    public readonly to: PriceTokenAmount<BridgersEvmCrossChainSupportedBlockchain>;

    public readonly toTokenAmountMin: BigNumber;

    public readonly feeInfo: FeeInfo;

    public readonly itType = { from: undefined, to: undefined };

    protected get fromContractAddress(): string {
        return rubicProxyContractAddress[this.from.blockchain];
    }

    constructor(
        crossChainTrade: {
            from: PriceTokenAmount<TronBlockchainName>;
            to: PriceTokenAmount<BridgersEvmCrossChainSupportedBlockchain>;
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
        options: TronGetContractParamsOptions
    ): Promise<TronContractParams> {
        const { methodArguments, transactionData } =
            await getMethodArgumentsAndTransactionData<TronBridgersTransactionData>(
                this.from,
                this.to,
                this.toTokenAmountMin,
                this.walletAddress,
                options
            );

        const encodedData = TronWeb3Pure.encodeMethodSignature(
            transactionData.functionName,
            transactionData.parameter
        );
        methodArguments.push(encodedData);

        const fixedFee = Web3Pure.toWei(this.feeInfo?.fixedFee?.amount || 0);
        const value = new BigNumber(transactionData.options.callValue).plus(fixedFee).toFixed();
        const { feeLimit } = transactionData.options;

        return {
            contractAddress: this.fromContractAddress,
            contractAbi: tronCommonCrossChainAbi,
            methodName: this.methodName,
            methodArguments,
            value,
            feeLimit
        };
    }

    getTradeAmountRatio(fromUsd: BigNumber): BigNumber {
        return fromUsd.dividedBy(this.to.tokenAmount);
    }
}
