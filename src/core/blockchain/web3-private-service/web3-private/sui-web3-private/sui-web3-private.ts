import { WalletAdapter } from '@suiet/wallet-sdk/dist/wallet-standard/WalletAdapter';
import { UserRejectError } from 'src/common/errors';
import { Any } from 'src/common/utils/types';
import { BLOCKCHAIN_NAME, BlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { EvmWeb3Private } from 'src/core/blockchain/web3-private-service/web3-private/evm-web3-private/evm-web3-private';
import { Web3Error } from 'src/core/blockchain/web3-private-service/web3-private/models/web3.error';
import { SuiTransactionOptions } from 'src/core/blockchain/web3-private-service/web3-private/sui-web3-private/models/sui-transaction-options';
import { Web3Private } from 'src/core/blockchain/web3-private-service/web3-private/web3-private';
import { SuiWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/sui-web3-pure/sui-web3-pure';
import { Injector } from 'src/core/injector/injector';
import { SuiWalletProviderCore } from 'src/core/sdk/models/wallet-provider';

export class SuiWeb3Private extends Web3Private {
    protected readonly Web3Pure = SuiWeb3Pure;

    public async getBlockchainName(): Promise<BlockchainName | undefined> {
        return BLOCKCHAIN_NAME.SUI;
    }

    public async sendTransaction(options: SuiTransactionOptions): Promise<string> {
        try {
            const account = this.core.core.accounts[0]!;
            const signedTx = await (
                this.core.core.features['sui:signTransaction'] as Any as WalletAdapter
            ).signTransaction({
                account: account,
                transaction: options.transactionBlock!,
                chain: 'sui:mainnet'
            });
            const tx = await Injector.web3PublicService
                .getWeb3Public(BLOCKCHAIN_NAME.SUI)
                .executeTxBlock({
                    transactionBlock: signedTx.bytes,
                    signature: signedTx.signature
                });

            options.onTransactionHash?.(tx.digest);

            return tx.digest;
        } catch (err) {
            if (
                err?.message.includes('User rejected the request.') ||
                err?.message.includes('User rejection | (UserRejectionError:-4005)')
            ) {
                throw new UserRejectError();
            }
            console.error(`Send transaction error. ${err}`);
            throw EvmWeb3Private.parseError(err as Web3Error);
        }
    }

    constructor(private readonly core: SuiWalletProviderCore) {
        super(core.address);
    }
}
