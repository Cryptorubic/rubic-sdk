import { BLOCKCHAIN_NAME, BlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { Web3Private } from 'src/core/blockchain/web3-private-service/web3-private/web3-private';
import { SolanaWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/non-evm-web3-pure/solana-web3-pure';

export class SolanaWeb3Private extends Web3Private {
    protected readonly Web3Pure = SolanaWeb3Pure;

    public async getBlockchainName(): Promise<BlockchainName | undefined> {
        return BLOCKCHAIN_NAME.SOLANA;
    }

    constructor(address: string) {
        super(address);
    }
}
