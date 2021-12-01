import { ContractTrade } from '@features/cross-chain/models/ContractTrade/ContractTrade';
import { Web3Pure } from '@core/blockchain/web3-pure/web3-pure';
import { CROSS_CHAIN_ROUTING_SWAP_METHOD } from '@features/cross-chain/cross-chain-trade/models/CROSS_CHAIN_ROUTING_SWAP_METHOD';
import { Injector } from '@core/sdk/injector';
import { Web3Private } from '@core/blockchain/web3-private/web3-private';
import { PriceTokenAmount } from '@core/blockchain/tokens/price-token-amount';
import { CrossChainContractMethodData } from '@features/cross-chain/cross-chain-trade/models/CrossChainContractMethodData';
import { GasData } from '@common/models/GasData';
import { BLOCKCHAIN_NAME } from '@core/blockchain/models/BLOCKCHAIN_NAME';
import { crossChainContractAbi } from '@features/cross-chain/constants/crossChainContractAbi';
import { MinMaxAmountsErrors } from '@features/cross-chain/cross-chain-trade/models/MinMaxAmountsErrors';
import { Web3Public } from '@core/blockchain/web3-public/web3-public';
import { CrossChainIsUnavailableError } from '@common/errors/cross-chain/CrossChainIsUnavailableWarning';
import { MaxGasPriceOverflowError } from '@common/errors/cross-chain/MaxGasPriceOverflowError';
import { TransactionOptions } from '@core/blockchain/models/transaction-options';
import { FailedToCheckForTransactionReceiptError } from '@common/errors/swap/FailedToCheckForTransactionReceiptError';
import { InsufficientFundsGasPriceValueError } from '@common/errors/cross-chain/InsufficientFundsGasPriceValueError';
import BigNumber from 'bignumber.js';
import { TransactionReceipt } from 'web3-eth';

export class CrossChainTrade {
    public static async getGasData(
        fromTrade: ContractTrade,
        toTrade: ContractTrade,
        cryptoFeeToken: PriceTokenAmount
    ): Promise<GasData | null> {
        const fromBlockchain = fromTrade.blockchain;
        const { web3Private } = Injector;
        const walletAddress = web3Private.address;
        if (fromBlockchain !== BLOCKCHAIN_NAME.ETHEREUM || !walletAddress) {
            return null;
        }

        try {
            const { contractAddress, methodName, methodArguments, value } =
                await new CrossChainTrade(
                    fromTrade,
                    toTrade,
                    cryptoFeeToken,
                    {},
                    null
                ).getContractMethodData();

            const web3Public = Injector.web3PublicService.getWeb3Public(fromBlockchain);
            const [gasLimit, gasPrice] = await Promise.all([
                web3Public.getEstimatedGas(
                    crossChainContractAbi,
                    contractAddress,
                    methodName,
                    methodArguments,
                    walletAddress,
                    value
                ),
                web3Private.getGasPrice()
            ]);

            return {
                gasLimit,
                gasPrice
            };
        } catch (_err) {
            return null;
        }
    }

    private readonly web3Private: Web3Private;

    private readonly fromWeb3Public: Web3Public;

    private readonly toWeb3Public: Web3Public;

    private get walletAddress(): string {
        return this.web3Private.address;
    }

    constructor(
        private readonly fromTrade: ContractTrade,
        private readonly toTrade: ContractTrade,
        private readonly cryptoFeeToken: PriceTokenAmount,
        private readonly minMaxAmountsErrors: MinMaxAmountsErrors,
        private readonly gasData: GasData | null
    ) {
        this.web3Private = Injector.web3Private;
        this.fromWeb3Public = Injector.web3PublicService.getWeb3Public(fromTrade.blockchain);
        this.toWeb3Public = Injector.web3PublicService.getWeb3Public(toTrade.blockchain);
    }

    public getAllowance(tokenAddress: string): Promise<BigNumber> {
        return this.fromWeb3Public.getAllowance(
            tokenAddress,
            this.walletAddress,
            this.fromTrade.contract.address
        );
    }

    public approve(tokenAddress: string, options: TransactionOptions): Promise<TransactionReceipt> {
        return this.web3Private.approveTokens(
            tokenAddress,
            this.fromTrade.contract.address,
            'infinity',
            options
        );
    }

