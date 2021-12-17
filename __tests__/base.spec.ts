import { BLOCKCHAIN_NAME } from '@core/blockchain/models/BLOCKCHAIN_NAME';
import { Configuration } from '@core/sdk/models/configuration';
import { SDK } from '@core/sdk/sdk';

export const configuration: Configuration = {
    rpcProviders: {
        [BLOCKCHAIN_NAME.ETHEREUM]: {
            mainRpc: 'https://main-light.eth.linkpool.io'
        },
        [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: {
            mainRpc: 'https://bsc-dataseed.binance.org/'
        }
    }
};

describe('Simple expression tests', () => {
    test('Check literal value', async () => {
        const sdk = await SDK.createSDK(configuration);
        expect(sdk.instantTrades).not.toBe(undefined);
    });
});
