import { TonClient } from '@ton/ton';

export class TonClientInstance {
    private static instance: TonClient | null = null;

    private constructor() {}

    public static getInstance(): TonClient {
        if (!this.instance) {
            this.instance = new TonClient({
                endpoint: 'https://x-api.rubic.exchange/toncenter/api/v2/jsonRPC',
                apiKey: 'sndfje3u4b3fnNSDNFUSDNVSunw345842hrnfd3b4nt4'
            });
        }

        return this.instance;
    }
}
