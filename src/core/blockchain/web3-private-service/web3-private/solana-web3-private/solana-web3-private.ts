import { VersionedTransaction } from '@solana/web3.js';
import { BLOCKCHAIN_NAME, BlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { EvmWeb3Private } from 'src/core/blockchain/web3-private-service/web3-private/evm-web3-private/evm-web3-private';
import { Web3Error } from 'src/core/blockchain/web3-private-service/web3-private/models/web3.error';
import { SolanaTransactionOptions } from 'src/core/blockchain/web3-private-service/web3-private/solana-web3-private/models/solana-transaction-options';
import { Web3Private } from 'src/core/blockchain/web3-private-service/web3-private/web3-private';
import { SolanaWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/non-evm-web3-pure/solana-web3-pure';
import { SolanaWeb3 } from 'src/core/sdk/models/solana-web3';

export class SolanaWeb3Private extends Web3Private {
    protected readonly Web3Pure = SolanaWeb3Pure;

    public async getBlockchainName(): Promise<BlockchainName | undefined> {
        return BLOCKCHAIN_NAME.SOLANA;
    }

    public async sendTransaction(options: SolanaTransactionOptions = {}): Promise<string> {
        try {
            const tx = VersionedTransaction.deserialize(Buffer.from(options.data!.slice(2), 'hex'));
            const { blockhash } = await this.solanaWeb3.request<{ blockhash: string }>({
                method: 'getLatestBlockhash',
                params: {
                    message: ''
                }
            });
            tx.message.recentBlockhash = blockhash;

            const { signature } = await this.solanaWeb3.signAndSendTransaction(tx);
            options.onTransactionHash?.(signature);
            return signature;
        } catch (err) {
            console.error(`Send transaction error. ${err}`);
            throw EvmWeb3Private.parseError(err as Web3Error);
        }
    }

    constructor(private readonly solanaWeb3: SolanaWeb3) {
        super(solanaWeb3.publicKey?.toString() || '');
    }
}
