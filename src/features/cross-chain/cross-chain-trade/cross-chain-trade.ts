import { CrossChainContractTrade } from '@features/cross-chain/cross-chain-contract-trade/cross-chain-contract-trade';
import { Web3Pure } from '@core/blockchain/web3-pure/web3-pure';
import { Injector } from '@core/sdk/injector';
import { PriceTokenAmount } from '@core/blockchain/tokens/price-token-amount';
import { GasData } from '@features/cross-chain/models/gas-data';
import { BLOCKCHAIN_NAME } from '@core/blockchain/models/BLOCKCHAIN_NAME';
import { Web3Public } from '@core/blockchain/web3-public/web3-public';
import { CrossChainIsUnavailableError } from '@common/errors/cross-chain/cross-chain-is-unavailable.error';
import { MaxGasPriceOverflowError } from '@common/errors/cross-chain/max-gas-price-overflow.error';
import { TransactionOptions } from '@core/blockchain/models/transaction-options';
import { FailedToCheckForTransactionReceiptError } from '@common/errors/swap/failed-to-check-for-transaction-receipt.error';
import { InsufficientFundsGasPriceValueError } from '@common/errors/cross-chain/insufficient-funds-gas-price-value.error';
import { SwapTransactionOptions } from '@features/instant-trades/models/swap-transaction-options';
import BigNumber from 'bignumber.js';
import { Cache } from 'src/common';
import { TransactionReceipt } from 'web3-eth';
import { UnnecessaryApprove } from '@common/errors/swap/unnecessary-approve';
import { WalletNotConnectedError } from '@common/errors/swap/wallet-not-connected.error';
import { WrongNetworkError } from '@common/errors/swap/wrong-network.error';
import { ContractParams } from '@features/cross-chain/cross-chain-trade/models/contract-params';
import { BasicTransactionOptions } from 'src/core';
import { ItCrossChainContractTrade } from '@features/cross-chain/cross-chain-contract-trade/it-cross-chain-contract-trade/it-cross-chain-contract-trade';
import { EncodeTransactionOptions } from 'src/features';
import { TransactionConfig } from 'web3-core';

export class CrossChainTrade {
    public static async getGasData(
        fromTrade: CrossChainContractTrade,
        toTrade: CrossChainContractTrade,
        cryptoFeeToken: PriceTokenAmount
    ): Promise<GasData | null> {
        const fromBlockchain = fromTrade.blockchain;
        const walletAddress = Injector.web3Private.address;
        if (fromBlockchain !== BLOCKCHAIN_NAME.ETHEREUM || !walletAddress) {
            return null;
        }

        try {
            const { contractAddress, contractAbi, methodName, methodArguments, value } =
                await new CrossChainTrade({
                    fromTrade,
                    toTrade,
                    cryptoFeeToken,
                    transitFeeToken: {} as PriceTokenAmount,
                    gasData: null
                }).getContractParams();

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

            return {
                gasLimit,
                gasPrice
            };
        } catch (_err) {
            return null;
        }
    }

    private readonly fromTrade: CrossChainContractTrade;

    private readonly toTrade: CrossChainContractTrade;

    public readonly cryptoFeeToken: PriceTokenAmount;

    public readonly transitFeeToken: PriceTokenAmount;

    private readonly gasData: GasData | null;

    private readonly fromWeb3Public: Web3Public;

    private readonly toWeb3Public: Web3Public;

    public readonly from: PriceTokenAmount;

    public readonly to: PriceTokenAmount;

    public readonly toTokenAmountMin: BigNumber;

    private get walletAddress(): string {
        return Injector.web3Private.address;
    }

    public get estimatedGas(): BigNumber | null {
        if (!this.gasData) {
            return null;
        }
        return Web3Pure.fromWei(this.gasData.gasPrice).multipliedBy(this.gasData.gasLimit);
    }

    @Cache
    public get priceImpactData(): {
        priceImpactFrom: number | null;
        priceImpactTo: number | null;
    } {
        const calculatePriceImpact = (trade: CrossChainContractTrade): number | null => {
            return trade.fromToken.calculatePriceImpactPercent(trade.toToken);
        };

        return {
            priceImpactFrom: calculatePriceImpact(this.fromTrade),
            priceImpactTo: calculatePriceImpact(this.toTrade)
        };
    }

