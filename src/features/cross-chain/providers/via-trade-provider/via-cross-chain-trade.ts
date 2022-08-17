import { BlockchainsInfo, PriceTokenAmount, Web3Public, Web3Pure } from 'src/core';
import { IRoute } from '@viaprotocol/router-sdk/dist/types';
import { Via } from '@viaprotocol/router-sdk';
import { FailedToCheckForTransactionReceiptError } from 'src/common';
import { DEFAULT_API_KEY } from 'src/features/cross-chain/providers/via-trade-provider/constants/default-api-key';
import { GasData } from 'src/features/cross-chain/models/gas-data';
import { Injector } from 'src/core/sdk/injector';
import {
    BridgeType,
    CROSS_CHAIN_TRADE_TYPE,
    CrossChainTrade,
    SwapTransactionOptions
} from 'src/features';
import BigNumber from 'bignumber.js';
import { FeeInfo } from 'src/features/cross-chain/providers/common/models/fee';
import { ContractParams } from 'src/features/cross-chain/models/contract-params';
import { ItType } from 'src/features/cross-chain/models/it-type';
import { viaContractAddress } from 'src/features/cross-chain/providers/via-trade-provider/constants/contract-data';
import { commonCrossChainAbi } from 'src/features/cross-chain/providers/common/constants/common-cross-chain-abi';

export class ViaCrossChainTrade extends CrossChainTrade {
    public readonly type = CROSS_CHAIN_TRADE_TYPE.VIA;

    private readonly via = new Via({
        apiKey: DEFAULT_API_KEY,
        url: 'https://router-api.via.exchange',
        timeout: 25_000
    });

    public readonly from: PriceTokenAmount;

    public readonly to: PriceTokenAmount;

    private readonly route: IRoute;

    public readonly priceImpact: number;

    public readonly toTokenAmountMin: BigNumber;

    public readonly gasData: GasData;

    public readonly feeInfo: FeeInfo;

    public readonly cryptoFeeToken: PriceTokenAmount;

    public readonly itType: ItType;

    public readonly bridgeType: BridgeType;

    protected readonly fromWeb3Public: Web3Public;

    protected get fromContractAddress(): string {
        return viaContractAddress;
    }

    constructor(
        crossChainTrade: {
            from: PriceTokenAmount;
            to: PriceTokenAmount;
            route: IRoute;
            gasData: GasData;
            priceImpact: number;
            toTokenAmountMin: BigNumber;
            feeInfo: FeeInfo;
            cryptoFeeToken: PriceTokenAmount;
            itType: ItType;
            bridgeType: BridgeType;
        },
        providerAddress: string
    ) {
        super(providerAddress);

        this.from = crossChainTrade.from;
        this.to = crossChainTrade.to;
        this.route = crossChainTrade.route;
        this.gasData = crossChainTrade.gasData;
        this.priceImpact = crossChainTrade.priceImpact;
        this.toTokenAmountMin = crossChainTrade.toTokenAmountMin;
        this.feeInfo = crossChainTrade.feeInfo;
        this.cryptoFeeToken = crossChainTrade.cryptoFeeToken;
        this.itType = crossChainTrade.itType;
        this.bridgeType = crossChainTrade.bridgeType;

        this.fromWeb3Public = Injector.web3PublicService.getWeb3Public(this.from.blockchain);
    }

    protected async checkTradeErrors(): Promise<void | never> {
        this.checkWalletConnected();
        this.checkBlockchainCorrect();

        await this.checkUserBalance();
    }

    public async swap(options: SwapTransactionOptions = {}): Promise<string | never> {
        await this.checkTradeErrors();
        await this.checkAllowanceAndApprove(options);
        CrossChainTrade.checkReceiverAddress(options?.receiverAddress);

        const { onConfirm, gasLimit, gasPrice } = options;

        const { contractAddress, contractAbi, methodName, methodArguments, value } =
            await this.getContractParams(options);

        let transactionHash: string;
        const onTransactionHash = (hash: string) => {
            if (onConfirm) {
                onConfirm(hash);
            }
            transactionHash = hash;
        };

        try {
            await Injector.web3Private.tryExecuteContractMethod(
                contractAddress,
                contractAbi,
                methodName,
                methodArguments,
                {
                    gas: gasLimit,
                    gasPrice,
                    value,
                    onTransactionHash
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

    public async getContractParams(options: SwapTransactionOptions): Promise<ContractParams> {
        const swapTransaction = await this.via.buildTx({
            routeId: this.route.routeId,
            fromAddress: viaContractAddress,
            receiveAddress: options?.receiverAddress || this.walletAddress,
            numAction: 0
        });
        const toChainId = BlockchainsInfo.getBlockchainByName(this.to.blockchain).id;
        const swapArguments = [
            this.from.address,
            this.from.stringWeiAmount,
            toChainId,
            this.to.address,
            Web3Pure.toWei(this.toTokenAmountMin, this.to.decimals),
            options?.receiverAddress || this.walletAddress,
            this.providerAddress,
            swapTransaction.to
        ];

        const methodArguments: unknown[] = [swapArguments];
        if (!this.from.isNative) {
            const approveTransaction = await this.via.buildApprovalTx({
                owner: viaContractAddress,
                routeId: this.route.routeId,
                numAction: 0
            });
            methodArguments.push(approveTransaction.to);
        }
        methodArguments.push(swapTransaction.data);

        const sourceValue = this.from.isNative ? this.from.stringWeiAmount : '0';
        const fixedFee = Web3Pure.toWei(this.feeInfo?.fixedFee?.amount || 0);
        const value = new BigNumber(sourceValue).plus(fixedFee).toFixed(0);

        return {
            contractAddress: this.fromContractAddress,
            contractAbi: commonCrossChainAbi,
            methodName: this.methodName,
            methodArguments,
            value
        };
    }

    public getTradeAmountRatio(): BigNumber {
        const fromCost = this.from.price.multipliedBy(this.from.tokenAmount);
        const usdCryptoFee = this.cryptoFeeToken.price.multipliedBy(
            this.cryptoFeeToken.tokenAmount
        );
        return fromCost.plus(usdCryptoFee).dividedBy(this.to.tokenAmount);
    }
}
