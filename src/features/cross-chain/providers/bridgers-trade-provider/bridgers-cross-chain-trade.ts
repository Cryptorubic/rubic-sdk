import { CROSS_CHAIN_TRADE_TYPE } from 'src/features/cross-chain/models/cross-chain-trade-type';
import { TronCrossChainTrade } from 'src/features/cross-chain/providers/common/tron-cross-chain-trade/tron-cross-chain-trade';
import { ContractParams } from 'src/features/cross-chain/providers/common/models/contract-params';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { TronWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/tron-web3-pure/tron-web3-pure';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import { TronBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { FeeInfo } from 'src/features/cross-chain/providers/common/models/fee';
import { PriceTokenAmount } from 'src/common/tokens';
import { rubicProxyContractAddress } from 'src/features/cross-chain/providers/common/constants/rubic-proxy-contract-address';
import BigNumber from 'bignumber.js';
import { BridgersSwapResponse } from 'src/features/cross-chain/providers/bridgers-trade-provider/models/bridgers-swap-response';
import { BridgersSwapRequest } from 'src/features/cross-chain/providers/bridgers-trade-provider/models/bridgers-swap-request';
import { tronCommonCrossChainAbi } from 'src/features/cross-chain/providers/common/tron-cross-chain-trade/constants/tron-common-cross-chain-abi';
import { toBridgersBlockchain } from 'src/features/cross-chain/providers/bridgers-trade-provider/constants/to-bridgers-blockchain';
import { BridgersCrossChainSupportedBlockchain } from 'src/features/cross-chain/providers/bridgers-trade-provider/constants/bridgers-cross-chain-supported-blockchain';
import { TronGetContractParamsOptions } from 'src/features/cross-chain/providers/common/tron-cross-chain-trade/models/tron-get-contract-params-options';

export class BridgersCrossChainTrade extends TronCrossChainTrade {
    public readonly type = CROSS_CHAIN_TRADE_TYPE.BRIDGERS;

    public readonly from: PriceTokenAmount<TronBlockchainName>;

    public readonly to: PriceTokenAmount<BridgersCrossChainSupportedBlockchain>;

    public readonly toTokenAmountMin: BigNumber;

    public readonly feeInfo: FeeInfo;

    public readonly feeLimit: number;

    protected get fromContractAddress(): string {
        return rubicProxyContractAddress[this.from.blockchain];
    }

    constructor(
        crossChainTrade: {
            from: PriceTokenAmount<TronBlockchainName>;
            to: PriceTokenAmount<BridgersCrossChainSupportedBlockchain>;
            toTokenAmountMin: BigNumber;
            feeInfo: FeeInfo;
            feeLimit: number;
        },
        providerAddress: string
    ) {
        super(providerAddress);

        this.from = crossChainTrade.from;
        this.to = crossChainTrade.to;
        this.toTokenAmountMin = crossChainTrade.toTokenAmountMin;
        this.feeInfo = crossChainTrade.feeInfo;
        this.feeLimit = crossChainTrade.feeLimit;
    }

    protected async getContractParams(
        options: TronGetContractParamsOptions
    ): Promise<ContractParams> {
        const amountOutMin = Web3Pure.toWei(this.toTokenAmountMin, this.to.decimals);
        const swapRequest: BridgersSwapRequest = {
            fromTokenAddress: this.from.address,
            toTokenAddress: this.to.address,
            fromAddress: options.fromAddress || this.walletAddress,
            toAddress: options.receiverAddress,
            fromTokenChain: 'TRON',
            toTokenChain: toBridgersBlockchain[this.to.blockchain],
            fromTokenAmount: this.from.stringWeiAmount,
            amountOutMin,
            equipmentNo: this.walletAddress.slice(0, 32),
            sourceFlag: 'widget'
        };

        const swapData = await this.httpClient.post<BridgersSwapResponse>(
            'https://sswap.swft.pro/api/sswap/swap',
            swapRequest
        );
        const transactionData = swapData.txData;

        const methodArguments: unknown[] = [
            [
                this.from.address,
                this.from.weiAmount,
                blockchainId[this.to.blockchain],
                this.to.address,
                amountOutMin,
                options.receiverAddress,
                TronWeb3Pure.nativeTokenAddress,
                transactionData.to
            ]
        ];
        if (!this.from.isNative) {
            methodArguments.push(transactionData.to);
        }

        const encodedData = TronWeb3Pure.encodeMethodSignature(
            transactionData.functionName,
            transactionData.parameter
        );
        methodArguments.push(encodedData);

        const value = transactionData.options.callValue;

        return {
            contractAddress: transactionData.tronRouterAddress,
            contractAbi: tronCommonCrossChainAbi,
            methodName: this.methodName,
            methodArguments,
            value
        };
    }

    getTradeAmountRatio(fromUsd: BigNumber): BigNumber {
        return fromUsd.dividedBy(this.to.tokenAmount);
    }
}
