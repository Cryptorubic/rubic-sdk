import { BLOCKCHAIN_NAME } from '@core/blockchain/models/BLOCKCHAIN_NAME';
import { SDK } from '@core/sdk/sdk';
import { minimalConfiguration } from '../utils/configuration';

export const instantTradesApiSpec = () =>
    describe('Instant trades module tests', () => {
        let sdk: SDK;
        beforeEach(async () => {
            sdk = await SDK.createSDK(minimalConfiguration);
        });

        test('Should create InstantTradesManager instance', async () => {
            expect(typeof sdk.instantTrades).toBe('object');
        });

        test('Should calculate ETH to USDT trade', async () => {
            const fromToken = {
                address: '0x0000000000000000000000000000000000000000',
                blockchain: BLOCKCHAIN_NAME.ETHEREUM
            };
            const toToken = '0xdac17f958d2ee523a2206206994597c13d831ec7';
            const fromAmount = 1;

            const trades = await sdk.instantTrades.calculateTrade(fromToken, fromAmount, toToken);
            expect(Array.isArray(trades)).toBeTruthy();
            expect(trades.length).not.toBe(0);
        }, 10000);
    });
