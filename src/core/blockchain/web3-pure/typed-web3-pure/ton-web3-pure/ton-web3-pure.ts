import { Address, beginCell, Cell } from '@ton/core';
import { keccak256 } from 'ethers/lib/utils';
import { RubicSdkError } from 'src/common/errors';
import { compareAddresses } from 'src/common/utils/blockchain';
import { staticImplements } from 'src/common/utils/decorators';
import { TonApiParseAddressResp, TonApiResp } from 'src/core/blockchain/models/ton/tonapi-types';
import { TonClientInstance } from 'src/core/blockchain/web3-private-service/web3-private/ton-web3-private/ton-client/ton-client';
import { TypedWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/typed-web3-pure';
import { Injector } from 'src/core/injector/injector';

@staticImplements<TypedWeb3Pure>()
export class TonWeb3Pure {
    private static readonly xApiUrl = 'https://x-api.rubic.exchange/tonapi';

    private static readonly xApiKey = 'sndfje3u4b3fnNSDNFUSDNVSunw345842hrnfd3b4nt4';

    public static readonly EMPTY_ADDRESS = '0x0000000000000000000000000000000000000000';

    public static get nativeTokenAddress(): string {
        return TonWeb3Pure.EMPTY_ADDRESS;
    }

    public static isNativeAddress(address: string): boolean {
        return compareAddresses(address, TonWeb3Pure.nativeTokenAddress);
    }

    public static isEmptyAddress(address?: string): boolean {
        return address === TonWeb3Pure.EMPTY_ADDRESS;
    }

    public static async isAddressCorrect(address: string): Promise<boolean> {
        return /^(EQ|UQ)[0-9a-zA-Z-_!]{46}$/.test(address);
    }

    /**
     *
     * @param boc Boc returned in connector.sendTransaction
     * @returns boc converter in base 64 string
     */
    public static fromBocToBase64Hash(boc: string): string {
        const inMsgCell = Cell.fromBase64(boc);
        const inMsgHash = inMsgCell.hash();
        const inMsgHashBase64 = inMsgHash.toString('base64');
        const inMsgHashBase64Url = inMsgHashBase64.replace(/\+/g, '-').replace(/\//g, '_');

        return inMsgHashBase64Url;
    }

    public static fromBase64ToCell(tonPayload: string): Cell {
        return Cell.fromBoc(Buffer.from(tonPayload, 'base64'))[0]!;
    }

    // public static async fromBocToCell(boc: string): Promise<Cell> {
    //     //  Cell.fromBoc(Buffer.from(boc))
    //     const client = TonClientInstance.getInstance();
    //     const transactions = await client.getTransactions(
    //         Address.parse('UQATSC4TXAqjgLswuSEDVTIGmPG_kNnUTDhrTiIILVmymoQA'),
    //         { limit: 5 }
    //     );

    //     for (const tx of transactions) {
    //         const inMsg = tx.inMessage;

    //         if (inMsg?.info.type === 'internal') {
    //             const sender = inMsg?.info.src;
    //             const value = inMsg?.info.value.coins;

    //             const originalBody = inMsg?.body.beginParse();
    //             let body = originalBody.clone();
    //             if (body.remainingBits < 32) {
    //                 // if body doesn't have opcode: it's a simple message without comment
    //                 console.log(`Simple transfer from ${sender} with value ${fromNano(value)} TON`);
    //             } else {
    //                 const op = body.loadUint(32);
    //                 if (op === 0) {
    //                     // if opcode is 0: it's a simple message with comment
    //                     const comment = body.loadStringTail();
    //                     console.log(
    //                         `Simple transfer from ${sender} with value ${fromNano(
    //                             value
    //                         )} TON and comment: "${comment}"`
    //                     );
    //                 } else if (op === 0x7362d09c) {
    //                     // if opcode is 0x7362d09c: it's a Jetton transfer notification

    //                     body.skip(64); // skip query_id
    //                     const jettonAmount = body.loadCoins();
    //                     const jettonSender = body.loadAddressAny();
    //                     const originalForwardPayload = body.loadBit()
    //                         ? body.loadRef().beginParse()
    //                         : body;
    //                     let forwardPayload = originalForwardPayload.clone();

    //                     // IMPORTANT: we have to verify the source of this message because it can be faked
    //                     const runStack = (await client.runMethod(sender, 'get_wallet_data')).stack;
    //                     runStack.skip(2);
    //                     const jettonMaster = runStack.readAddress();
    //                     const jettonWallet = (
    //                         await client.runMethod(jettonMaster, 'get_wallet_address', [
    //                             {
    //                                 type: 'slice',
    //                                 cell: beginCell().storeAddress(myAddress).endCell()
    //                             }
    //                         ])
    //                     ).stack.readAddress();
    //                     if (!jettonWallet.equals(sender)) {
    //                         // if sender is not our real JettonWallet: this message was faked
    //                         console.log(`FAKE Jetton transfer`);
    //                         continue;
    //                     }

    //                     if (forwardPayload.remainingBits < 32) {
    //                         // if forward payload doesn't have opcode: it's a simple Jetton transfer
    //                         console.log(
    //                             `Jetton transfer from ${jettonSender} with value ${fromNano(
    //                                 jettonAmount
    //                             )} Jetton`
    //                         );
    //                     } else {
    //                         const forwardOp = forwardPayload.loadUint(32);
    //                         if (forwardOp == 0) {
    //                             // if forward payload opcode is 0: it's a simple Jetton transfer with comment
    //                             const comment = forwardPayload.loadStringTail();
    //                             console.log(
    //                                 `Jetton transfer from ${jettonSender} with value ${fromNano(
    //                                     jettonAmount
    //                                 )} Jetton and comment: "${comment}"`
    //                             );
    //                         } else {
    //                             // if forward payload opcode is something else: it's some message with arbitrary structure
    //                             // you may parse it manually if you know other opcodes or just print it as hex
    //                             console.log(
    //                                 `Jetton transfer with unknown payload structure from ${jettonSender} with value ${fromNano(
    //                                     jettonAmount
    //                                 )} Jetton and payload: ${originalForwardPayload}`
    //                             );
    //                         }

    //                         console.log(`Jetton Master: ${jettonMaster}`);
    //                     }
    //                 } else {
    //                     console.log(
    //                         `Message with unknown structure from ${sender} with value ${fromNano(
    //                             value
    //                         )} TON and body: ${originalBody}`
    //                     );
    //                 }
    //             }
    //         }
    //     }
    // }

    /**
     * @param walletAddress in any format: raw or friendly
     */
    public static async getAllFormatsOfAddress(
        walletAddress: string
    ): Promise<TonApiParseAddressResp> {
        const res = await Injector.httpClient.get<TonApiResp<TonApiParseAddressResp>>(
            `${this.xApiUrl}/v2/address/${walletAddress}/parse`,
            {
                headers: {
                    apikey: this.xApiKey
                }
            }
        );
        if ('error' in res) {
            throw new RubicSdkError(`[TonWeb3Pure] Error in getAllFormatsOfAddress - ${res.error}`);
        }

        return res;
    }

    public static addressToHex(friendlyTonAddress: string): string {
        const rawAddress = Address.parse(friendlyTonAddress).toRawString();
        const addressBuffer = Buffer.from(rawAddress.slice(2), 'hex');
        const addressHashed = keccak256(addressBuffer);
        const hexAddress = '0x' + addressHashed.slice(-40);

        return hexAddress;
    }

    public static async getWalletAddress(
        address: Address,
        contractAddress: Address
    ): Promise<Address> {
        const addressResult = await TonClientInstance.getInstance().runMethod(
            contractAddress,
            'get_wallet_address',
            [{ type: 'slice', cell: beginCell().storeAddress(address).endCell() }]
        );
        return addressResult.stack.readAddress();
    }
}
