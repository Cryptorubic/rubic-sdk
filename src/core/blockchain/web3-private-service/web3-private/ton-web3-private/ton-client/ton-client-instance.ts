import { TonClient } from '@ton/ton';

export class TonClientInstance {
    private static tonClient: TonClient;

    public static getInstance(): TonClient {
        if (!this.tonClient) {
            this.tonClient = new TonClient({
                endpoint: 'https://toncenter.com/api/v2/jsonRPC',
                apiKey: '44176ed3735504c6fb1ed3b91715ba5272cdd2bbb304f78d1ae6de6aed47d284'
            });
        }

        return this.tonClient;
    }

    private constructor() {}
}
