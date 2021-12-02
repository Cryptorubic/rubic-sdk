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
import { DeepReadonly } from '@common/utils/types/deep-readonly';

export class CrossChainTrade {
    public static async getGasData(
        fromTrade: ContractTrade,
        toTrade: ContractTrade,
        cryptoFeeToken: PriceTokenAmount
    ): Promise<GasData | null> {
        const fromBlockchain = fromTrade.blockchain;
        const walletAddress = Injector.web3Private.address;
        if (fromBlockchain !== BLOCKCHAIN_NAME.ETHEREUM || !walletAddress) {
            return null;
        }

        try {
            const { contractAddress, methodName, methodArguments, value } =
                await new CrossChainTrade({
                    fromTrade,
                    toTrade,
                    cryptoFeeToken,
                    transitFeeToken: {} as PriceTokenAmount,
                    minMaxAmountsErrors: {},
                    gasData: null
                }).getContractMethodData();

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
                new BigNumber(await web3Public.getGasPrice()).dividedBy(10 ** 9).toFixed()
            ]);

            return {
                gasLimit,
                gasPrice
            };
        } catch (_err) {
            return null;
        }
    }

    private readonly fromTrade: ContractTrade;

    private readonly toTrade: ContractTrade;

    public readonly fromToken: DeepReadonly<PriceTokenAmount>;

    public readonly toToken: DeepReadonly<PriceTokenAmount>;

    public readonly cryptoFeeToken: DeepReadonly<PriceTokenAmount>;

    public readonly transitFeeToken: DeepReadonly<PriceTokenAmount>;

    private readonly minMaxAmountsErrors: MinMaxAmountsErrors;

    private readonly gasData: GasData | null;

    private readonly web3Private: Web3Private;

    private readonly fromWeb3Public: Web3Public;

    private readonly toWeb3Public: Web3Public;

    private get walletAddress(): string {
        return this.web3Private.address;
    }

    public get estimatedGas(): BigNumber | null {
        if (!this.gasData) {
            return null;
        }
        return new BigNumber(this.gasData.gasLimit).multipliedBy(this.gasData.gasPrice);
    }

    public get priceImpactData(): {
        priceImpactFrom: number | null;
        priceImpactTo: number | null;
    } {
        const calculatePriceImpact = (trade: ContractTrade): number | null => {
            return trade.fromToken.calculatePriceImpact(new PriceTokenAmount(trade.toToken));
        };

        return {
            priceImpactFrom: calculatePriceImpact(this.fromTrade),
            priceImpactTo: calculatePriceImpact(this.toTrade)
        };
    }

    constructor(crossChainTrade: {
        fromTrade: ContractTrade;
        toTrade: ContractTrade;
        cryptoFeeToken: DeepReadonly<PriceTokenAmount>;
        transitFeeToken: DeepReadonly<PriceTokenAmount>;
        minMaxAmountsErrors: MinMaxAmountsErrors;
        gasData: GasData | null;
    }) {
        this.fromTrade = crossChainTrade.fromTrade;
        this.toTrade = crossChainTrade.toTrade;
        this.fromToken = this.fromTrade.fromToken;
        this.toToken = this.toTrade.toToken;
        this.cryptoFeeToken = crossChainTrade.cryptoFeeToken;
        this.transitFeeToken = crossChainTrade.transitFeeToken;
        this.minMaxAmountsErrors = crossChainTrade.minMaxAmountsErrors;
        this.gasData = crossChainTrade.gasData;

        this.web3Private = Injector.web3Private;
        this.fromWeb3Public = Injector.web3PublicService.getWeb3Public(this.fromTrade.blockchain);
        this.toWeb3Public = Injector.web3PublicService.getWeb3Public(this.toTrade.blockchain);
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

    private async checkToBlockchainGasPrice(): Promise<void | never> {
        if (this.toTrade.blockchain !== BLOCKCHAIN_NAME.ETHEREUM) {
            return;
        }

        const [maxGasPrice, currentGasPrice] = await Promise.all([
            this.toTrade.contract.getMaxGasPrice(),
            new BigNumber(await this.toWeb3Public.getGasPrice()).dividedBy(10 ** 9).toFixed()
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
            this.checkToBlockchainGasPrice(),
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

        const tokenInAmountAbsolute = fromTrade.fromToken.weiAmount;
        const tokenOutAmountMin = toTrade.toAmountMin;
        const tokenOutAmountMinAbsolute = Web3Pure.toWei(
            tokenOutAmountMin,
            toTrade.toToken.decimals
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

    public async swap(options: TransactionOptions = {}): Promise<string | never> {
        await this.checkTradeErrors();

        const { contractAddress, methodName, methodArguments, value } =
            await this.getContractMethodData();

        let transactionHash: string;
        try {
            const onTransactionHash = (hash: string) => {
                if (options.onTransactionHash) {
                    options.onTransactionHash(hash);
                }
                transactionHash = hash;
            };

            await this.web3Private.tryExecuteContractMethod(
                contractAddress,
                crossChainContractAbi,
                methodName,
                methodArguments,
                {
                    ...options,
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
