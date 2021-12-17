import { SDK } from '@core/sdk/sdk';
import { configuration } from '../utils/configuration';

describe('Common SDK tests', () => {
    test('Should create sdk instance', async () => {
        const sdk = await SDK.createSDK(configuration);
        expect(typeof sdk).toBe('object');
    });
});
