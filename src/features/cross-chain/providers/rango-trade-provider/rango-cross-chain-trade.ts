import BigNumber from 'bignumber.js';
import { BlockchainsInfo, PriceTokenAmount, Web3Public, Web3Pure } from 'src/core';
import { SwapTransactionOptions, TradeType } from 'src/features';
import { ContractParams } from '@rsdk-features/cross-chain/models/contract-params';
import { FeeInfo } from 'src/features/cross-chain/providers/common/models/fee';
import { GasData } from '@rsdk-features/cross-chain/models/gas-data';
import { Injector } from 'src/core/sdk/injector';
import { EvmTransaction, RangoClient } from 'rango-sdk-basic/lib';
import { CrossChainIsUnavailableError, FailedToCheckForTransactionReceiptError } from 'src/common';
import { nativeTokensList } from 'src/core/blockchain/constants/native-tokens';
import { CrossChainTrade } from '../common/cross-chain-trade';
import { CROSS_CHAIN_TRADE_TYPE } from '../../models/cross-chain-trade-type';
import { RANGO_CONTRACT_ADDRESSES } from './constants/contract-address';
import { RangoCrossChainSupportedBlockchain } from './constants/rango-cross-chain-supported-blockchain';
import { commonCrossChainAbi } from '../common/constants/common-cross-chain-abi';
import { RangoTradeSubtype } from './models/rango-providers';

export class RangoCrossChainTrade extends CrossChainTrade {
    public readonly feeInfo: FeeInfo;

    public readonly fromWeb3Public: Web3Public;

    public readonly type = CROSS_CHAIN_TRADE_TYPE.RANGO;

    public readonly from: PriceTokenAmount;

    public readonly to: PriceTokenAmount;

    public readonly slippageTolerance: number;

    public readonly gasData: GasData | null;

    public readonly priceImpact: number;

    public readonly toTokenAmountMin: BigNumber;

    public readonly itType: { from: TradeType | undefined; to: TradeType | undefined };

    public readonly rangoClientRef: RangoClient;

    public readonly subType: RangoTradeSubtype;

    public requestId: string | undefined;

    public get fromBlockchain(): RangoCrossChainSupportedBlockchain {
        return this.from.blockchain as RangoCrossChainSupportedBlockchain;
    }

    protected get fromContractAddress(): string {
        return RANGO_CONTRACT_ADDRESSES[this.fromBlockchain].rubicRouter;
    }

    constructor(
        crossChainTrade: {
            from: PriceTokenAmount;
            to: PriceTokenAmount;
            gasData: GasData | null;
            toTokenAmountMin: BigNumber;
            slippageTolerance: number;
            feeInfo: FeeInfo;
            itType: { from: TradeType | undefined; to: TradeType | undefined };
            subType: RangoTradeSubtype;
            priceImpact: number;
        },
        rangoClientRef: RangoClient,
        providerAddress: string
    ) {
        super(providerAddress);
        this.from = crossChainTrade.from;
        this.to = crossChainTrade.to;
        this.toTokenAmountMin = crossChainTrade.toTokenAmountMin;
        this.feeInfo = crossChainTrade.feeInfo;
        this.gasData = crossChainTrade.gasData;
        this.slippageTolerance = crossChainTrade.slippageTolerance;
        this.subType = crossChainTrade.subType;
        this.itType = crossChainTrade.itType;
        this.priceImpact = crossChainTrade.priceImpact;

        this.fromWeb3Public = Injector.web3PublicService.getWeb3Public(this.from.blockchain);
        this.rangoClientRef = rangoClientRef;
    }

    public async swap(options: SwapTransactionOptions = {}): Promise<string> {
        await this.checkTradeErrors();
        await this.checkAllowanceAndApprove(options);
        const { onConfirm } = options;
        const { contractAddress, contractAbi, methodName, methodArguments, value } =
            await this.getContractParams();

        let transactionHash: string;
        const onTransactionHash = (hash: string) => {
            if (onConfirm) {
                onConfirm(hash);
            }
            transactionHash = hash;
        };

        console.log({ methodName, methodArguments, value });

        try {
            await Injector.web3Private.tryExecuteContractMethod(
                contractAddress,
                contractAbi,
                methodName,
                methodArguments,
                {
                    value,
                    onTransactionHash
                    // gas: this.gasData?.gasLimit?.toFixed(0),
                    // gdwasPrice: this.gasData?.gasPrice?.toFixed(0)
                }
            );

            return transactionHash!;
        } catch (err) {
            if (err instanceof FailedToCheckForTransactionReceiptError) {
                return transactionHash!;
            }
            throw err;
        }
    }

    public async getContractParams(): Promise<ContractParams> {
        const fromContracts =
            RANGO_CONTRACT_ADDRESSES[this.from.blockchain as RangoCrossChainSupportedBlockchain];

        const { txData, value } = await this.refetchTxData();

        const routerCallParams = [
            this.from.address,
            this.from.stringWeiAmount,
            BlockchainsInfo.getBlockchainByName(this.to.blockchain).id,
            this.to.address,
            Web3Pure.toWei(this.toTokenAmountMin, this.to.decimals),
            this.walletAddress,
            this.providerAddress,
            fromContracts.providerRouter
        ];

        const methodArguments: unknown[] = [routerCallParams];

        if (!this.from.isNative) {
            methodArguments.push(fromContracts.providerGateway);
        }
        methodArguments.push(txData);

        const fixedCryptoFee = Web3Pure.toWei(
            this.feeInfo.fixedFee.amount,
            nativeTokensList[this.fromBlockchain].decimals
        );
        const totalMsgValue = new BigNumber(parseInt(value || '0'))
            .plus(fixedCryptoFee)
            .toFixed(0, 0);

        console.log('message value', {
            fixedCryptoFeeInWei: fixedCryptoFee,
            value: parseInt(value || '0'),
            sum: totalMsgValue
        });

        return {
            contractAddress: fromContracts.rubicRouter,
            contractAbi: commonCrossChainAbi,
            methodName: this.methodName,
            methodArguments,
            value: totalMsgValue
        };
    }

    protected async checkTradeErrors(): Promise<void> {
        this.checkWalletConnected();
        this.checkBlockchainCorrect();
        await this.checkUserBalance();
    }

    public getTradeAmountRatio(): BigNumber {
        return new BigNumber(1);
    }

    public async refetchTxData(): Promise<EvmTransaction> {
        try {
            const response = await this.rangoClientRef.swap({
                from: {
                    blockchain: this.from.blockchain,
                    symbol: this.from.symbol,
                    address: this.from.isNative ? null : this.from.address
                },
                to: {
                    blockchain: this.to.blockchain,
                    symbol: this.to.symbol,
                    address: this.to.isNative ? null : this.to.address
                },
                amount: this.from.weiAmount.toFixed(0),
                disableEstimate: false,
                slippage: String(this.slippageTolerance * 100),
                fromAddress: this.walletAddress,
                toAddress: this.walletAddress,
                referrerAddress: null,
                referrerFee: null
            });
            this.requestId = response.requestId;

            return response.tx as EvmTransaction;
        } catch (error: unknown) {
            console.log('Rango refetch tx data error:', error);
            throw new CrossChainIsUnavailableError();
        }
    }
}
