import { ERC20_TOKEN_ABI } from '@rsdk-core/blockchain/constants/erc-20-abi';
import { TransactionOptions } from '@rsdk-core/blockchain/models/transaction-options';
import { Web3Error } from '@rsdk-common/errors/blockchain/web3.error';
import Web3 from 'web3';
import BigNumber from 'bignumber.js';
import { TransactionReceipt } from 'web3-eth';
import { AbiItem } from 'web3-utils';
import { LowGasError } from '@rsdk-common/errors/blockchain/low-gas.error';
import { UserRejectError } from '@rsdk-common/errors/blockchain/user-reject.error';
import { TransactionRevertedError } from '@rsdk-common/errors/blockchain/transaction-reverted.error';
import { WalletConnectionConfiguration } from '@rsdk-core/blockchain/models/wallet-connection-configuration';
import { RubicSdkError } from '@rsdk-common/errors/rubic-sdk.error';
import { FailedToCheckForTransactionReceiptError } from '@rsdk-common/errors/swap/failed-to-check-for-transaction-receipt.error';
import { Web3Pure } from 'src/core';
import { LowSlippageError } from 'src/common';
import { parseError } from 'src/common/utils/errors';
import { ethers, Signer } from 'ethers';
import { ExternalProvider, JsonRpcFetchFunc } from '@ethersproject/providers/src.ts/web3-provider';

/**
 * Class containing methods for executing the functions of contracts
 * and sending transactions in order to change the state of the blockchain.
 * To get information from the blockchain use {@link Web3Public}.
 */
export class Web3Private {
    /**
     * Converts number, string or BigNumber value to integer string.
     * @param amount Value to convert.
     */
    private static stringifyAmount(amount: number | string | BigNumber): string {
        const bnAmount = new BigNumber(amount);
        if (!bnAmount.isInteger()) {
            throw new RubicSdkError(`Value ${amount} is not integer`);
        }

        return bnAmount.toFixed(0);
    }

    private readonly APPROVE_GAS_LIMIT = 60_000;

    /**
     * Instance of web3, initialized with ethereum wallet, e.g. Metamask, WalletConnect.
     */
    private readonly web3: Web3;

    /**
     * Current wallet provider address.
     */
    public get address(): string {
        return this.walletConnectionConfiguration.address;
    }

    /**
     * Current wallet blockchain name.
     */
    public get blockchainName(): string {
        return this.walletConnectionConfiguration.blockchainName;
    }

    public get signer(): Signer {
        return new ethers.providers.Web3Provider(
            this.web3.currentProvider as ExternalProvider | JsonRpcFetchFunc
        ).getSigner();
    }

    /**
     * @param walletConnectionConfiguration Provider that implements {@link WalletConnectionConfiguration} interface.
     * The provider must contain an instance of web3, initialized with ethereum wallet, e.g. Metamask, WalletConnect.
     */
    constructor(private readonly walletConnectionConfiguration: WalletConnectionConfiguration) {
        this.web3 = walletConnectionConfiguration.web3;
    }

    /**
     * Parses web3 error by its code or message.
     * @param err Web3 error to parse.
     */
    private static parseError(err: Web3Error): RubicSdkError {
        if (err.message.includes('Transaction has been reverted by the EVM')) {
            return new TransactionRevertedError();
        }
        if (err.message.includes('execution reverted: UNIV3R: min return')) {
            return new LowSlippageError();
        }
        if (err.message.includes('Failed to check for transaction receipt')) {
            return new FailedToCheckForTransactionReceiptError();
        }
        if (err.code === -32603) {
            return new LowGasError();
        }
        if (err.code === 4001) {
            return new UserRejectError();
        }
        try {
            const errorMessage = JSON.parse(err.message.slice(24)).message;
            if (errorMessage) {
                return new Error(errorMessage);
            }
        } catch {}
        return parseError(err);
    }

    /**
     * Sends ERC-20 tokens and resolves the promise when the transaction is included in the block.
     * @param contractAddress Address of the smart-contract corresponding to the token.
     * @param toAddress Token receiver address.
     * @param amount Integer tokens amount to send in wei.
     * @param [options] Additional options.
     * @returns Transaction receipt.
     */
    public async transferTokens(
        contractAddress: string,
        toAddress: string,
        amount: string | BigNumber,
        options: TransactionOptions = {}
    ): Promise<TransactionReceipt> {
        const contract = new this.web3.eth.Contract(ERC20_TOKEN_ABI as AbiItem[], contractAddress);

        return new Promise((resolve, reject) => {
            contract.methods
                .transfer(toAddress, Web3Private.stringifyAmount(amount))
                .send({
                    from: this.address,
                    ...(options.gas && { gas: Web3Private.stringifyAmount(options.gas) }),
                    ...(options.gasPrice && {
                        gasPrice: Web3Private.stringifyAmount(options.gasPrice)
                    })
                })
                .on('transactionHash', options.onTransactionHash || (() => {}))
                .on('receipt', resolve)
                .on('error', (err: Web3Error) => {
                    console.error(`Tokens transfer error. ${err}`);
                    reject(Web3Private.parseError(err));
                });
        });
    }

