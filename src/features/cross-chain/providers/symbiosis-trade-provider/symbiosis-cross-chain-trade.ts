import { CROSS_CHAIN_TRADE_TYPE, SwapTransactionOptions } from 'src/features';
import { CrossChainTrade } from '@features/cross-chain/providers/common/cross-chain-trade';
import { TransactionRequest } from '@ethersproject/providers';
import { PriceTokenAmount, Web3Public, Web3Pure } from 'src/core';
import { Injector } from '@core/sdk/injector';
import { SYMBIOSIS_CONTRACT_ADDRESS } from '@features/cross-chain/providers/symbiosis-trade-provider/constants/contract-address';
import { SymbiosisCrossChainSupportedBlockchain } from '@features/cross-chain/providers/symbiosis-trade-provider/constants/symbiosis-cross-chain-supported-blockchain';
import { ContractParams } from '@features/cross-chain/models/contract-params';
import { SYMBIOSIS_CONTRACT_ABI } from '@features/cross-chain/providers/symbiosis-trade-provider/constants/contract-abi';
import { FailedToCheckForTransactionReceiptError } from 'src/common';
import { GasData } from '@features/cross-chain/models/gas-data';
import { EMPTY_ADDRESS } from '@core/blockchain/constants/empty-address';
import BigNumber from 'bignumber.js';

export class SymbiosisCrossChainTrade extends CrossChainTrade {
    public static async getGasData(
        from: PriceTokenAmount,
        to: PriceTokenAmount,
        transactionRequest: TransactionRequest
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
                        transactionRequest,
                        gasData: null,
                        priceImpact: 0
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

    public readonly from: PriceTokenAmount;

    public readonly to: PriceTokenAmount;

    public readonly priceImpact: number;

    public readonly gasData: GasData | null;

    private readonly transactionRequest: TransactionRequest;

    protected readonly fromWeb3Public: Web3Public;

    private get fromBlockchain(): SymbiosisCrossChainSupportedBlockchain {
        return this.from.blockchain as SymbiosisCrossChainSupportedBlockchain;
    }

    protected get fromContractAddress(): string {
        return SYMBIOSIS_CONTRACT_ADDRESS[this.fromBlockchain];
    }

    constructor(
        crossChainTrade: {
            from: PriceTokenAmount;
            to: PriceTokenAmount;
            transactionRequest: TransactionRequest;
            gasData: GasData | null;
            priceImpact: number;
        },
        providerAddress: string
    ) {
        super(providerAddress);

        this.from = crossChainTrade.from;
        this.to = crossChainTrade.to;
        this.transactionRequest = crossChainTrade.transactionRequest;
        this.gasData = crossChainTrade.gasData;
        this.priceImpact = crossChainTrade.priceImpact;

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
            await this.getContractParams();

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

    protected async getContractParams(): Promise<ContractParams> {
        const contractAddress = SYMBIOSIS_CONTRACT_ADDRESS[this.fromBlockchain];
        const contractAbi = SYMBIOSIS_CONTRACT_ABI;

        if (this.from.isNative) {
            return {
                contractAddress,
                contractAbi,
                methodName: 'SymbiosisCallWithNative',
                methodArguments: [this.providerAddress, this.transactionRequest.data],
                value: this.from.stringWeiAmount
            };
        }

        return {
            contractAddress,
            contractAbi,
            methodName: 'SymbiosisCall',
            methodArguments: [
                this.from.address,
                this.from.stringWeiAmount,
                this.providerAddress,
                this.transactionRequest.data
            ],
            value: '0'
        };
    }
}
