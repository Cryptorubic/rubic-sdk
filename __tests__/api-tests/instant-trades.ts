import { minimalConfiguration } from '../utils/configuration';
import { SDK } from '../../src/core/sdk/sdk';
import { BLOCKCHAIN_NAME } from '../../src/core/blockchain/models/blockchain-name';

export const instantTradesApiSpec = () =>
    describe('Instant trades module tests', () => {
        let sdk: SDK;
        beforeEach(async () => {
            sdk = await SDK.createSDK(minimalConfiguration);
        });

        test('Should create InstantTradesManager instance', async () => {
            expect(typeof sdk.onChainManager).toBe('object');
        });

        test('Should calculate ETH to USDT trade', async () => {
            const fromToken = {
                address: '0x0000000000000000000000000000000000000000',
                blockchain: BLOCKCHAIN_NAME.ETHEREUM
            };
            const toToken = '0xdac17f958d2ee523a2206206994597c13d831ec7';
            const fromAmount = 1;

            const trades = await sdk.onChainManager.calculateTrade(fromToken, fromAmount, toToken);
            expect(Array.isArray(trades)).toBeTruthy();
            expect(trades.length).not.toBe(0);
        }, 400_000);
    });
