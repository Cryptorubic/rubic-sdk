import {
    CROSS_CHAIN_TRADE_TYPE,
    SwapTransactionOptions,
    TRADE_TYPE,
    TradeType
} from 'src/features';
import { CrossChainTrade } from '@rsdk-features/cross-chain/providers/common/cross-chain-trade';
import { BlockchainsInfo, PriceTokenAmount, Web3Public, Web3Pure } from 'src/core';
import { Injector } from '@rsdk-core/sdk/injector';
import { SYMBIOSIS_CONTRACT_ADDRESS } from '@rsdk-features/cross-chain/providers/symbiosis-trade-provider/constants/contract-address';
import { SymbiosisCrossChainSupportedBlockchain } from '@rsdk-features/cross-chain/providers/symbiosis-trade-provider/constants/symbiosis-cross-chain-supported-blockchain';
import { ContractParams } from '@rsdk-features/cross-chain/models/contract-params';
import { FailedToCheckForTransactionReceiptError } from 'src/common';
import { GasData } from '@rsdk-features/cross-chain/models/gas-data';
import { EMPTY_ADDRESS } from '@rsdk-core/blockchain/constants/empty-address';
import BigNumber from 'bignumber.js';
import { FeeInfo } from 'src/features/cross-chain/providers/common/models/fee';
import { commonCrossChainAbi } from 'src/features/cross-chain/providers/common/constants/common-cross-chain-abi';
import { SwapExactIn } from 'symbiosis-js-sdk/dist/crosschain/baseSwapping';

/**
 * Calculated Symbiosis cross chain trade.
 */
export class SymbiosisCrossChainTrade extends CrossChainTrade {
    /** @internal */
    public readonly transitAmount: BigNumber;

    public readonly feeInfo: FeeInfo;

    /** @internal */
    public static async getGasData(
        from: PriceTokenAmount,
        to: PriceTokenAmount
    ): Promise<GasData | null> {
        const fromBlockchain = from.blockchain as SymbiosisCrossChainSupportedBlockchain;
        const walletAddress = Injector.web3Private.address;
        if (!walletAddress) {
            return null;
        }

        try {
            const { contractAddress, contractAbi, methodName, methodArguments, value } =
                await new SymbiosisCrossChainTrade(
                    {
                        from,
                        to,
                        swapFunction: () => new Promise(resolve => resolve),
                        gasData: null,
                        priceImpact: 0,
                        slippage: 0,
                        feeInfo: {
                            fixedFee: { amount: new BigNumber(0), tokenSymbol: '' },
                            platformFee: { percent: 0, tokenSymbol: '' },
                            cryptoFee: null
                        },
                        transitAmount: new BigNumber(NaN)
                    },
                    EMPTY_ADDRESS
                ).getContractParams({});

            const web3Public = Injector.web3PublicService.getWeb3Public(fromBlockchain);
            const [gasLimit, gasPrice] = await Promise.all([
                web3Public.getEstimatedGas(
                    contractAbi,
                    contractAddress,
                    methodName,
                    methodArguments,
                    walletAddress,
                    value
                ),
                new BigNumber(await Injector.gasPriceApi.getGasPrice(from.blockchain))
            ]);

            if (!gasLimit?.isFinite()) {
                return null;
            }

            const increasedGasLimit = Web3Pure.calculateGasMargin(gasLimit, 1.2);
            return {
                gasLimit: increasedGasLimit,
                gasPrice
            };
        } catch (_err) {
            return null;
        }
    }

    public readonly type = CROSS_CHAIN_TRADE_TYPE.SYMBIOSIS;

    public readonly itType: { from: TradeType; to: TradeType };

    public readonly from: PriceTokenAmount;

    public readonly to: PriceTokenAmount;

    public readonly toTokenAmountMin: BigNumber;

    /**
     * Overall price impact, fetched from symbiosis api.
     */
    public readonly priceImpact: number;

    public readonly gasData: GasData | null;

    private readonly getSwapExactIn: (receiver?: string) => SwapExactIn;

    protected readonly fromWeb3Public: Web3Public;

    private get fromBlockchain(): SymbiosisCrossChainSupportedBlockchain {
        return this.from.blockchain as SymbiosisCrossChainSupportedBlockchain;
    }

    protected get fromContractAddress(): string {
        return SYMBIOSIS_CONTRACT_ADDRESS[this.fromBlockchain].rubicRouter;
    }

    constructor(
        crossChainTrade: {
            from: PriceTokenAmount;
            to: PriceTokenAmount;
            swapFunction: (receiver?: string) => SwapExactIn;
            gasData: GasData | null;
            priceImpact: number;
            slippage: number;
            feeInfo: FeeInfo;
            transitAmount: BigNumber;
        },
        providerAddress: string
    ) {
        super(providerAddress);

        this.from = crossChainTrade.from;
        this.to = crossChainTrade.to;
        this.getSwapExactIn = crossChainTrade.swapFunction;
        this.gasData = crossChainTrade.gasData;
        this.priceImpact = crossChainTrade.priceImpact;
        this.toTokenAmountMin = this.to.tokenAmount.multipliedBy(1 - crossChainTrade.slippage);
        this.feeInfo = crossChainTrade.feeInfo;
        this.priceImpact = crossChainTrade.priceImpact;

        this.transitAmount = crossChainTrade.transitAmount;

        this.itType = {
            from: TRADE_TYPE.ONE_INCH,
            to: TRADE_TYPE.ONE_INCH
        };

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
                { value, onTransactionHash, gas: gasLimit, gasPrice }
            );

            return transactionHash!;
        } catch (err) {
            if (err instanceof FailedToCheckForTransactionReceiptError) {
                return transactionHash!;
            }
            throw err;
        }
    }

    protected async getContractParams(options: SwapTransactionOptions): Promise<ContractParams> {
        const exactIn = await this.getSwapExactIn(options?.receiverAddress);
        const { data } = exactIn.transactionRequest;
        const toChainId = BlockchainsInfo.getBlockchainByName(this.to.blockchain).id;
        const swapArguments = [
            this.from.address,
            this.from.stringWeiAmount,
            toChainId,
            this.to.address,
            Web3Pure.toWei(this.toTokenAmountMin, this.to.decimals),
            options?.receiverAddress || this.walletAddress,
            this.providerAddress,
            SYMBIOSIS_CONTRACT_ADDRESS[this.fromBlockchain].providerRouter
        ];

        const methodArguments: unknown[] = [swapArguments];
        if (!this.from.isNative) {
            methodArguments.push(SYMBIOSIS_CONTRACT_ADDRESS[this.fromBlockchain].providerGateway);
        }
        methodArguments.push(data);

        const sourceValue = this.from.isNative ? this.from.stringWeiAmount : '0';
        const fixedFee = Web3Pure.toWei(this.feeInfo?.fixedFee?.amount || 0);
        const value = new BigNumber(sourceValue).plus(fixedFee).toFixed(0);

        return {
            contractAddress: SYMBIOSIS_CONTRACT_ADDRESS[this.fromBlockchain].rubicRouter,
            contractAbi: commonCrossChainAbi,
            methodName: this.methodName,
            methodArguments,
            value
        };
    }

    public getTradeAmountRatio(): BigNumber {
        return this.transitAmount.dividedBy(this.to.tokenAmount);
    }
}
