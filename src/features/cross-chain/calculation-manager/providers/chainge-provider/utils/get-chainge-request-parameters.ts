import CryptoJS from 'crypto-js';
import { chaingeApiKey } from '../constants/chainge-api-key';
import { chaingeApiSecret } from '../constants/chainge-api-secret';
import { ChaingeRequestHeaders } from '../models/chainge-request-parameters';

export function getChaingeRequestHeaders<T>(requestObject: T): ChaingeRequestHeaders | undefined {
    const headers: ChaingeRequestHeaders = {
        timestamp: new Date().getTime().toString(),
        expireTime: '5000',
        appKey: chaingeApiKey
    } as ChaingeRequestHeaders;

    let strBody = '';
    // eslint-disable-next-line guard-for-in
    for (const key in requestObject) {
        strBody += `${key}=${requestObject[key]}`;
    }

    const keys: string[] = [];
    for (const k in headers) {
        if (k === 'signature') {
            // eslint-disable-next-line no-continue
            continue;
        }
        keys.push(k);
    }

    let strHeader = '';
    for (let i = 0; i < keys.length; i++) {
        if (!keys[i]) {
            return undefined;
        }
        strHeader += keys[i];
        strHeader += '=';
        strHeader += headers[keys[i] || 0] as string;
    }
    const str = strBody + strHeader;
    const hash = CryptoJS.HmacSHA256(str, chaingeApiSecret);
    console.log({ ...headers, signature: hash.toString() });
    headers['signature'] = hash.toString();
    return headers;
}
