import { Cell } from '@ton/core';
import { RubicSdkError } from 'src/common/errors';
import { Injector } from 'src/core/injector/injector';

import { TonApiParseAddressResp, TonApiResp } from '../../models/ton/tonapi-types';
import { TONAPI_API_KEY, TONAPI_API_URL } from '../constants/ton-constants';

export class TonUtils {
    /**
     *
     * @param boc Boc returned in connector.sendTransaction
     * @returns boc converter in base 64 string
     */
    public static fromBocToBase64Hash(boc: string): string {
        const inMsgCell = Cell.fromBase64(boc);
        const inMsgHash = inMsgCell.hash();
        const inMsgHashBase64 = inMsgHash.toString('base64');
        return inMsgHashBase64;
    }

    /**
     * @param walletAddress in any format: raw or friendly
     */
    public static async getAllAddressesFormatsOfAccount(
        walletAddress: string
    ): Promise<TonApiParseAddressResp> {
        const res = await Injector.httpClient.get<TonApiResp<TonApiParseAddressResp>>(
            `${TONAPI_API_URL}/address/${walletAddress}/parse`,
            {
                headers: {
                    Authorization: TONAPI_API_KEY
                }
            }
        );
        if ('error' in res) {
            throw new RubicSdkError(
                `[TonUtils] Error in getAllAddressesFormatsOfAccount - ${res.error}`
            );
        }

        return res;
    }
}
