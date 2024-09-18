import { Address, beginCell, Sender, SenderArguments, storeStateInit } from '@ton/core';
import { TonWeb3Private } from 'src/core/blockchain/web3-private-service/web3-private/ton-web3-private/ton-web3-private';

export class DedustTxSender implements Sender {
    public readonly address: Address;

    constructor(
        walletAddress: string,
        private readonly web3Private: TonWeb3Private,
        private readonly onHash: (hash: string) => void
    ) {
        this.address = Address.parse(walletAddress);
    }

    public async send(args: SenderArguments): Promise<void> {
        const { to, value, body, init } = args;

        const stateInit = init
            ? beginCell().storeWritable(storeStateInit(init)).endCell().toBoc().toString('base64')
            : undefined;

        const message = {
            address: to.toString(),
            amount: value.toString(),
            payload: body?.toBoc().toString('base64'),
            stateInit
        };

        await this.web3Private.sendTransaction({
            messages: [message],
            onTransactionHash: this.onHash
        });
    }
}
