import { Web3Pure } from '@rsdk-core/blockchain/web3-pure/web3-pure';
import { Injector } from '@rsdk-core/sdk/injector';
import { PriceTokenAmount } from '@rsdk-core/blockchain/tokens/price-token-amount';
import { GasData } from '@rsdk-features/cross-chain/models/gas-data';
import { CrossChainIsUnavailableError } from '@rsdk-common/errors/cross-chain/cross-chain-is-unavailable.error';
import { FailedToCheckForTransactionReceiptError } from '@rsdk-common/errors/swap/failed-to-check-for-transaction-receipt.error';
import { InsufficientFundsGasPriceValueError } from '@rsdk-common/errors/cross-chain/insufficient-funds-gas-price-value.error';
import { SwapTransactionOptions } from '@rsdk-features/instant-trades/models/swap-transaction-options';
import BigNumber from 'bignumber.js';
import { RubicItCrossChainContractTrade } from '@rsdk-features/cross-chain/providers/rubic-trade-provider/rubic-cross-chain-contract-trade/rubic-it-cross-chain-contract-trade/rubic-it-cross-chain-contract-trade';
import { EMPTY_ADDRESS } from '@rsdk-core/blockchain/constants/empty-address';
import { CelerRubicCrossChainTrade } from '@rsdk-features/cross-chain/providers/common/celer-rubic/celer-rubic-cross-chain-trade';
import { Web3Public } from 'src/core';
import { CrossChainContractTrade } from '@rsdk-features/cross-chain/providers/common/celer-rubic/cross-chain-contract-trade';
import { ContractParams } from '@rsdk-features/cross-chain/models/contract-params';
import { LowSlippageDeflationaryTokenError, RubicSdkError } from 'src/common';
import { TOKEN_WITH_FEE_ERRORS } from '@rsdk-features/cross-chain/constants/token-with-fee-errors';
import { CROSS_CHAIN_TRADE_TYPE, TradeType } from 'src/features';

export class RubicCrossChainTrade extends CelerRubicCrossChainTrade {
    public readonly type = CROSS_CHAIN_TRADE_TYPE.RUBIC;

    public readonly itType: { from: TradeType; to: TradeType };

    public readonly feeInPercents: number;

    public static async getGasData(
        fromTrade: CrossChainContractTrade,
        toTrade: CrossChainContractTrade,
        cryptoFeeToken: PriceTokenAmount
    ): Promise<GasData | null> {
        const fromBlockchain = fromTrade.blockchain;
        const walletAddress = Injector.web3Private.address;
        if (!walletAddress) {
            console.debug('Cannot calculate gas data before user logged in');
            return null;
        }

        try {
            const { contractAddress, contractAbi, methodName, methodArguments, value } =
                await new RubicCrossChainTrade(
                    {
                        fromTrade,
                        toTrade,
                        cryptoFeeToken,
                        transitFeeToken: {} as PriceTokenAmount,
                        gasData: null,
                        feeInPercents: 0
                    },
                    EMPTY_ADDRESS
                ).getContractParams();

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

    private readonly transitFeeToken: PriceTokenAmount;

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
        },
        providerAddress: string
    ) {
        super(providerAddress);

        this.feeInPercents = crossChainTrade.feeInPercents;
        this.fromTrade = crossChainTrade.fromTrade;
        this.toTrade = crossChainTrade.toTrade;
        this.gasData = crossChainTrade.gasData;
        this.cryptoFeeToken = crossChainTrade.cryptoFeeToken;

        this.fromWeb3Public = Injector.web3PublicService.getWeb3Public(this.fromTrade.blockchain);
        this.toWeb3Public = Injector.web3PublicService.getWeb3Public(this.toTrade.blockchain);

        this.transitFeeToken = crossChainTrade.transitFeeToken;

        this.from = this.fromTrade.fromToken;

        const fromSlippage =
            this.fromTrade instanceof RubicItCrossChainContractTrade ? this.fromTrade.slippage : 0;
        this.to = new PriceTokenAmount({
            ...this.toTrade.toToken.asStruct,
            weiAmount: this.toTrade.toToken.weiAmount.dividedBy(1 - fromSlippage).dp(0)
        });

        this.itType = {
            from: crossChainTrade.fromTrade.provider.type,
            to: crossChainTrade.toTrade.provider.type
        };

        this.toTokenAmountMin = this.toTrade.toTokenAmountMin;
    }

    protected async checkTradeErrors(): Promise<void | never> {
        this.checkWalletConnected();
        this.checkBlockchainCorrect();

        await Promise.all([
            this.checkContractsState(),
            this.checkToBlockchainGasPrice(),
            this.checkToContractBalance(),
            this.checkUserBalance()
        ]);
    }

    protected async getContractParams(
        fromAddress?: string,
        swapTokenWithFee = false
    ): Promise<ContractParams> {
        const { fromTrade, toTrade } = this;

        const contractAddress = fromTrade.contract.address;

        const { methodName, contractAbi } = fromTrade.getMethodNameAndContractAbi();

        const methodArguments = await fromTrade.getMethodArguments(
            toTrade,
            fromAddress || this.walletAddress,
            this.providerAddress,
            {
                swapTokenWithFee
            }
        );

        const tokenInAmountAbsolute = fromTrade.fromToken.weiAmount;
        const value = this.cryptoFeeToken.weiAmount
            .plus(fromTrade.fromToken.isNative ? tokenInAmountAbsolute : 0)
            .toFixed(0);

        return {
            contractAddress,
            contractAbi,
            methodName,
            methodArguments,
            value
        };
    }

    public async swap(options: SwapTransactionOptions = {}): Promise<string | never> {
        await this.checkTradeErrors();
        await this.checkAllowanceAndApprove(options);

        let transactionHash: string;
        try {
            transactionHash = await this.executeContractMethod(options);
        } catch (err) {
            const errMessage = err.message || err.toString?.();
            if (
                TOKEN_WITH_FEE_ERRORS.some(errText =>
                    errMessage.toLowerCase().includes(errText.toLowerCase())
                )
            ) {
                try {
                    transactionHash = await this.executeContractMethod(options, true);
                } catch (_err) {
                    throw new LowSlippageDeflationaryTokenError();
                }
            } else {
                throw this.parseSwapErrors(err);
            }
        }
        return transactionHash;
    }

    private async executeContractMethod(options: SwapTransactionOptions, swapTokenWithFee = false) {
        const { onConfirm, gasLimit, gasPrice } = options;

        const { contractAddress, contractAbi, methodName, methodArguments, value } =
            await this.getContractParams(this.walletAddress, swapTokenWithFee);

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
                },
                err => {
                    const includesErrCode = err?.message?.includes('-32000');
                    const allowedErrors = [
                        'insufficient funds for transfer',
                        'insufficient funds for gas * price + value'
                    ];
                    const includesPhrase = allowedErrors.some(error =>
                        err?.message?.includes(error)
                    );
                    return includesErrCode && includesPhrase;
                }
            );
        } catch (err) {
            if (err instanceof FailedToCheckForTransactionReceiptError) {
                return transactionHash!;
            }
            throw err;
        }

        return transactionHash!;
    }

    private parseSwapErrors(err: Error): RubicSdkError | Error {
        const errMessage = err?.message || err?.toString?.();
        if (errMessage?.includes('swapContract: Not enough amount of tokens')) {
            return new CrossChainIsUnavailableError();
        }
        if (errMessage?.includes('err: insufficient funds for gas * price + value')) {
            return new InsufficientFundsGasPriceValueError();
        }
        return err;
    }
}
