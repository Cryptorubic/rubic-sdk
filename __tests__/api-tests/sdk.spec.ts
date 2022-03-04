import { SDK } from '@core/sdk/sdk';
import { minimalConfiguration } from '../utils/configuration';

describe('Common SDK tests', () => {
    test('Should create sdk instance', async () => {
        const sdk = await SDK.createSDK(minimalConfiguration);
        expect(typeof sdk).toBe('object');
    });
});
