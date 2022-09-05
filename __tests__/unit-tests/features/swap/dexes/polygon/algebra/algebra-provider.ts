import { Chain } from '__tests__/utils/chain';
import { mockInjector } from '__tests__/utils/mock-injector';
import { TOKENS as ALL_TOKENS } from '__tests__/utils/tokens';
import BigNumber from 'bignumber.js';
import { BLOCKCHAIN_NAME } from 'src/core';
import { PriceTokenAmount } from 'src/common/tokens-manager/tokens/price-token-amount';
import { PriceToken } from 'src/common/tokens-manager/tokens/price-token';
import { AlgebraProvider } from '@rsdk-features/instant-trades/dexes/polygon/algebra/algebra-provider';

const TOKENS = ALL_TOKENS[BLOCKCHAIN_NAME.POLYGON];

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
                ...TOKENS.MATIC,
                tokenAmount: new BigNumber(1)
            });
            const to = await PriceToken.createFromToken(TOKENS.USDT);

            const trade = await algebraProvider.calculate(from, to, { gasCalculation: 'disabled' });

            expect(trade.to.tokenAmount.isEqualTo(expectedToTokensAmount)).toBeTruthy();
            expect(trade.path.length).toBe(3);
            expect(trade.path[0].address).toBe(TOKENS.MATIC.address);
            expect(trade.path[1].address).toBe(TOKENS.USDC.address);
            expect(trade.path[2].address).toBe(TOKENS.USDT.address);
        }, 300_000);

        test('Must calculate correct ERC20-NATIVE trade with simple path.', async () => {
            const expectedToTokensAmount = '0.487931209815334164'; // constant data about tokens rate in 23571568 block
            const from = await PriceTokenAmount.createFromToken({
                ...TOKENS.USDT,
                tokenAmount: new BigNumber(1)
            });
            const to = await PriceToken.createFromToken(TOKENS.MATIC);

            const trade = await algebraProvider.calculate(from, to, { gasCalculation: 'disabled' });

            expect(trade.to.tokenAmount.isEqualTo(expectedToTokensAmount)).toBeTruthy();
            expect(trade.path.length).toBe(3);
            expect(trade.path[0].address).toBe(TOKENS.USDT.address);
            expect(trade.path[1].address).toBe(TOKENS.USDC.address);
            expect(trade.path[2].address).toBe(TOKENS.MATIC.address);
        }, 300_000);

        test('Must calculate correct ERC20-ERC20 trade with simple path.', async () => {
            const expectedToTokensAmount = '1.000083'; // constant data about tokens rate in 23571568 block
            const from = await PriceTokenAmount.createFromToken({
                ...TOKENS.USDT,
                tokenAmount: new BigNumber(1)
            });
            const to = await PriceToken.createFromToken(TOKENS.USDC);

            const trade = await algebraProvider.calculate(from, to, { gasCalculation: 'disabled' });

            expect(trade.to.tokenAmount.isEqualTo(expectedToTokensAmount)).toBeTruthy();
            expect(trade.path.length).toBe(2);
            expect(trade.path[0].address).toBe(TOKENS.USDT.address);
            expect(trade.path[1].address).toBe(TOKENS.USDC.address);
        }, 300_000);
    });
};
