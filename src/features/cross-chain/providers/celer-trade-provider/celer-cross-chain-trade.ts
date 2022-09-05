import { Web3Pure } from '@rsdk-core/blockchain/web3-pure/web3-pure';
import { Injector } from '@rsdk-core/sdk/injector';
import { GasData } from '@rsdk-features/cross-chain/models/gas-data';
import { CrossChainIsUnavailableError } from '@rsdk-common/errors/cross-chain/cross-chain-is-unavailable.error';
import { FailedToCheckForTransactionReceiptError } from '@rsdk-common/errors/swap/failed-to-check-for-transaction-receipt.error';
import { InsufficientFundsGasPriceValueError } from '@rsdk-common/errors/cross-chain/insufficient-funds-gas-price-value.error';
import { SwapTransactionOptions } from '@rsdk-features/instant-trades/models/swap-transaction-options';
import BigNumber from 'bignumber.js';
import { EMPTY_ADDRESS } from '@rsdk-core/blockchain/constants/empty-address';
import { CelerRubicCrossChainTrade } from '@rsdk-features/cross-chain/providers/common/celer-rubic/celer-rubic-cross-chain-trade';
import { Web3Public } from 'src/core';
import { CrossChainContractTrade } from '@rsdk-features/cross-chain/providers/common/celer-rubic/cross-chain-contract-trade';
import { ContractParams } from '@rsdk-features/cross-chain/models/contract-params';
import { CelerCrossChainContractData } from '@rsdk-features/cross-chain/providers/celer-trade-provider/celer-cross-chain-contract-data';
import {
    celerSourceTransitTokenFeeMultiplier,
    celerTargetTransitTokenFeeMultiplier
} from '@rsdk-features/cross-chain/providers/celer-trade-provider/constants/celer-cross-chain-fee-multipliers';
import { CelerCrossChainContractTrade } from '@rsdk-features/cross-chain/providers/celer-trade-provider/celer-cross-chain-contract-trade/celer-cross-chain-contract-trade';
import { CelerItCrossChainContractTrade } from '@rsdk-features/cross-chain/providers/celer-trade-provider/celer-cross-chain-contract-trade/celer-it-cross-chain-contract-trade/celer-it-cross-chain-contract-trade';
import { CROSS_CHAIN_TRADE_TYPE, CrossChainTrade, TradeType } from 'src/features';
import { FeeInfo } from 'src/features/cross-chain/providers/common/models/fee';
import { CelerDirectCrossChainContractTrade } from 'src/features/cross-chain/providers/celer-trade-provider/celer-cross-chain-contract-trade/celer-direct-cross-chain-trade/celer-direct-cross-chain-contract-trade';
import { PriceTokenAmount } from 'src/common';

/**
 * Calculated Celer cross chain trade.
 */
export class CelerCrossChainTrade extends CelerRubicCrossChainTrade {
    public readonly type = CROSS_CHAIN_TRADE_TYPE.CELER;

    public readonly itType: { from: TradeType | undefined; to: TradeType | undefined };

    public readonly feeInPercents: number;

    public readonly feeInfo: FeeInfo;

