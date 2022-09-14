import { Chain } from '__tests__/utils/chain';
import { mockInjector } from '__tests__/utils/mock-injector';
import { TOKENS as ALL_TOKENS } from '__tests__/utils/tokens';
import BigNumber from 'bignumber.js';
import { PriceTokenAmount } from 'src/common/tokens/price-token-amount';
import { PriceToken } from 'src/common/tokens/price-token';
import { QuickSwapProvider } from 'src/features/instant-trades/dexes/polygon/quick-swap/quick-swap-provider';
import { QuickSwapTrade } from 'src/features/instant-trades/dexes/polygon/quick-swap/quick-swap-trade';
import { QUICK_SWAP_PROVIDER_CONFIGURATION } from 'src/features/instant-trades/dexes/polygon/quick-swap/constants';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

const TOKENS = ALL_TOKENS[BLOCKCHAIN_NAME.POLYGON];

export const quickSwapPolygonProviderSpec = () => {
    describe('QuickSwap provider tests', () => {
        let quickSwapProvider: QuickSwapProvider;

        beforeAll(async () => {
            quickSwapProvider = new QuickSwapProvider();
        });

        beforeEach(async () => {
            const chain = await Chain.reset(BLOCKCHAIN_NAME.POLYGON);
            const configuration = await chain.getConfiguration();
            await mockInjector(configuration);
        });

        test('Initialize values', () => {
            expect(quickSwapProvider.blockchain).toBe(BLOCKCHAIN_NAME.POLYGON);
            expect(typeof quickSwapProvider.InstantTradeClass).toBe(typeof QuickSwapTrade);
            expect(quickSwapProvider.providerSettings).toBe(QUICK_SWAP_PROVIDER_CONFIGURATION);
        }, 400_000);

        test('Must calculate correct NATIVE-ERC20 trade with simple path without gas calculation.', async () => {
            const expectedToTokensAmount = '2.051425'; // constant data about tokens rate in 23571568 block
            const from = await PriceTokenAmount.createFromToken({
                ...TOKENS.MATIC,
                tokenAmount: new BigNumber(1)
            });
            const to = await PriceToken.createFromToken(TOKENS.USDT);

            const trade = await quickSwapProvider.calculate(from, to, {
                gasCalculation: 'disabled'
            });

            expect(trade.to.tokenAmount.isEqualTo(expectedToTokensAmount)).toBeTruthy();
            expect(trade.path.length).toBe(4);
            expect(trade.path[0].address).toBe(TOKENS.MATIC.address);
            expect(trade.path[1].address).toBe(TOKENS.QUICK.address);
            expect(trade.path[2].address).toBe(TOKENS.USDC.address);
            expect(trade.path[3].address).toBe(TOKENS.USDT.address);
        }, 400_000);

        test('Must calculate correct ERC20-ERC20 trade with simple path without gas calculation.', async () => {
            const expectedToTokensAmount = '263.134808'; // constant data about tokens rate in 13961175 block
            const from = await PriceTokenAmount.createFromToken({
                ...TOKENS.QUICK,
                tokenAmount: new BigNumber(1)
            });
            const to = await PriceToken.createFromToken(TOKENS.USDC);

            const trade = await quickSwapProvider.calculate(from, to, {
                gasCalculation: 'disabled'
            });

            expect(trade.to.tokenAmount.isEqualTo(expectedToTokensAmount)).toBeTruthy();
            expect(trade.path.length).toBe(2);
            expect(trade.path[0].address).toBe(TOKENS.QUICK.address);
            expect(trade.path[1].address).toBe(TOKENS.USDC.address);
        }, 400_000);

        test('Must calculate correct ERC20-NATIVE trade with simple path without gas calculation.', async () => {
            const expectedToTokensAmount = '127.513605898661444581'; // constant data about tokens rate in 13961175 block
            const from = await PriceTokenAmount.createFromToken({
                ...TOKENS.QUICK,
                tokenAmount: new BigNumber(1)
            });
            const to = await PriceToken.createFromToken(TOKENS.MATIC);

            const trade = await quickSwapProvider.calculate(from, to, {
                gasCalculation: 'disabled'
            });

            expect(trade.to.tokenAmount.isEqualTo(expectedToTokensAmount)).toBeTruthy();
            expect(trade.path.length).toBe(3);
            expect(trade.path[0].address).toBe(TOKENS.QUICK.address);
            expect(trade.path[1].address).toBe(TOKENS.USDC.address);
            expect(trade.path[2].address).toBe(TOKENS.MATIC.address);
        }, 400_000);

        test('Must calculate correct NATIVE-ERC20 trade with simple path.', async () => {
            const expectedToTokensAmount = '2.051425'; // constant data about tokens rate in 23571568 block
            const from = await PriceTokenAmount.createFromToken({
                ...TOKENS.MATIC,
                tokenAmount: new BigNumber(1)
            });
            const to = await PriceToken.createFromToken(TOKENS.USDT);

            const trade = await quickSwapProvider.calculate(from, to, {
                gasCalculation: 'calculate'
            });

            expect(trade.to.tokenAmount.isEqualTo(expectedToTokensAmount)).toBeTruthy();
            expect(trade.path.length).toBe(4);
            expect(trade.path[0].address).toBe(TOKENS.MATIC.address);
            expect(trade.path[1].address).toBe(TOKENS.QUICK.address);
            expect(trade.path[2].address).toBe(TOKENS.USDC.address);
            expect(trade.path[3].address).toBe(TOKENS.USDT.address);
        }, 400_000);

        test('Must calculate correct ERC20-ERC20 trade with simple path.', async () => {
            const expectedToTokensAmount = '0.003783444491122842'; // constant data about tokens rate in 13961175 block
            const from = await PriceTokenAmount.createFromToken({
                ...TOKENS.USDT,
                tokenAmount: new BigNumber(1)
            });
            const to = await PriceToken.createFromToken(TOKENS.QUICK);

            const trade = await quickSwapProvider.calculate(from, to, {
                gasCalculation: 'calculate'
            });

            expect(trade.to.tokenAmount.isEqualTo(expectedToTokensAmount)).toBeTruthy();
            expect(trade.path.length).toBe(3);
            expect(trade.path[0].address).toBe(TOKENS.USDT.address);
            expect(trade.path[1].address).toBe(TOKENS.WETH.address);
            expect(trade.path[2].address).toBe(TOKENS.QUICK.address);
        }, 400_000);

        test('Must calculate correct ERC20-NATIVE trade with simple path.', async () => {
            const expectedToTokensAmount = '1488.913004591397373038'; // constant data about tokens rate in 13961175 block
            const from = await PriceTokenAmount.createFromToken({
                ...TOKENS.WETH,
                tokenAmount: new BigNumber(1)
            });
            const to = await PriceToken.createFromToken(TOKENS.MATIC);

            const trade = await quickSwapProvider.calculate(from, to, {
                gasCalculation: 'calculate'
            });

            expect(trade.to.tokenAmount.isEqualTo(expectedToTokensAmount)).toBeTruthy();
            expect(trade.path.length).toBe(2);
            expect(trade.path[0].address).toBe(TOKENS.WETH.address);
            expect(trade.path[1].address).toBe(TOKENS.MATIC.address);
        }, 400_000);

        test('Must calculate correct NATIVE-ERC20 trade with simple path with rubic optimisation.', async () => {
            const expectedToTokensAmount = '2.051886'; // constant data about tokens rate in 13961175 block
            const from = await PriceTokenAmount.createFromToken({
                ...TOKENS.MATIC,
                tokenAmount: new BigNumber(1)
            });
            const to = await PriceToken.createFromToken(TOKENS.USDC);

            const trade = await quickSwapProvider.calculate(from, to, {
                gasCalculation: 'rubicOptimisation'
            });

            expect(trade.to.tokenAmount.isEqualTo(expectedToTokensAmount)).toBeTruthy();
            expect(trade.path.length).toBe(3);
            expect(trade.path[0].address).toBe(TOKENS.MATIC.address);
            expect(trade.path[1].address).toBe(TOKENS.QUICK.address);
            expect(trade.path[2].address).toBe(TOKENS.USDC.address);
        }, 400_000);

        test('Must calculate correct ERC20-ERC20 trade with simple path with rubic optimisation.', async () => {
            const expectedToTokensAmount = '0.003788546445518352'; // constant data about tokens rate in 13961175 block
            const from = await PriceTokenAmount.createFromToken({
                ...TOKENS.USDC,
                tokenAmount: new BigNumber(1)
            });
            const to = await PriceToken.createFromToken(TOKENS.QUICK);

            const trade = await quickSwapProvider.calculate(from, to, {
                gasCalculation: 'rubicOptimisation'
            });

            expect(trade.to.tokenAmount.isEqualTo(expectedToTokensAmount)).toBeTruthy();
            expect(trade.path.length).toBe(3);
            expect(trade.path[0].address).toBe(TOKENS.USDC.address);
            expect(trade.path[1].address).toBe(TOKENS.WETH.address);
            expect(trade.path[2].address).toBe(TOKENS.QUICK.address);
        }, 400_000);

        test('Must calculate correct ERC20-NATIVE trade with simple path with rubic optimisation.', async () => {
            const expectedToTokensAmount = '0.485965481122745139'; // constant data about tokens rate in 13961175 block
            const from = await PriceTokenAmount.createFromToken({
                ...TOKENS.DAI,
                tokenAmount: new BigNumber(1)
            });
            const to = await PriceToken.createFromToken(TOKENS.MATIC);

            const trade = await quickSwapProvider.calculate(from, to, {
                gasCalculation: 'rubicOptimisation'
            });

            expect(trade.to.tokenAmount.isEqualTo(expectedToTokensAmount)).toBeTruthy();
            expect(trade.path.length).toBe(2);
            expect(trade.path[0].address).toBe(TOKENS.DAI.address);
            expect(trade.path[1].address).toBe(TOKENS.MATIC.address);
        }, 400_000);
    });
};
