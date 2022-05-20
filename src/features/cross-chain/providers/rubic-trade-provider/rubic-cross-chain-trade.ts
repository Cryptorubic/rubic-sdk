import { Web3Pure } from '@core/blockchain/web3-pure/web3-pure';
import { Injector } from '@core/sdk/injector';
import { PriceTokenAmount } from '@core/blockchain/tokens/price-token-amount';
import { GasData } from '@features/cross-chain/models/gas-data';
import { CrossChainIsUnavailableError } from '@common/errors/cross-chain/cross-chain-is-unavailable.error';
import { FailedToCheckForTransactionReceiptError } from '@common/errors/swap/failed-to-check-for-transaction-receipt.error';
import { InsufficientFundsGasPriceValueError } from '@common/errors/cross-chain/insufficient-funds-gas-price-value.error';
import { SwapTransactionOptions } from '@features/instant-trades/models/swap-transaction-options';
import BigNumber from 'bignumber.js';
import { MaxGasPriceOverflowError } from 'src/common';
import { RubicItCrossChainContractTrade } from '@features/cross-chain/providers/rubic-trade-provider/rubic-cross-chain-contract-trade/rubic-it-cross-chain-contract-trade/rubic-it-cross-chain-contract-trade';
import { EMPTY_ADDRESS } from '@core/blockchain/constants/empty-address';
import { CrossChainTrade } from '@features/cross-chain/providers/common/cross-chain-trade';
import { BLOCKCHAIN_NAME } from '@core/blockchain/models/blockchain-name';
import { Web3Public } from 'src/core';
import { CrossChainContractTrade } from '@features/cross-chain/providers/common/cross-chain-contract-trade';
import { ContractParams } from '@features/cross-chain/models/contract-params';

export class RubicCrossChainTrade extends CrossChainTrade {
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
                        gasData: null
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

    private readonly from: PriceTokenAmount;

    private readonly to: PriceTokenAmount;

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
        },
        providerAddress: string
    ) {
        super(providerAddress);
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

    public async swap(options: SwapTransactionOptions = {}): Promise<string | never> {
        await this.checkTradeErrors();
        await this.checkAllowanceAndApprove(options);

        const { onConfirm, gasLimit, gasPrice } = options;

        const { contractAddress, contractAbi, methodName, methodArguments, value } =
            await this.getContractParams();

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

            return transactionHash!;
        } catch (err) {
            if (err instanceof FailedToCheckForTransactionReceiptError) {
                return transactionHash!;
            }
            return this.parseSwapErrors(err);
        }
    }

    protected async checkToBlockchainGasPrice(): Promise<void | never> {
        if (this.toTrade.blockchain !== BLOCKCHAIN_NAME.ETHEREUM) {
            return;
        }

        const [maxGasPrice, currentGasPrice] = await Promise.all([
            this.toTrade.contract.getMaxGasPrice(),
            Injector.gasPriceApi.getGasPriceInEthUnits(this.toTrade.blockchain)
        ]);
        if (maxGasPrice.lt(currentGasPrice)) {
            throw new MaxGasPriceOverflowError();
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

    protected async getContractParams(fromAddress?: string): Promise<ContractParams> {
        const { fromTrade, toTrade } = this;

        const contractAddress = fromTrade.contract.address;

        const { methodName, contractAbi } = fromTrade.getMethodNameAndContractAbi();

        const methodArguments = await fromTrade.getMethodArguments(
            toTrade,
            fromAddress || this.walletAddress,
            this.providerAddress
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
}
