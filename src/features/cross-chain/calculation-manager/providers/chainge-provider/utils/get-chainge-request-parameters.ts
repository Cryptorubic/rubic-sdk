import CryptoJS from 'crypto-js';
import { ChaingeRequestHeaders } from '../models/chainge-request-parameters';

export function getChaingeRequestHeaders(
    requestObject: Record<string, string | number>
): ChaingeRequestHeaders | undefined {
    const appSecret = '28Ae9xQdXy6oAieePkVH5i7mKKk8Fk1EjoxyPPaLkeffcExUrai9oiCypLAc1vBE';
    const appKey = '22bhpGsqHj4P8W7HjVpToQAyTMGBPXpCDcJZGYFu34r88PX1x8Yzrq6eSWre4Y23';

    const timestamp = new Date().getTime();
    const expireTime = 15000;

    let strBody = '';
    const keysBody = Object.keys(requestObject).sort();
    for (const key of keysBody) {
        const val = requestObject[key];
        strBody += `${key}=${val}`;
    }

    const param: Record<string, string> = {
        appKey,
        expireTime: expireTime.toString(),
        timestamp: timestamp.toString()
    };

    let strHeader = '';
    let headerKeys = Object.keys(param);
    headerKeys = headerKeys.sort();
    for (const key of headerKeys) {
        if (key !== 'signature') {
            const val = param[key];
            strHeader += `${key}=${val}`;
        }
    }
    const input = strBody + strHeader;
    const sign = CryptoJS.HmacSHA256(input, appSecret).toString();
    return { ...param, signature: sign };
}
