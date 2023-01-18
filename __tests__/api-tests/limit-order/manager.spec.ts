import { LimitOrderManager } from 'src/features/limit-order/limit-order-manager';
import { SDK } from 'src/core/sdk/sdk';
import { sdkConfiguration } from '__tests__/api-tests/limit-order/constants/sdk-configuration';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { orderParsed, userAddress } from '__tests__/api-tests/limit-order/constants/user-data';
import { Any } from 'src/common/utils/types';
import { RubicSdkError } from 'src/common/errors';

describe('Limit Order Manager integration tests', () => {
    let manager: LimitOrderManager;

    beforeEach(async () => {
        await SDK.createSDK(sdkConfiguration);

        manager = new LimitOrderManager();
        jest.spyOn(manager as Any, 'walletAddress', 'get').mockReturnValue(userAddress);
    });

    test('Get cancel call data', async () => {
        jest.spyOn(manager as Any, 'web3Private', 'get').mockReturnValue({
            web3: manager['getWeb3Public'](BLOCKCHAIN_NAME.POLYGON)['web3']
        });
        const callData = await manager['getCancelCallData'](
            BLOCKCHAIN_NAME.POLYGON,
            orderParsed.hash
        );
        expect(callData).toBe(
            '0x2d9a56f60000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000ca627029cf0000000000000000000000002791bca1f2de4661ed88a30c99a7a9449aa84174000000000000000000000000c2132d05d31c914a87c6611c10748aeb04b58e8f00000000000000000000000011738d36b166c4f18028fe2fa28050fdbd91c4300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000f42400000000000000000000000000000000000000000000000000000000000989680000000a4000000a4000000a4000000a400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000014000000000000000000000000000000000000000000000000000000000000000a4bf15fcd8000000000000000000000000a5eb255ef45dfb48b5d133d08833def69871691d000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000242cc2878d050bde8da00000000000000011738d36b166c4f18028fe2fa28050fdbd91c4300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'
        );
    });

    test('Get error, trying to get cancel call data, due to invalid hash', async () => {
        let err: RubicSdkError | undefined;
        try {
            await manager['getCancelCallData'](
                BLOCKCHAIN_NAME.POLYGON,
                `${orderParsed.hash}_invalid`
            );
        } catch (methodErr) {
            err = methodErr;
        }
        expect(err).toBeDefined();
    });
});
