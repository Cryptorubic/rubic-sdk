import Web3 from 'web3';
import BigNumber from 'bignumber.js';
import { TransactionReceipt } from 'web3-eth';
import { AbiItem } from 'web3-utils';
import ERC20_TOKEN_ABI from '../constants/erc-20-abi';
import { LowGasError } from '../../common/errors/low-gas-error';
import { TransactionOptions } from '../models/transaction-options';
import { UserRejectError } from '../../common/errors/user-reject-error';
import { TransactionRevertedError } from '../../common/errors/transaction-reverted-error';
import { ProviderConnector } from '../models/provider-connector';
import { Web3Error } from '../models/web3-error';
import { RubicError } from '../../common/errors/rubic-error';

/**
 * Class containing methods for executing the functions of contracts and sending transactions in order to change the state of the blockchain.
 * To get information from the blockchain use {@link Web3Public}.
 */
export class Web3Private {
    /**
     * @description instance of web3, initialized with ethereum wallet, e.g. Metamask, WalletConnect
     */
    private readonly web3: Web3;

    /**
     * @description current wallet provider address
     */
    private get address(): string {
        return this.providerConnector.address;
    }

    /**
     * @description converts number, string or BigNumber value to integer string
     * @param amount value to convert
     */
    private static stringifyAmount(amount: number | string | BigNumber): string {
        const bnAmount = new BigNumber(amount);
        if (!bnAmount.isInteger()) {
            throw new RubicError(`Value ${amount} is not integer`);
        }

        return bnAmount.toFixed(0);
    }

    /**
     * @param providerConnector provider that implements {@link ProviderConnector} interface.
     * The provider must contain an instance of web3, initialized with ethereum wallet, e.g. Metamask, WalletConnect
     */
    constructor(private readonly providerConnector: ProviderConnector) {
        this.web3 = providerConnector.web3;
    }

