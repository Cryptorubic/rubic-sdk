import { Chain } from '__tests__/utils/chain';
import { mockInjector } from '__tests__/utils/mock-injector';
import { TOKENS_POLYGON } from '__tests__/utils/tokens';
import BigNumber from 'bignumber.js';
import { BLOCKCHAIN_NAME } from 'src/core';
import { PriceTokenAmount } from 'src/core/blockchain/tokens/price-token-amount';
import { PriceToken } from 'src/core/blockchain/tokens/price-token';
import { AlgebraProvider } from '@features/swap/dexes/polygon/algebra/algebra-provider';

export const algebraPolygonProviderSpec = () => {
    describe('Algebra provider tests', () => {
        let algebraProvider: AlgebraProvider;

        beforeAll(async () => {
            algebraProvider = new AlgebraProvider();
        });

        beforeEach(async () => {
            const chain = await Chain.reset(BLOCKCHAIN_NAME.POLYGON);
            const configuration = await chain.getConfiguration();
            await mockInjector(configuration);
        });

        test('Must calculate correct NATIVE-ERC20 trade with simple path.', async () => {
            const expectedToTokensAmount = '2.037958'; // constant data about tokens rate in 23571568 block
            const from = await PriceTokenAmount.createFromToken({
                ...TOKENS_POLYGON.MATIC,
                tokenAmount: new BigNumber(1)
            });
            const to = await PriceToken.createFromToken(TOKENS_POLYGON.USDT);

            const trade = await algebraProvider.calculate(from, to, { gasCalculation: 'disabled' });

            expect(trade.to.tokenAmount.isEqualTo(expectedToTokensAmount)).toBeTruthy();
            expect(trade.path.length).toBe(3);
            expect(trade.path[0].address).toBe(TOKENS_POLYGON.MATIC.address);
            expect(trade.path[1].address).toBe(TOKENS_POLYGON.USDC.address);
            expect(trade.path[2].address).toBe(TOKENS_POLYGON.USDT.address);
        }, 300_000);

        test('Must calculate correct ERC20-NATIVE trade with simple path.', async () => {
            const expectedToTokensAmount = '0.487931209815334164'; // constant data about tokens rate in 23571568 block
            const from = await PriceTokenAmount.createFromToken({
                ...TOKENS_POLYGON.USDT,
                tokenAmount: new BigNumber(1)
            });
            const to = await PriceToken.createFromToken(TOKENS_POLYGON.MATIC);

            const trade = await algebraProvider.calculate(from, to, { gasCalculation: 'disabled' });

            expect(trade.to.tokenAmount.isEqualTo(expectedToTokensAmount)).toBeTruthy();
            expect(trade.path.length).toBe(3);
            expect(trade.path[0].address).toBe(TOKENS_POLYGON.USDT.address);
            expect(trade.path[1].address).toBe(TOKENS_POLYGON.USDC.address);
            expect(trade.path[2].address).toBe(TOKENS_POLYGON.MATIC.address);
        }, 300_000);

        test('Must calculate correct ERC20-ERC20 trade with simple path.', async () => {
            const expectedToTokensAmount = '1.000083'; // constant data about tokens rate in 23571568 block
            const from = await PriceTokenAmount.createFromToken({
                ...TOKENS_POLYGON.USDT,
                tokenAmount: new BigNumber(1)
            });
            const to = await PriceToken.createFromToken(TOKENS_POLYGON.USDC);

            const trade = await algebraProvider.calculate(from, to, { gasCalculation: 'disabled' });

            expect(trade.to.tokenAmount.isEqualTo(expectedToTokensAmount)).toBeTruthy();
            expect(trade.path.length).toBe(2);
            expect(trade.path[0].address).toBe(TOKENS_POLYGON.USDT.address);
            expect(trade.path[1].address).toBe(TOKENS_POLYGON.USDC.address);
        }, 300_000);
    });
};
