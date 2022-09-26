import { Web3Private } from 'src/core/blockchain/web3-private-service/web3-private/web3-private';
import { BLOCKCHAIN_NAME, BlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { WalletProviderCore } from 'src/core/sdk/models/wallet-provider';
import { TronWeb } from 'src/core/blockchain/constants/tron/tron-web';
import { TronTransactionOptions } from 'src/core/blockchain/web3-private-service/web3-private/tron-web3-private/models/tron-transaction-options';
import { TronWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/tron-web3-pure/tron-web3-pure';
import { AbiItem } from 'web3-utils';
import BigNumber from 'bignumber.js';
import { TRC20_CONTRACT_ABI } from 'src/core/blockchain/web3-public-service/web3-public/tron-web3-public/constants/trc-20-contract-abi';
import { TronTransactionConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/tron-web3-pure/models/tron-transaction-config';
import { TronParameters } from 'src/core/blockchain/web3-pure/typed-web3-pure/tron-web3-pure/models/tron-parameters';
import { RubicSdkError, UserRejectError } from 'src/common/errors';
import { parseError } from 'src/common/utils/errors';
import { TronInsufficientNativeBalance } from 'src/common/errors/blockchain/tron-insufficient-native-balance';

export class TronWeb3Private extends Web3Private {
    /**
     * Parses web3 error by its code or message.
     * @param err Web3 error to parse.
     */
    private static parseError(err: unknown): RubicSdkError {
        if ((err as string)?.includes?.('Confirmation declined by user')) {
            throw new UserRejectError();
        }
        if ((err as { message: string })?.message?.includes('balance is not sufficient')) {
            throw new TronInsufficientNativeBalance();
        }
        return parseError(err);
    }

    protected readonly Web3Pure = TronWeb3Pure;

    private readonly tronWeb: typeof TronWeb;

    constructor(walletProviderCore: WalletProviderCore<typeof TronWeb>) {
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
        value: BigNumber | 'infinity',
        options: TronTransactionOptions = {}
    ): Promise<string> {
        const contract = await this.tronWeb.contract(TRC20_CONTRACT_ABI, tokenAddress);

        let rawValue: BigNumber;
        if (value === 'infinity') {
            rawValue = new BigNumber(2).pow(256).minus(1);
        } else {
            rawValue = value;
        }

        const transactionHash = await contract.approve(spenderAddress, rawValue.toFixed(0)).send({
            ...(options.feeLimit && { feeLimit: Web3Private.stringifyAmount(options.feeLimit) })
        });
        if (options.onTransactionHash) {
            options.onTransactionHash(transactionHash);
        }
        return transactionHash;
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
            [spenderAddress, rawValue.toFixed(0)],
            '0',
            options.feeLimit
        );
    }

    public async executeContractMethod(
        contractAddress: string,
        contractAbi: AbiItem[],
        methodName: string,
        methodArguments: unknown[],
        options: TronTransactionOptions = {}
    ): Promise<string> {
        try {
            const contract = await this.tronWeb.contract(contractAbi, contractAddress);

            const transactionHash = await contract[methodName](...methodArguments).send({
                from: this.address,
                ...(options.callValue && {
                    callValue: Web3Private.stringifyAmount(options.callValue)
                }),
                ...(options.feeLimit && {
                    feeLimit: Web3Private.stringifyAmount(options.feeLimit)
                })
            });
            if (options.onTransactionHash) {
                options.onTransactionHash(transactionHash);
            }
            return transactionHash;
        } catch (err) {
            console.error('Method execution error: ', err);
            throw TronWeb3Private.parseError(err);
        }
    }

    public async triggerContract(
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

            const transactionHash = await this.tronWeb.trx.sendRawTransaction(signedTransaction);
            if (options.onTransactionHash) {
                options.onTransactionHash(transactionHash);
            }
            return transactionHash;
        } catch (err) {
            console.error('Method execution error: ', err);
            throw TronWeb3Private.parseError(err);
        }
    }
}
