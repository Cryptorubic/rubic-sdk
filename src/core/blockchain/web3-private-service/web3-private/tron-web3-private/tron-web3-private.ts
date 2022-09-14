import { Web3Private } from 'src/core/blockchain/web3-private-service/web3-private/web3-private';
import { BLOCKCHAIN_NAME, BlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { WalletProviderCore } from 'src/core/sdk/models/wallet-provider';
import { TronWeb } from 'src/core/blockchain/constants/tron/tron-web';
import { UserRejectError } from 'src/common/errors';
import { TronTransactionOptions } from 'src/core/blockchain/web3-private-service/web3-private/tron-web3-private/models/tron-transaction-options';
import { MethodParameters } from 'src/core/blockchain/web3-private-service/web3-private/tron-web3-private/models/method-parameters';
import { TronTransactionReceipt } from 'src/core/blockchain/web3-private-service/web3-private/tron-web3-private/models/tron-transaction-receipt';
import { TronWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/tron-web3-pure';

export class TronWeb3Private extends Web3Private {
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

    public async triggerContractMethod(
        contractAddress: string,
        methodSignature: string,
        methodParameters: MethodParameters,
        options: TronTransactionOptions,
        fromAddress?: string
    ): Promise<TronTransactionReceipt> {
        const transaction = await this.tronWeb.transactionBuilder.triggerSmartContract(
            contractAddress,
            methodSignature,
            options,
            methodParameters,
            fromAddress
        );
        let signedTransaction;
        try {
            signedTransaction = await this.tronWeb.trx.sign(transaction.transaction);
        } catch {
            throw new UserRejectError();
        }
        const receipt: TronTransactionReceipt = await this.tronWeb.trx.sendRawTransaction(
            signedTransaction
        );
        if (options.onTransactionHash) {
            options.onTransactionHash(receipt.txid);
        }
        return receipt;
    }
}
