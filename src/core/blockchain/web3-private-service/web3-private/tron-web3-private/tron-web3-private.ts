import { Web3Private } from 'src/core/blockchain/web3-private-service/web3-private/web3-private';
import { BLOCKCHAIN_NAME, BlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { WalletProviderCore } from 'src/core/sdk/models/wallet-provider';
import { TronWeb } from 'src/core/blockchain/constants/tron/tron-web';
import { TronTransactionOptions } from 'src/core/blockchain/web3-private-service/web3-private/tron-web3-private/models/tron-transaction-options';
import { TronTransactionReceipt } from 'src/core/blockchain/web3-private-service/web3-private/tron-web3-private/models/tron-transaction-receipt';
import { TronWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/tron-web3-pure/tron-web3-pure';
import { AbiItem } from 'web3-utils';

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

    public async executeContractMethod(
        contractAddress: string,
        contractAbi: AbiItem[],
        methodName: string,
        methodArguments: unknown[],
        options: TronTransactionOptions = {}
    ): Promise<TronTransactionReceipt> {
        const contract = await this.tronWeb.contract(contractAbi, contractAddress);

        const receipt = await contract[methodName](...methodArguments).send({
            from: this.address,
            ...(options.callValue && {
                callValue: Web3Private.stringifyAmount(options.callValue)
            }),
            ...(options.feeLimit && {
                feeLimit: Web3Private.stringifyAmount(options.feeLimit)
            })
        });
        if (options.onTransactionHash) {
            options.onTransactionHash(receipt.txid);
        }
        return receipt;
    }
}