    private async checkContractsState(): Promise<void> {
        const [sourceContractPaused, targetContractPaused] = await Promise.all([
            this.fromTrade.contract.isContractPaused(),
            this.toTrade.contract.isContractPaused()
        ]);

        if (sourceContractPaused || targetContractPaused) {
            throw new CrossChainIsUnavailableError();
        }
    }

    private async checkGasPrice(): Promise<void | never> {
        if (this.toTrade.blockchain !== BLOCKCHAIN_NAME.ETHEREUM) {
            return;
        }

        const [maxGasPrice, currentGasPrice] = await Promise.all([
            this.toTrade.contract.getMaxGasPrice(),
            this.web3Private.getGasPrice()
        ]);
        if (maxGasPrice.lt(currentGasPrice)) {
            throw new MaxGasPriceOverflowError();
        }
    }

    private checkToContractBalance(): Promise<void | never> {
        return this.fromWeb3Public.checkBalance(
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
        await Promise.all([
            this.checkContractsState(),
            this.checkGasPrice(),
            this.checkToContractBalance(),
            this.checkUserBalance()
        ]);

        if (this.minMaxAmountsErrors.minAmount) {
            throw new Error(`Minimum amount is ${this.minMaxAmountsErrors.minAmount}`);
        }
        if (this.minMaxAmountsErrors.maxAmount) {
            throw new Error(`Maximum amount is ${this.minMaxAmountsErrors.maxAmount}`);
        }
    }

    private async getContractMethodData(): Promise<CrossChainContractMethodData> {
        const { fromTrade, toTrade } = this;

        const contractAddress = fromTrade.contract.address;

        const isFromTokenNative = Web3Pure.isNativeAddress(fromTrade.fromToken.address);
        const methodName = isFromTokenNative
            ? CROSS_CHAIN_ROUTING_SWAP_METHOD.SWAP_CRYPTO
            : CROSS_CHAIN_ROUTING_SWAP_METHOD.SWAP_TOKENS;

        const toBlockchainInContract = await toTrade.contract.getNumOfContract();

        const tokenInAmountAbsolute = Web3Pure.toWei(
            fromTrade.fromToken.tokenAmount,
            fromTrade.fromToken.decimals
        );
        const tokenOutAmountMin = fromTrade.toAmountMin;
        const tokenOutAmountMinAbsolute = Web3Pure.toWei(
            tokenOutAmountMin,
            fromTrade.fromToken.decimals
        );

        const fromTransitTokenAmountAbsolute = fromTrade.toAmountWei;

        const methodArguments = [
            [
                toBlockchainInContract,
                tokenInAmountAbsolute,
                fromTrade.path,
                toTrade.path,
                fromTransitTokenAmountAbsolute,
                tokenOutAmountMinAbsolute,
                this.walletAddress,
                Web3Pure.isNativeAddress(toTrade.toToken.address),
                true
            ]
        ];

        const value = this.cryptoFeeToken.weiAmount
            .plus(isFromTokenNative ? tokenInAmountAbsolute : 0)
            .toFixed(0);

        return {
            contractAddress,
            methodName,
            methodArguments,
            value
        };
    }

    public async swap(options: TransactionOptions = {}): Promise<string> {
        await this.checkTradeErrors();

        const { contractAddress, methodName, methodArguments, value } =
            await this.getContractMethodData();

        let transactionHash: string;
        try {
            await this.web3Private.tryExecuteContractMethod(
                contractAddress,
                crossChainContractAbi,
                methodName,
                methodArguments,
                {
                    ...options,
                    value,
                    onTransactionHash: (hash: string) => {
                        if (options.onTransactionHash) {
                            options.onTransactionHash(hash);
                        }
                        transactionHash = hash;
                    }
                },
                err => {
                    const includesErrCode = err?.message?.includes('-32000');
                    const allowedErrors = [
                        'insufficient funds for transfer',
                        'insufficient funds for gas * price + value'
                    ];
                    const includesPhrase = Boolean(
                        allowedErrors.find(error => err?.message?.includes(error))
                    );
                    return includesErrCode && includesPhrase;
                }
            );
            return transactionHash!;
        } catch (err) {
            if (err instanceof FailedToCheckForTransactionReceiptError) {
                return transactionHash!;
            }

            const errMessage = err!.message || err.toString?.();
            if (errMessage?.includes('swapContract: Not enough amount of tokens')) {
                throw new CrossChainIsUnavailableError();
            }
            if (errMessage?.includes('err: insufficient funds for gas * price + value')) {
                throw new InsufficientFundsGasPriceValueError();
            }

            throw err;
        }
    }
}