    /**
     * Tries to send Eth in transaction and resolve the promise when the transaction is included in the block or rejects the error.
     * @param toAddress Eth receiver address.
     * @param value Native token amount in wei.
     * @param [options] Additional options.
     * @returns Transaction receipt.
     */
    public async trySendTransaction(
        toAddress: string,
        value: BigNumber | string,
        options: TransactionOptions = {}
    ): Promise<TransactionReceipt> {
        try {
            await this.web3.eth.call({
                from: this.address,
                to: toAddress,
                value: Web3Private.stringifyAmount(value),
                ...(options.gas && { gas: Web3Private.stringifyAmount(options.gas) }),
                ...(options.gasPrice && {
                    gasPrice: Web3Private.stringifyAmount(options.gasPrice)
                }),
                ...(options.data && { data: options.data })
            });
            return await this.sendTransaction(toAddress, value, options);
        } catch (err) {
            console.debug('Call tokens transfer error', err);
            const shouldIgnore = this.shouldIgnoreError(err);
            if (shouldIgnore) {
                return await this.sendTransaction(toAddress, value, options);
            }
            throw Web3Private.parseError(err as Web3Error);
        }
    }

    /**
     * Sends Eth in transaction and resolve the promise when the transaction is included in the block.
     * @param toAddress Eth receiver address.
     * @param value Native token amount in wei.
     * @param [options] Additional options.
     * @returns Transaction receipt.
     */
    public async sendTransaction(
        toAddress: string,
        value: BigNumber | string,
        options: TransactionOptions = {}
    ): Promise<TransactionReceipt> {
        return new Promise((resolve, reject) => {
            this.web3.eth
                .sendTransaction({
                    from: this.address,
                    to: toAddress,
                    value: Web3Private.stringifyAmount(value),
                    ...(options.gas && { gas: Web3Private.stringifyAmount(options.gas) }),
                    ...(options.gasPrice && {
                        gasPrice: Web3Private.stringifyAmount(options.gasPrice)
                    }),
                    ...(options.data && { data: options.data })
                })
                .on('transactionHash', options.onTransactionHash || (() => {}))
                .on('receipt', receipt => resolve(receipt))
                .on('error', err => {
                    console.error(`Tokens transfer error. ${err}`);
                    reject(Web3Private.parseError(err as Web3Error));
                });
        });
    }

    /**
     * Executes approve method in ERC-20 token contract.
     * @param tokenAddress Address of the smart-contract corresponding to the token.
     * @param spenderAddress Wallet or contract address to approve.
     * @param value Token amount to approve in wei.
     * @param [options] Additional options.
     * @returns Approval transaction receipt.
     */
    public async approveTokens(
        tokenAddress: string,
        spenderAddress: string,
        value: BigNumber | 'infinity',
        options: TransactionOptions = {}
    ): Promise<TransactionReceipt> {
        let rawValue: BigNumber;
        if (value === 'infinity') {
            rawValue = new BigNumber(2).pow(256).minus(1);
        } else {
            rawValue = value;
        }
        const contract = new this.web3.eth.Contract(ERC20_TOKEN_ABI, tokenAddress);

        let { gas } = options;
        if (!gas) {
            gas = await contract.methods.approve(spenderAddress, rawValue.toFixed(0)).estimateGas({
                from: this.address
            });
        }

        return new Promise((resolve, reject) => {
            contract.methods
                .approve(spenderAddress, rawValue.toFixed(0))
                .send({
                    from: this.address,
                    ...(gas && { gas: Web3Private.stringifyAmount(gas) }),
                    ...(options.gasPrice && {
                        gasPrice: Web3Private.stringifyAmount(options.gasPrice)
                    })
                })
                .on('transactionHash', options.onTransactionHash || (() => {}))
                .on('receipt', resolve)
                .on('error', (err: Web3Error) => {
                    console.error(`Tokens approve error. ${err}`);
                    reject(Web3Private.parseError(err));
                });
        });
    }

