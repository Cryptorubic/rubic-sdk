import { Cell } from '@ton/core';
import { RubicSdkError } from 'src/common/errors';
import { compareAddresses } from 'src/common/utils/blockchain';
import { staticImplements } from 'src/common/utils/decorators';
import { TonApiParseAddressResp, TonApiResp } from 'src/core/blockchain/models/ton/tonapi-types';
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
}