    /**
     * @description parse web3 error by its code
     * @param err web3 error to parse
     */
    private static parseError(err: Web3Error): RubicError {
        if (err.message.includes('Transaction has been reverted by the EVM')) {
            return new TransactionRevertedError();
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
        return err;
    }

    /**
     * @description sends ERC-20 tokens and resolve the promise when the transaction is included in the block
     * @param contractAddress address of the smart-contract corresponding to the token
     * @param toAddress token receiver address
     * @param amount integer tokens amount to send (pre-multiplied by 10 ** decimals)
     * @param [options] additional options
     * @param [options.onTransactionHash] callback to execute when transaction enters the mempool
     * @return transaction receipt
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
     * @description sends ERC-20 tokens and resolve the promise without waiting for the transaction to be included in the block
     * @param contractAddress address of the smart-contract corresponding to the token
     * @param toAddress token receiver address
     * @param amount integer tokens amount to send (pre-multiplied by 10 ** decimals)
     * @param [options] additional options
     * @param [options.onTransactionHash] callback to execute when transaction enters the mempool
     * @return transaction hash
     */
    public async transferTokensWithOnHashResolve(
        contractAddress: string,
        toAddress: string,
        amount: string | BigNumber,
        options: TransactionOptions = {}
    ): Promise<string> {
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
                .on('transactionHash', (hash: string) => resolve(hash))
                .on('error', (err: Web3Error) => {
                    console.error(`Tokens transfer error. ${err}`);
                    reject(Web3Private.parseError(err));
                });
        });
    }

    /**
     * @description tries to send Eth in transaction and resolve the promise when the transaction is included in the block or rejects the error
     * @param toAddress Eth receiver address
     * @param value amount in Eth units
     * @param [options] additional options
     * @param [options.onTransactionHash] callback to execute when transaction enters the mempool
     * @param [options.inWei = false] boolean flag for determining the input parameter "value" in Wei
     * @param [options.data] data for calling smart contract methods.
     *    Use this field only if you are receiving data from a third-party api.
     *    When manually calling contract methods, use executeContractMethod()
     * @param [options.gas] transaction gas limit in absolute gas units
     * @param [options.gasPrice] price of gas unit in wei
     * @return transaction receipt
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
        } catch (err: unknown) {
            console.error(`Tokens transfer error. ${err}`);
            throw Web3Private.parseError(err as Web3Error);
        }
    }

    /**
     * @description sends Eth in transaction and resolve the promise when the transaction is included in the block
     * @param toAddress Eth receiver address
     * @param value amount in Eth units
     * @param [options] additional options
     * @param [options.onTransactionHash] callback to execute when transaction enters the mempool
     * @param [options.inWei = false] boolean flag for determining the input parameter "value" in Wei
     * @param [options.data] data for calling smart contract methods.
     *    Use this field only if you are receiving data from a third-party api.
     *    When manually calling contract methods, use executeContractMethod()
     * @param [options.gas] transaction gas limit in absolute gas units
     * @param [options.gasPrice] price of gas unit in wei
     * @return transaction receipt
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
     * @description sends Eth in transaction and resolve the promise without waiting for the transaction to be included in the block
     * @param toAddress Eth receiver address
     * @param value amount in Eth units
     * @param [options] additional options
     * @param [options.inWei = false] boolean flag for determining the input parameter "value" in Wei
     * @return transaction hash
     */
    public async sendTransactionWithOnHashResolve(
        toAddress: string,
        value: string | BigNumber,
        options: TransactionOptions = {}
    ): Promise<string> {
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
                .on('transactionHash', hash => resolve(hash))
                .on('error', err => {
                    console.error(`Tokens transfer error. ${err}`);
                    reject(Web3Private.parseError(err as Web3Error));
                });
        });
    }

    /**
     * @description executes approve method in ERC-20 token contract
     * @param tokenAddress address of the smart-contract corresponding to the token
     * @param spenderAddress wallet or contract address to approve
     * @param value integer value to approve (pre-multiplied by 10 ** decimals)
     * @param [options] additional options
     * @param [options.onTransactionHash] callback to execute when transaction enters the mempool
     * @return approval transaction receipt
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
        const contract = new this.web3.eth.Contract(ERC20_TOKEN_ABI as AbiItem[], tokenAddress);

        return new Promise((resolve, reject) => {
            contract.methods
                .approve(spenderAddress, rawValue.toFixed(0))
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
                    console.error(`Tokens approve error. ${err}`);
                    reject(Web3Private.parseError(err));
                });
        });
    }

    /**
     * @description tries to execute method of smart-contract and resolve the promise when the transaction is included in the block or rejects the error
     * @param contractAddress address of smart-contract which method is to be executed
     * @param contractAbi abi of smart-contract which method is to be executed
     * @param methodName executing method name
     * @param methodArguments executing method arguments
     * @param [options] additional options
     * @param [options.value] amount in Wei amount to be attached to the transaction
     * @param [options.gas] gas limit to be attached to the transaction
     * @param allowError Check error and decides to execute contact if it needed.
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
            await contract.methods[methodName](...methodArguments).call({
                from: this.address,
                ...(options.value && { value: Web3Private.stringifyAmount(options.value) }),
                ...(options.gas && { gas: Web3Private.stringifyAmount(options.gas) }),
                ...(options.gasPrice && {
                    gasPrice: Web3Private.stringifyAmount(options.gasPrice)
                })
            });
            return await this.executeContractMethod(
                contractAddress,
                contractAbi,
                methodName,
                methodArguments,
                options
            );
        } catch (err: unknown) {
            if (allowError && allowError(err as Web3Error)) {
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
     * @description executes method of smart-contract and resolve the promise when the transaction is included in the block
     * @param contractAddress address of smart-contract which method is to be executed
     * @param contractAbi abi of smart-contract which method is to be executed
     * @param methodName executing method name
     * @param methodArguments executing method arguments
     * @param [options] additional options
     * @param [options.onTransactionHash] callback to execute when transaction enters the mempool
     * @param [options.value] amount in Wei amount to be attached to the transaction
     * @return smart-contract method returned value
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
                    ...(options.gas && { gas: Web3Private.stringifyAmount(options.gas) }),
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
     * @description executes method of smart-contract and resolve the promise without waiting for the transaction to be included in the block
     * @param contractAddress address of smart-contract which method is to be executed
     * @param contractAbi abi of smart-contract which method is to be executed
     * @param methodName executing method name
     * @param methodArguments executing method arguments
     * @param [options] additional options
     * @param [options.onTransactionHash] callback to execute when transaction enters the mempool
     * @param [options.value] amount in Wei amount to be attached to the transaction
     * @return smart-contract method returned value
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
     * @description removes approval for token use
     * @param tokenAddress tokenAddress address of the smart-contract corresponding to the token
     * @param spenderAddress wallet or contract address to approve
     */
    public async unApprove(
        tokenAddress: string,
        spenderAddress: string
    ): Promise<TransactionReceipt> {
        return this.approveTokens(tokenAddress, spenderAddress, new BigNumber(0));
    }
}