    /** @internal */
    public static async getGasData(
        fromTrade: CrossChainContractTrade,
        toTrade: CrossChainContractTrade,
        cryptoFeeToken: PriceTokenAmount,
        maxSlippage: number
    ): Promise<GasData | null> {
        const fromBlockchain = fromTrade.blockchain;
        const walletAddress = Injector.web3Private.address;
        if (!walletAddress) {
            return null;
        }

        try {
            const { contractAddress, contractAbi, methodName, methodArguments, value } =
                await new CelerCrossChainTrade(
                    {
                        fromTrade,
                        toTrade,
                        cryptoFeeToken,
                        transitFeeToken: {} as PriceTokenAmount,
                        gasData: null,
                        feeInPercents: 0,
                        feeInfo: {
                            fixedFee: { amount: new BigNumber(0), tokenSymbol: '' },
                            platformFee: { percent: 0, tokenSymbol: '' },
                            cryptoFee: null
                        }
                    },
                    EMPTY_ADDRESS,
                    maxSlippage
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
                new BigNumber(await Injector.gasPriceApi.getGasPrice(fromTrade.blockchain))
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

    public readonly transitFeeToken: PriceTokenAmount;

    public readonly from: PriceTokenAmount;

    public readonly to: PriceTokenAmount;

    public readonly toTokenAmountMin: BigNumber;

    public readonly fromTrade: CrossChainContractTrade;

    public readonly toTrade: CrossChainContractTrade;

    public readonly gasData: GasData | null;

    public readonly cryptoFeeToken: PriceTokenAmount;

    protected readonly fromWeb3Public: Web3Public;

    protected readonly toWeb3Public: Web3Public;

    constructor(
        crossChainTrade: {
            fromTrade: CrossChainContractTrade;
            toTrade: CrossChainContractTrade;
            cryptoFeeToken: PriceTokenAmount;
            transitFeeToken: PriceTokenAmount;
            gasData: GasData | null;
            feeInPercents: number;
            feeInfo: FeeInfo;
        },
        providerAddress: string,
        private readonly maxSlippage: number
    ) {
        super(providerAddress);

        this.feeInPercents = crossChainTrade.feeInPercents;
        this.fromTrade = crossChainTrade.fromTrade;
        this.toTrade = crossChainTrade.toTrade;
        this.gasData = crossChainTrade.gasData;
        this.cryptoFeeToken = crossChainTrade.cryptoFeeToken;
        this.feeInfo = crossChainTrade.feeInfo;

        this.fromWeb3Public = Injector.web3PublicService.getWeb3Public(this.fromTrade.blockchain);
        this.toWeb3Public = Injector.web3PublicService.getWeb3Public(this.toTrade.blockchain);

        this.transitFeeToken = crossChainTrade.transitFeeToken;

        this.from = this.fromTrade.fromToken;

        const fromSlippage =
            this.fromTrade instanceof CelerItCrossChainContractTrade ? this.fromTrade.slippage : 0;
        this.to = new PriceTokenAmount({
            ...this.toTrade.toToken.asStruct,
            weiAmount: this.toTrade.toToken.weiAmount.dividedBy(1 - fromSlippage).dp(0)
        });

        this.itType = {
            from:
                crossChainTrade.fromTrade instanceof CelerDirectCrossChainContractTrade
                    ? undefined
                    : crossChainTrade.fromTrade.provider.type,
            to:
                crossChainTrade.toTrade instanceof CelerDirectCrossChainContractTrade
                    ? undefined
                    : crossChainTrade.toTrade.provider.type
        };

        this.toTokenAmountMin = this.toTrade.toTokenAmountMin;
    }

    protected async checkTradeErrors(): Promise<void | never> {
        this.checkWalletConnected();
        this.checkBlockchainCorrect();

        await Promise.all([
            this.checkContractsState(),
            this.checkToBlockchainGasPrice(),
            this.checkUserBalance()
        ]);
    }

    public async swap(options: SwapTransactionOptions = {}): Promise<string | never> {
        await this.checkTradeErrors();
        await this.checkAllowanceAndApprove(options);
        CrossChainTrade.checkReceiverAddress(options?.receiverAddress);

        const { onConfirm, gasLimit, gasPrice } = options;

        const { contractAddress, contractAbi, methodName, methodArguments, value } =
            await this.getContractParams({
                receiverAddress: options?.receiverAddress || this.walletAddress
            });

        let transactionHash: string;
        try {
            const onTransactionHash = (hash: string) => {
                if (onConfirm) {
                    onConfirm(hash);
                }
                transactionHash = hash;
            };

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
            return this.parseSwapErrors(err);
        }
    }

    private parseSwapErrors(err: Error): never {
        const errMessage = err?.message || err?.toString?.();
        if (errMessage?.includes('swapContract: Not enough amount of tokens')) {
            throw new CrossChainIsUnavailableError();
        }
        if (errMessage?.includes('err: insufficient funds for gas * price + value')) {
            throw new InsufficientFundsGasPriceValueError();
        }
        throw err;
    }

    public async getContractParams(
        options: {
            fromAddress?: string;
            receiverAddress?: string;
        } = {}
    ): Promise<ContractParams> {
        const fromTrade = this.fromTrade as CelerCrossChainContractTrade;
        const toTrade = this.toTrade as CelerCrossChainContractTrade;

        const contractAddress = fromTrade.contract.address;

        const { methodName, contractAbi } = fromTrade.getMethodNameAndContractAbi();

        const methodArguments = await fromTrade.getMethodArguments(
            toTrade,
            options?.fromAddress || this.walletAddress,
            this.providerAddress,
            {
                maxSlippage: this.maxSlippage,
                receiverAddress: options?.receiverAddress || this.walletAddress
            }
        );

        const tokenInAmountAbsolute = fromTrade.fromToken.weiAmount;
        const msgValue = await this.calculateSwapValue(tokenInAmountAbsolute, methodArguments);
        const value = new BigNumber(msgValue).toFixed(0);
        return {
            contractAddress,
            contractAbi,
            methodName,
            methodArguments,
            value
        };
    }

    private async calculateSwapValue(amountIn: BigNumber, data: unknown[]): Promise<number> {
        const contract = this.fromTrade.contract as CelerCrossChainContractData;
        const { isNative } = this.fromTrade.fromToken;
        const isBridge = this.fromTrade.fromToken.isEqualTo(this.fromTrade.toToken);
        const isToTransit = this.toTrade.fromToken.isEqualTo(this.toTrade.toToken);

        const message = Web3Pure.asciiToBytes32(JSON.stringify(data));
        const messageBusAddress = await contract.messageBusAddress();
        const cryptoFee = await contract.destinationCryptoFee(this.toTrade.blockchain);
        const feePerByte = await contract.celerFeePerByte(message, messageBusAddress);
        const feeBase = await contract.celerFeeBase(messageBusAddress);

        const fixedFee = Web3Pure.toWei(this.feeInfo.fixedFee?.amount || 0);

        if (isNative) {
            return amountIn
                .plus(feePerByte)
                .plus(cryptoFee)
                .plus(feeBase)
                .plus(fixedFee)
                .toNumber();
        }

        if (isBridge) {
            const adjustedFeeBase = Number(feeBase) * celerSourceTransitTokenFeeMultiplier;
            return Number(feePerByte) + Number(cryptoFee) + Number(fixedFee) + adjustedFeeBase;
        }

        if (isToTransit) {
            const adjustedFeeBase = Number(feePerByte) * celerTargetTransitTokenFeeMultiplier;
            return Number(feeBase) + Number(cryptoFee) + Number(fixedFee) + adjustedFeeBase;
        }

        return Number(feePerByte) + Number(cryptoFee) + Number(feeBase) + Number(fixedFee);
    }
}