    /**
     * Tries to execute method of smart-contract and resolve the promise when the transaction is included in the block or rejects the error.
     * @param contractAddress Address of smart-contract which method is to be executed.
     * @param contractAbi Abi of smart-contract which method is to be executed.
     * @param methodName Method name to execute.
     * @param methodArguments Method arguments.
     * @param [options] Additional options.
     * @param allowError Check error and decides to execute contact if error is allowed.
     */
    public async tryExecuteContractMethod(
        contractAddress: string,
        contractAbi: AbiItem[],
        methodName: string,
        methodArguments: unknown[],
        options: TransactionOptions = {},
        allowError?: (err: Web3Error) => boolean
    ): Promise<TransactionReceipt> {
        const contract = new this.web3.eth.Contract(contractAbi, contractAddress);

        try {
            const gas = await contract.methods[methodName](...methodArguments).estimateGas({
                from: this.address,
                ...(options.value && { value: Web3Private.stringifyAmount(options.value) }),
                ...(options.gas && { gas: Web3Private.stringifyAmount(options.gas) }),
                ...(options.gasPrice && {
                    gasPrice: Web3Private.stringifyAmount(options.gasPrice)
                })
            });
            return this.executeContractMethod(
                contractAddress,
                contractAbi,
                methodName,
                methodArguments,
                {
                    ...options,
                    gas: options.gas || Web3Pure.calculateGasMargin(gas, 1.15)
                }
            );
        } catch (err) {
            if ((allowError && allowError(err as Web3Error)) || this.shouldIgnoreError(err)) {
                return this.executeContractMethod(
                    contractAddress,
                    contractAbi,
                    methodName,
                    methodArguments,
                    options
                );
            }
            console.error('Method execution error: ', err);
            throw Web3Private.parseError(err as Web3Error);
        }
    }

    /**
     * Executes method of smart-contract and resolve the promise when the transaction is included in the block.
     * @param contractAddress Address of smart-contract which method is to be executed.
     * @param contractAbi Abi of smart-contract which method is to be executed.
     * @param methodName Method name to execute.
     * @param methodArguments Method arguments.
     * @param [options] Additional options.
     * @returns Smart-contract method returned value.
     */
    public async executeContractMethod(
        contractAddress: string,
        contractAbi: AbiItem[],
        methodName: string,
        methodArguments: unknown[],
        options: TransactionOptions = {}
    ): Promise<TransactionReceipt> {
        const contract = new this.web3.eth.Contract(contractAbi, contractAddress);

        return new Promise((resolve, reject) => {
            contract.methods[methodName](...methodArguments)
                .send({
                    from: this.address,
                    ...(options.value && {
                        value: Web3Private.stringifyAmount(options.value)
                    }),
                    ...(options.gas && {
                        gas: Web3Private.stringifyAmount(options.gas)
                    }),
                    ...(options.gasPrice && {
                        gasPrice: Web3Private.stringifyAmount(options.gasPrice)
                    })
                })
                .on('transactionHash', options.onTransactionHash || (() => {}))
                .on('receipt', resolve)
                .on('error', (err: Web3Error) => {
                    console.error(`Method execution error. ${err}`);
                    reject(Web3Private.parseError(err));
                });
        });
    }

    /**
     * Executes method of smart-contract and resolve the promise without waiting for the transaction to be included in the block.
     * @param contractAddress Address of smart-contract which method is to be executed.
     * @param contractAbi Abi of smart-contract which method is to be executed.
     * @param methodName Executing method name.
     * @param methodArguments Executing method arguments.
     * @param options Additional options.
     */
    public executeContractMethodWithOnHashResolve(
        contractAddress: string,
        contractAbi: AbiItem[],
        methodName: string,
        methodArguments: unknown[],
        options: TransactionOptions = {}
    ): Promise<unknown> {
        const contract = new this.web3.eth.Contract(contractAbi, contractAddress);

        return new Promise((resolve, reject) => {
            contract.methods[methodName](...methodArguments)
                .send({
                    from: this.address,
                    ...(options.gas && { gas: Web3Private.stringifyAmount(options.gas) }),
                    ...(options.gasPrice && {
                        gasPrice: Web3Private.stringifyAmount(options.gasPrice)
                    })
                })
                .on('transactionHash', resolve)
                .on('error', (err: Web3Error) => {
                    console.error(`Tokens approve error. ${err}`);
                    reject(Web3Private.parseError(err));
                });
        });
    }

    /**
     * Removes approval for token.
     * @param tokenAddress Address of the smart-contract corresponding to the token.
     * @param spenderAddress Wallet or contract address to approve.
     */
    public async unApprove(
        tokenAddress: string,
        spenderAddress: string
    ): Promise<TransactionReceipt> {
        return this.approveTokens(tokenAddress, spenderAddress, new BigNumber(0));
    }

    private shouldIgnoreError(error: Web3Error): boolean {
        const ignoreCallErrors = [
            'execution reverted: TransferHelper: TRANSFER_FROM_FAILED',
            'STF',
            'execution reverted: ERC20: transfer amount exceeds allowance',
            'Anyswaperc20: request exceed allowance',
            'gas required exceeds allowance',
            'execution reverted: SafeERC20: low-level call failed'
        ];

        const test = ignoreCallErrors.some(err =>
            error?.message?.toLowerCase().includes(err.toLowerCase())
        );
        console.log(test);
        return test;
    }
}
