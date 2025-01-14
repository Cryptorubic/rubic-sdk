import BigNumber from 'bignumber.js';
import { RubicSdkError, UserRejectError } from 'src/common/errors';
import { TronInsufficientNativeBalance } from 'src/common/errors/blockchain/tron-insufficient-native-balance';
import { TronTransactionExpired } from 'src/common/errors/blockchain/tron-transaction-expired';
import { parseError } from 'src/common/utils/errors';
import { BLOCKCHAIN_NAME, BlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { TronTransactionOptions } from 'src/core/blockchain/web3-private-service/web3-private/tron-web3-private/models/tron-transaction-options';
import { Web3Private } from 'src/core/blockchain/web3-private-service/web3-private/web3-private';
import { TRC20_CONTRACT_ABI } from 'src/core/blockchain/web3-public-service/web3-public/tron-web3-public/constants/trc-20-contract-abi';
import { TronParameters } from 'src/core/blockchain/web3-pure/typed-web3-pure/tron-web3-pure/models/tron-parameters';
import { TronTransactionConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/tron-web3-pure/models/tron-transaction-config';
import { TronWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/tron-web3-pure/tron-web3-pure';
import { WalletProviderCore } from 'src/core/sdk/models/wallet-provider';
import { TronWeb } from 'tronweb';
import { ContractAbiInterface } from 'tronweb/lib/esm/types';

export class TronWeb3Private extends Web3Private {
    /**
     * Parses web3 error by its code or message.
     * @param err Web3 error to parse.
     */
    private static parseError(err: unknown): RubicSdkError {
        if ((err as string)?.includes?.('Confirmation declined by user')) {
            throw new UserRejectError();
        }

        const message = (err as { message: string })?.message;
        if (message?.includes('balance is not sufficient')) {
            throw new TronInsufficientNativeBalance();
        }
        if (message?.includes('Transaction expired')) {
            throw new TronTransactionExpired();
        }

        return parseError(err);
    }

    protected readonly Web3Pure = TronWeb3Pure;

    private readonly tronWeb: TronWeb;

    constructor(walletProviderCore: WalletProviderCore<TronWeb>) {
        super(walletProviderCore.address);
        this.tronWeb = walletProviderCore.core;

        this.checkAddressCorrect();
    }

    public async getBlockchainName(): Promise<BlockchainName> {
        return BLOCKCHAIN_NAME.TRON;
    }

    public async approveTokens(
        tokenAddress: string,
        spenderAddress: string,
        amount: BigNumber | 'infinity' = 'infinity',
        options: TronTransactionOptions = {}
    ): Promise<string> {
        try {
            const contract = await this.tronWeb.contract(
                TRC20_CONTRACT_ABI as ContractAbiInterface,
                tokenAddress
            );

            const rawValue = amount === 'infinity' ? new BigNumber(2).pow(256).minus(1) : amount;

            const transactionHash = await contract
                .approve(spenderAddress, rawValue.toFixed(0))
                .send({
                    ...(options.feeLimit && {
                        feeLimit: Web3Private.stringifyAmount(options.feeLimit)
                    })
                });
            if (options.onTransactionHash) {
                options.onTransactionHash(transactionHash);
            }
            return transactionHash;
        } catch (err) {
            console.error('Approve execution error: ', err);
            throw TronWeb3Private.parseError(err);
        }
    }

    public async encodeApprove(
        tokenAddress: string,
        spenderAddress: string,
        value: BigNumber | 'infinity',
        options: TronTransactionOptions = {}
    ): Promise<TronTransactionConfig> {
        const rawValue = value === 'infinity' ? new BigNumber(2).pow(256).minus(1) : value;

        return TronWeb3Pure.encodeMethodCall(
            tokenAddress,
            TRC20_CONTRACT_ABI,
            'approve',
            [
                { type: 'address', value: spenderAddress },
                { type: 'uint256', value: rawValue.toFixed(0) }
            ],
            0,
            options.feeLimit
        );
    }

    public async sendTransaction(
        contractAddress: string,
        methodSignature: string,
        parameters: TronParameters,
        options: TronTransactionOptions = {}
    ): Promise<string> {
        try {
            const transaction = await this.tronWeb.transactionBuilder.triggerSmartContract(
                contractAddress,
                methodSignature,
                options,
                parameters,
                this.address
            );
            const signedTransaction = await this.tronWeb.trx.sign(transaction.transaction);

            const receipt = await this.tronWeb.trx.sendRawTransaction(signedTransaction);

            if (options.onTransactionHash) {
                options.onTransactionHash(receipt.transaction.txID);
            }
            return receipt.transaction.txID;
        } catch (err) {
            console.error('Method execution error: ', err);
            throw TronWeb3Private.parseError(err);
        }
    }

    public async trySendTransaction(
        contractAddress: string,
        methodSignature: string,
        parameters: TronParameters,
        options: TronTransactionOptions = {}
    ): Promise<string> {
        try {
            await this.tronWeb.transactionBuilder.estimateEnergy(
                contractAddress,
                methodSignature,
                {},
                parameters,
                this.address
            );
        } catch (err) {
            if (err !== 'this node does not support estimate energy') {
                throw new Error('Tron transaction simulation error');
            }
        }

        return this.sendTransaction(contractAddress, methodSignature, parameters, options);
    }
}
