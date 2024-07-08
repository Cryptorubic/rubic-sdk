import { TonConnectUI } from '@tonconnect/ui';
import { BLOCKCHAIN_NAME, BlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { TonWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/ton-web3-pure/ton-web3-pure';
import { Injector } from 'src/core/injector/injector';
import { TonWalletProviderCore } from 'src/core/sdk/models/wallet-provider';

import { EvmWeb3Private } from '../evm-web3-private/evm-web3-private';
import { Web3Error } from '../models/web3.error';
import { Web3Private } from '../web3-private';

export class TonWeb3Private extends Web3Private {
    protected readonly Web3Pure = TonWeb3Pure;

    private readonly tonConnectUI: TonConnectUI;

    public async getBlockchainName(): Promise<BlockchainName> {
        return BLOCKCHAIN_NAME.TON;
    }

    public async sendTransaction(options: SolanaTransactionOptions = {}): Promise<string> {
        try {
            const web3Public = Injector.web3PublicService.getWeb3Public(BLOCKCHAIN_NAME.TON);

            const tx = VersionedTransaction.deserialize(Buffer.from(options.data!.slice(2), 'hex'));
            const { blockhash } = await web3Public.getRecentBlockhash();
            tx.message.recentBlockhash = blockhash;

            const { signature } = await this.tonConnectUI.sendTransaction(tx);
            options.onTransactionHash?.(signature);
            return signature;
        } catch (err) {
            console.error(`Send transaction error. ${err}`);
            throw EvmWeb3Private.parseError(err as Web3Error);
        }
    }

    constructor(private readonly tonProviderCore: TonWalletProviderCore) {
        super(tonProviderCore.address);
        this.tonConnectUI = tonProviderCore.core;
    }
}