    constructor(crossChainTrade: {
        fromTrade: CrossChainContractTrade;
        toTrade: CrossChainContractTrade;
        cryptoFeeToken: PriceTokenAmount;
        transitFeeToken: PriceTokenAmount;
        gasData: GasData | null;
    }) {
        this.fromTrade = crossChainTrade.fromTrade;
        this.toTrade = crossChainTrade.toTrade;
        this.cryptoFeeToken = crossChainTrade.cryptoFeeToken;
        this.transitFeeToken = crossChainTrade.transitFeeToken;
        this.gasData = crossChainTrade.gasData;

        this.from = this.fromTrade.fromToken;

        const fromSlippage =
            this.fromTrade instanceof ItCrossChainContractTrade
                ? this.fromTrade.slippageTolerance
                : 0;
        this.to = new PriceTokenAmount({
            ...this.toTrade.toToken.asStruct,
            weiAmount: this.toTrade.toToken.weiAmount.dividedBy(1 - fromSlippage).dp(0)
        });

        this.toTokenAmountMin = this.toTrade.toTokenAmountMin;

        this.fromWeb3Public = Injector.web3PublicService.getWeb3Public(this.fromTrade.blockchain);
        this.toWeb3Public = Injector.web3PublicService.getWeb3Public(this.toTrade.blockchain);
    }

    public async needApprove(): Promise<boolean> {
        this.checkWalletConnected();

        if (this.fromTrade.fromToken.isNative) {
            return false;
        }

        const allowance = await this.fromWeb3Public.getAllowance(
            this.fromTrade.fromToken.address,
            this.walletAddress,
            this.fromTrade.contract.address
        );
        return this.fromTrade.fromToken.weiAmount.gt(allowance);
    }

    public approve(options: BasicTransactionOptions): Promise<TransactionReceipt> {
        if (!this.needApprove()) {
            throw new UnnecessaryApprove();
        }

        this.checkWalletConnected();
        this.checkBlockchainCorrect();

        return Injector.web3Private.approveTokens(
            this.fromTrade.fromToken.address,
            this.fromTrade.contract.address,
            'infinity',
            options
        );
    }

    protected async checkAllowanceAndApprove(
        options?: Omit<SwapTransactionOptions, 'onConfirm'>
    ): Promise<void> {
        const needApprove = await this.needApprove();
        if (!needApprove) {
            return;
        }

        const txOptions: TransactionOptions = {
            onTransactionHash: options?.onApprove,
            gas: options?.gasLimit || undefined,
            gasPrice: options?.gasPrice || undefined
        };

        await Injector.web3Private.approveTokens(
            this.fromTrade.fromToken.address,
            this.fromTrade.contract.address,
            'infinity',
            txOptions
        );
    }

    private checkWalletConnected(): never | void {
        if (!this.walletAddress) {
            throw new WalletNotConnectedError();
        }
    }

    private checkBlockchainCorrect(): never | void {
        if (Injector.web3Private.blockchainName !== this.fromTrade.blockchain) {
            throw new WrongNetworkError();
        }
    }

    private async checkContractsState(): Promise<void> {
        const [sourceContractPaused, targetContractPaused] = await Promise.all([
            this.fromTrade.contract.isPaused(),
            this.toTrade.contract.isPaused()
        ]);

        if (sourceContractPaused || targetContractPaused) {
            throw new CrossChainIsUnavailableError();
        }
    }

    private async checkToBlockchainGasPrice(): Promise<void | never> {
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

    private checkToContractBalance(): Promise<void | never> {
        return this.toWeb3Public.checkBalance(
            this.toTrade.fromToken,
            this.fromTrade.fromToken.tokenAmount,
            this.toTrade.contract.address
        );
    }

    private checkUserBalance(): Promise<void | never> {
        return this.fromWeb3Public.checkBalance(
            this.fromTrade.fromToken,
            this.fromTrade.fromToken.tokenAmount,
            this.walletAddress
        );
    }

    private async checkTradeErrors(): Promise<void | never> {
        this.checkWalletConnected();
        this.checkBlockchainCorrect();

        await Promise.all([
            this.checkContractsState(),
            this.checkToBlockchainGasPrice(),
            this.checkToContractBalance(),
            this.checkUserBalance()
        ]);
    }

    private async getContractParams(): Promise<ContractParams> {
        const { fromTrade, toTrade } = this;

        const contractAddress = fromTrade.contract.address;

        const { methodName, contractAbi } = fromTrade.getMethodNameAndContractAbi();

        const methodArguments = await fromTrade.getMethodArguments(toTrade, this.walletAddress);

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

    public async encode(options: EncodeTransactionOptions = {}): Promise<TransactionConfig> {
        const { gasLimit, gasPrice } = options;

        const { contractAddress, contractAbi, methodName, methodArguments, value } =
            await this.getContractParams();

        return Web3Pure.encodeMethodCall(
            contractAddress,
            contractAbi,
            methodName,
            methodArguments,
            value,
            {
                gas: gasLimit || this.gasData?.gasLimit.toFixed(0),
                gasPrice: gasPrice || this.gasData?.gasPrice.toFixed()
            }
        );
    }
}
