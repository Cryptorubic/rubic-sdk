import {
    AddressLookupTableAccount,
    PublicKey,
    TransactionMessage,
    VersionedTransaction
} from '@solana/web3.js';
import bs58 from 'bs58';
import { base64 } from 'ethers/lib/utils';
import { BLOCKCHAIN_NAME, BlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { EvmWeb3Private } from 'src/core/blockchain/web3-private-service/web3-private/evm-web3-private/evm-web3-private';
import { Web3Error } from 'src/core/blockchain/web3-private-service/web3-private/models/web3.error';
import { SolanaTransactionOptions } from 'src/core/blockchain/web3-private-service/web3-private/solana-web3-private/models/solana-transaction-options';
import { Web3Private } from 'src/core/blockchain/web3-private-service/web3-private/web3-private';
import { SolanaWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/solana-web3-pure/solana-web3-pure';
import { Injector } from 'src/core/injector/injector';
import { SolanaWeb3 } from 'src/core/sdk/models/solana-web3';

export class SolanaWeb3Private extends Web3Private {
    protected readonly Web3Pure = SolanaWeb3Pure;

    public async getBlockchainName(): Promise<BlockchainName | undefined> {
        return BLOCKCHAIN_NAME.SOLANA;
    }

    public async sendTransaction(
        options: SolanaTransactionOptions,
        calculateConsumedParams: boolean = true
    ): Promise<string> {
        try {
            const web3Public = Injector.web3PublicService.getWeb3Public(BLOCKCHAIN_NAME.SOLANA);
            let signature: string = '';

            if (options.sponsorParams) {
                const decodedData = bs58.decode(options.data!);
                const tx = VersionedTransaction.deserialize(decodedData);

                const newTx = await this.getTxWithPayer(tx, options.sponsorParams.feePayer);
                const signedTx = await this.solanaWeb3.signTransaction(newTx);
                const txBase58 = bs58.encode(signedTx.serialize());

                const response = await Injector.rubicApiService.sendToRelay(
                    options.sponsorParams.tradeId,
                    txBase58
                );
                signature = response.signature;
            } else {
                const decodedData = options.data!.startsWith('0x')
                    ? Buffer.from(options.data!.slice(2), 'hex')
                    : base64.decode(options.data!);
                const { blockhash } = await web3Public.getRecentBlockhash();

                const tx = VersionedTransaction.deserialize(decodedData);
                tx.message.recentBlockhash = blockhash;
                if (calculateConsumedParams) {
                    const [computedUnitsPrice, computedUnitsLimit] = await Promise.all([
                        web3Public.getConsumedUnitsPrice(tx),
                        web3Public.getConsumedUnitsLimit(tx)
                    ]);

                    this.updatePriorityFee(tx, computedUnitsPrice, computedUnitsLimit);
                }

                const signedTx = await this.solanaWeb3.signAndSendTransaction(tx);
                signature = signedTx.signature;
            }

            options.onTransactionHash?.(signature);

            return signature;
        } catch (err) {
            console.error(`Send transaction error. ${err}`);
            throw EvmWeb3Private.parseError(err as Web3Error);
        }
    }

    private updatePriorityFee(
        tx: VersionedTransaction,
        computeUnitPrice: number,
        computeUnitLimit?: number
    ) {
        const computeBudgetOfset = 1;
        const computeUnitPriceData = tx.message.compiledInstructions[1]!.data;
        const encodedPrice = this.encodeNumberToArrayLE(computeUnitPrice, 8);
        for (let i = 0; i < encodedPrice.length; i++) {
            computeUnitPriceData[i + computeBudgetOfset] = encodedPrice[i]!;
        }

        if (computeUnitLimit) {
            const computeUnitLimitData = tx.message.compiledInstructions[0]!.data;
            const encodedLimit = this.encodeNumberToArrayLE(computeUnitLimit, 4);
            for (let i = 0; i < encodedLimit.length; i++) {
                computeUnitLimitData[i + computeBudgetOfset] = encodedLimit[i]!;
            }
        }
    }

    private encodeNumberToArrayLE(num: number, arraySize: number): Uint8Array {
        const result = new Uint8Array(arraySize);
        for (let i = 0; i < arraySize; i++) {
            result[i] = Number(num & 0xff);
            num >>= 8;
        }

        return result;
    }

    constructor(private readonly solanaWeb3: SolanaWeb3) {
        super(solanaWeb3.publicKey?.toString() || '');
    }

    private async getTxWithPayer(
        tx: VersionedTransaction,
        feePayer: string
    ): Promise<VersionedTransaction> {
        const adapter = Injector.web3PublicService.getWeb3Public(BLOCKCHAIN_NAME.SOLANA);

        const altAccounts: AddressLookupTableAccount[] = [];
        for (const lookup of tx.message.addressTableLookups) {
            const { value } = await adapter.connection.getAddressLookupTable(lookup.accountKey);
            if (value) {
                altAccounts.push(value);
            } else {
                throw new Error(`ALT not found: ${lookup.accountKey.toBase58()}`);
            }
        }

        const decompiled = TransactionMessage.decompile(tx.message, {
            addressLookupTableAccounts: altAccounts
        });

        const newMsg = new TransactionMessage({
            payerKey: new PublicKey(feePayer),
            recentBlockhash: decompiled.recentBlockhash,
            instructions: decompiled.instructions
        }).compileToV0Message(altAccounts);

        return new VersionedTransaction(newMsg);
    }
}
