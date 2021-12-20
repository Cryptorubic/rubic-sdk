import { BLOCKCHAIN_NAME } from '@core/blockchain/models/BLOCKCHAIN_NAME';
import { SDK } from '@core/sdk/sdk';
import { configuration } from '../utils/configuration';

describe('Instant trades module tests', () => {
    let sdk: SDK;
    beforeEach(async () => {
        sdk = await SDK.createSDK(configuration);
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
        trades.forEach(trade => {
            const { from } = trade.trade;
            const { to } = trade.trade;
            console.log(trade.type);
            console.log(
                'from',
                JSON.stringify({
                    ...from,
                    amount: from.stringWeiAmount,
                    price: from.price.toString()
                })
            );
            console.log(
                'to',
                JSON.stringify({
                    ...to,
                    amount: to.stringWeiAmount,
                    price: to.price.toString()
                })
            );
        });
    });
});
