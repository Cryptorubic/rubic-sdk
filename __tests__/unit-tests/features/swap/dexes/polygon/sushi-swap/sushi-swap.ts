import { Chain } from '__tests__/utils/chain';
import { mockInjector } from '__tests__/utils/mock-injector';
import { TOKENS_POLYGON } from '__tests__/utils/tokens';
import { PriceTokenAmount } from 'src/core/blockchain/tokens/price-token-amount';
import { PriceToken } from 'src/core/blockchain/tokens/price-token';
import { SushiSwapPolygonProvider } from 'src/features/swap/dexes/polygon/sushi-swap-polygon/sushi-swap-polygon-provider';
import { BLOCKCHAIN_NAME } from 'src/core';
import { SushiSwapPolygonTrade } from 'src/features/swap/dexes/polygon/sushi-swap-polygon/sushi-swap-polygon-trade';
import { SUSHI_SWAP_POLYGON_PROVIDER_CONFIGURATION } from 'src/features/swap/dexes/polygon/sushi-swap-polygon/constants';
import BigNumber from 'bignumber.js';

export const sushiSwapPolygonProviderSpec = () => {
    describe('SushiSwap provider tests', () => {
        let sushiSwapProvider: SushiSwapPolygonProvider;

        beforeAll(async () => {
            const chain = await Chain.reset(BLOCKCHAIN_NAME.POLYGON);
            const configuration = await chain.getConfiguration();
            await mockInjector(configuration);
        });

        beforeEach(async () => {
            sushiSwapProvider = new SushiSwapPolygonProvider();
        });

        test('Initialize values', () => {
            expect(sushiSwapProvider.blockchain).toBe(BLOCKCHAIN_NAME.POLYGON);
            expect(typeof sushiSwapProvider.InstantTradeClass).toBe(typeof SushiSwapPolygonTrade);
            expect(sushiSwapProvider.providerSettings).toBe(
                SUSHI_SWAP_POLYGON_PROVIDER_CONFIGURATION
            );
        }, 400_000);

        test('Must calculate correct NATIVE-ERC20 trade with simple path without gas calculation.', async () => {
            const expectedToTokensAmount = '2.050733'; // constant data about tokens rate in 23571568 block
            const from = await PriceTokenAmount.createFromToken({
                ...TOKENS_POLYGON.MATIC,
                tokenAmount: new BigNumber(1)
            });
            const to = await PriceToken.createFromToken(TOKENS_POLYGON.USDT);

            const trade = await sushiSwapProvider.calculate(from, to, {
                gasCalculation: 'disabled'
            });

            expect(trade.to.tokenAmount.isEqualTo(expectedToTokensAmount)).toBeTruthy();
            expect(trade.path.length).toBe(3);
            expect(trade.path[0].address).toBe(TOKENS_POLYGON.MATIC.address);
            expect(trade.path[1].address).toBe(TOKENS_POLYGON.USDC.address);
            expect(trade.path[2].address).toBe(TOKENS_POLYGON.USDT.address);
        }, 400_000);

        test('Must calculate correct ERC20-ERC20 trade with simple path without gas calculation.', async () => {
            const expectedToTokensAmount = '159.954588'; // constant data about tokens rate in 13961175 block
            const from = await PriceTokenAmount.createFromToken({
                ...TOKENS_POLYGON.QUICK,
                tokenAmount: new BigNumber(1)
            });
            const to = await PriceToken.createFromToken(TOKENS_POLYGON.USDC);

            const trade = await sushiSwapProvider.calculate(from, to, {
                gasCalculation: 'disabled'
            });

            expect(trade.to.tokenAmount.isEqualTo(expectedToTokensAmount)).toBeTruthy();
            expect(trade.path.length).toBe(2);
            expect(trade.path[0].address).toBe(TOKENS_POLYGON.QUICK.address);
            expect(trade.path[1].address).toBe(TOKENS_POLYGON.USDC.address);
        }, 400_000);

        test('Must calculate correct ERC20-NATIVE trade with simple path without gas calculation.', async () => {
            const expectedToTokensAmount = '77.507430129172371211'; // constant data about tokens rate in 13961175 block
            const from = await PriceTokenAmount.createFromToken({
                ...TOKENS_POLYGON.QUICK,
                tokenAmount: new BigNumber(1)
            });
            const to = await PriceToken.createFromToken(TOKENS_POLYGON.MATIC);

            const trade = await sushiSwapProvider.calculate(from, to, {
                gasCalculation: 'disabled'
            });

            expect(trade.to.tokenAmount.isEqualTo(expectedToTokensAmount)).toBeTruthy();
            expect(trade.path.length).toBe(3);
            expect(trade.path[0].address).toBe(TOKENS_POLYGON.QUICK.address);
            expect(trade.path[1].address).toBe(TOKENS_POLYGON.USDC.address);
            expect(trade.path[2].address).toBe(TOKENS_POLYGON.MATIC.address);
        }, 400_000);

        test('Must calculate correct NATIVE-ERC20 trade with simple path.', async () => {
            const expectedToTokensAmount = '2.050733'; // constant data about tokens rate in 23571568 block
            const from = await PriceTokenAmount.createFromToken({
                ...TOKENS_POLYGON.MATIC,
                tokenAmount: new BigNumber(1)
            });
            const to = await PriceToken.createFromToken(TOKENS_POLYGON.USDT);

            const trade = await sushiSwapProvider.calculate(from, to, {
                gasCalculation: 'calculate'
            });

            expect(trade.to.tokenAmount.isEqualTo(expectedToTokensAmount)).toBeTruthy();
            expect(trade.path.length).toBe(3);
            expect(trade.path[0].address).toBe(TOKENS_POLYGON.MATIC.address);
            expect(trade.path[1].address).toBe(TOKENS_POLYGON.USDC.address);
            expect(trade.path[2].address).toBe(TOKENS_POLYGON.USDT.address);
        }, 400_000);

        test('Must calculate correct ERC20-ERC20 trade with simple path.', async () => {
            const expectedToTokensAmount = '0.003770130241669953'; // constant data about tokens rate in 13961175 block
            const from = await PriceTokenAmount.createFromToken({
                ...TOKENS_POLYGON.USDT,
                tokenAmount: new BigNumber(1)
            });
            const to = await PriceToken.createFromToken(TOKENS_POLYGON.QUICK);

            const trade = await sushiSwapProvider.calculate(from, to, {
                gasCalculation: 'calculate'
            });

            expect(trade.to.tokenAmount.isEqualTo(expectedToTokensAmount)).toBeTruthy();
            expect(trade.path.length).toBe(3);
            expect(trade.path[0].address).toBe(TOKENS_POLYGON.USDT.address);
            expect(trade.path[1].address).toBe(TOKENS_POLYGON.WMATIC.address);
            expect(trade.path[2].address).toBe(TOKENS_POLYGON.QUICK.address);
        }, 400_000);

        test('Must calculate correct ERC20-NATIVE trade with simple path.', async () => {
            const expectedToTokensAmount = '1488.721017828230077849'; // constant data about tokens rate in 13961175 block
            const from = await PriceTokenAmount.createFromToken({
                ...TOKENS_POLYGON.WETH,
                tokenAmount: new BigNumber(1)
            });
            const to = await PriceToken.createFromToken(TOKENS_POLYGON.MATIC);

            const trade = await sushiSwapProvider.calculate(from, to, {
                gasCalculation: 'calculate'
            });

            expect(trade.to.tokenAmount.isEqualTo(expectedToTokensAmount)).toBeTruthy();
            expect(trade.path.length).toBe(2);
            expect(trade.path[0].address).toBe(TOKENS_POLYGON.WETH.address);
            expect(trade.path[1].address).toBe(TOKENS_POLYGON.MATIC.address);
        }, 400_000);

        test('Must calculate correct NATIVE-ERC20 trade with simple path with rubic optimisation.', async () => {
            const expectedToTokensAmount = '2.051291'; // constant data about tokens rate in 13961175 block
            const from = await PriceTokenAmount.createFromToken({
                ...TOKENS_POLYGON.MATIC,
                tokenAmount: new BigNumber(1)
            });
            const to = await PriceToken.createFromToken(TOKENS_POLYGON.USDC);

            const trade = await sushiSwapProvider.calculate(from, to, {
                gasCalculation: 'rubicOptimisation'
            });

            expect(trade.to.tokenAmount.isEqualTo(expectedToTokensAmount)).toBeTruthy();
            expect(trade.path.length).toBe(2);
            expect(trade.path[0].address).toBe(TOKENS_POLYGON.MATIC.address);
            expect(trade.path[1].address).toBe(TOKENS_POLYGON.USDC.address);
        }, 400_000);

        test('Must calculate correct ERC20-ERC20 trade with simple path with rubic optimisation.', async () => {
            const expectedToTokensAmount = '0.003779917038690047'; // constant data about tokens rate in 13961175 block
            const from = await PriceTokenAmount.createFromToken({
                ...TOKENS_POLYGON.USDC,
                tokenAmount: new BigNumber(1)
            });
            const to = await PriceToken.createFromToken(TOKENS_POLYGON.QUICK);

            const trade = await sushiSwapProvider.calculate(from, to, {
                gasCalculation: 'rubicOptimisation'
            });

            expect(trade.to.tokenAmount.isEqualTo(expectedToTokensAmount)).toBeTruthy();
            expect(trade.path.length).toBe(2);
            expect(trade.path[0].address).toBe(TOKENS_POLYGON.USDC.address);
            expect(trade.path[1].address).toBe(TOKENS_POLYGON.QUICK.address);
        }, 400_000);

        test('Must calculate correct ERC20-NATIVE trade with simple path with rubic optimisation.', async () => {
            const expectedToTokensAmount = '0.486266716980642046'; // constant data about tokens rate in 13961175 block
            const from = await PriceTokenAmount.createFromToken({
                ...TOKENS_POLYGON.DAI,
                tokenAmount: new BigNumber(1)
            });
            const to = await PriceToken.createFromToken(TOKENS_POLYGON.MATIC);

            const trade = await sushiSwapProvider.calculate(from, to, {
                gasCalculation: 'rubicOptimisation'
            });

            expect(trade.to.tokenAmount.isEqualTo(expectedToTokensAmount)).toBeTruthy();
            expect(trade.path.length).toBe(3);
            expect(trade.path[0].address).toBe(TOKENS_POLYGON.DAI.address);
            expect(trade.path[1].address.toLowerCase()).toBe(
                TOKENS_POLYGON.USDT.address.toLowerCase()
            );
            expect(trade.path[2].address).toBe(TOKENS_POLYGON.MATIC.address);
        }, 400_000);
    });
};
