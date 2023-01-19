import { SDK } from 'src/core/sdk/sdk';
import { freeRpc } from '__tests__/utils/constants/free-rpc';
import { Configuration } from 'src/core/sdk/models/configuration';

describe('Common SDK tests', () => {
    const minimalConfig: Configuration = { rpcProviders: freeRpc };

    test('Should create sdk instance', async () => {
        const sdk = await SDK.createSDK(minimalConfig);
        expect(typeof sdk).toBe('object');
    });
});
