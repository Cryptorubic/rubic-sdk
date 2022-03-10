import { Chain } from '__tests__/utils/chain';
import { mockInjector } from '__tests__/utils/mock-injector';
import { TOKENS as ALL_TOKENS } from '__tests__/utils/tokens';
import { PriceTokenAmount } from 'src/core/blockchain/tokens/price-token-amount';
import { PriceToken } from 'src/core/blockchain/tokens/price-token';
import { BLOCKCHAIN_NAME } from 'src/core';
import BigNumber from 'bignumber.js';
import { SushiSwapPolygonProvider } from 'src/features/instant-trades/dexes/polygon/sushi-swap-polygon/sushi-swap-polygon-provider';
import { SushiSwapPolygonTrade } from 'src/features/instant-trades/dexes/polygon/sushi-swap-polygon/sushi-swap-polygon-trade';
import { SUSHI_SWAP_POLYGON_PROVIDER_CONFIGURATION } from 'src/features/instant-trades/dexes/polygon/sushi-swap-polygon/constants';

const TOKENS = ALL_TOKENS[BLOCKCHAIN_NAME.POLYGON];

export const sushiSwapPolygonProviderSpec = () => {
    describe('SushiSwap provider tests', () => {
        let sushiSwapProvider: SushiSwapPolygonProvider;

        beforeEach(async () => {
            sushiSwapProvider = new SushiSwapPolygonProvider();
        });

        beforeEach(async () => {
            const chain = await Chain.reset(BLOCKCHAIN_NAME.POLYGON);
            const configuration = await chain.getConfiguration();
            await mockInjector(configuration);
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
                ...TOKENS.MATIC,
                tokenAmount: new BigNumber(1)
            });
            const to = await PriceToken.createFromToken(TOKENS.USDT);

            const trade = await sushiSwapProvider.calculate(from, to, {
                gasCalculation: 'disabled'
            });

            expect(trade.to.tokenAmount.isEqualTo(expectedToTokensAmount)).toBeTruthy();
            expect(trade.path.length).toBe(3);
            expect(trade.path[0].address).toBe(TOKENS.MATIC.address);
            expect(trade.path[1].address).toBe(TOKENS.USDC.address);
            expect(trade.path[2].address).toBe(TOKENS.USDT.address);
        }, 400_000);

        test('Must calculate correct ERC20-ERC20 trade with simple path without gas calculation.', async () => {
            const expectedToTokensAmount = '159.954588'; // constant data about tokens rate in 13961175 block
            const from = await PriceTokenAmount.createFromToken({
                ...TOKENS.QUICK,
                tokenAmount: new BigNumber(1)
            });
            const to = await PriceToken.createFromToken(TOKENS.USDC);

            const trade = await sushiSwapProvider.calculate(from, to, {
                gasCalculation: 'disabled'
            });

            expect(trade.to.tokenAmount.isEqualTo(expectedToTokensAmount)).toBeTruthy();
            expect(trade.path.length).toBe(2);
            expect(trade.path[0].address).toBe(TOKENS.QUICK.address);
            expect(trade.path[1].address).toBe(TOKENS.USDC.address);
        }, 400_000);

        test('Must calculate correct ERC20-NATIVE trade with simple path without gas calculation.', async () => {
            const expectedToTokensAmount = '77.507430129172371211'; // constant data about tokens rate in 13961175 block
            const from = await PriceTokenAmount.createFromToken({
                ...TOKENS.QUICK,
                tokenAmount: new BigNumber(1)
            });
            const to = await PriceToken.createFromToken(TOKENS.MATIC);

            const trade = await sushiSwapProvider.calculate(from, to, {
                gasCalculation: 'disabled'
            });

            expect(trade.to.tokenAmount.isEqualTo(expectedToTokensAmount)).toBeTruthy();
            expect(trade.path.length).toBe(3);
            expect(trade.path[0].address).toBe(TOKENS.QUICK.address);
            expect(trade.path[1].address).toBe(TOKENS.USDC.address);
            expect(trade.path[2].address).toBe(TOKENS.MATIC.address);
        }, 400_000);

        test('Must calculate correct NATIVE-ERC20 trade with simple path.', async () => {
            const expectedToTokensAmount = '2.050733'; // constant data about tokens rate in 23571568 block
            const from = await PriceTokenAmount.createFromToken({
                ...TOKENS.MATIC,
                tokenAmount: new BigNumber(1)
            });
            const to = await PriceToken.createFromToken(TOKENS.USDT);

            const trade = await sushiSwapProvider.calculate(from, to, {
                gasCalculation: 'calculate'
            });

            expect(trade.to.tokenAmount.isEqualTo(expectedToTokensAmount)).toBeTruthy();
            expect(trade.path.length).toBe(3);
            expect(trade.path[0].address).toBe(TOKENS.MATIC.address);
            expect(trade.path[1].address).toBe(TOKENS.USDC.address);
            expect(trade.path[2].address).toBe(TOKENS.USDT.address);
        }, 400_000);

        test('Must calculate correct ERC20-ERC20 trade with simple path.', async () => {
            const expectedToTokensAmount = '0.003770130241669953'; // constant data about tokens rate in 13961175 block
            const from = await PriceTokenAmount.createFromToken({
                ...TOKENS.USDT,
                tokenAmount: new BigNumber(1)
            });
            const to = await PriceToken.createFromToken(TOKENS.QUICK);

            const trade = await sushiSwapProvider.calculate(from, to, {
                gasCalculation: 'calculate'
            });

            expect(trade.to.tokenAmount.isEqualTo(expectedToTokensAmount)).toBeTruthy();
            expect(trade.path.length).toBe(3);
            expect(trade.path[0].address).toBe(TOKENS.USDT.address);
            expect(trade.path[1].address).toBe(TOKENS.WMATIC.address);
            expect(trade.path[2].address).toBe(TOKENS.QUICK.address);
        }, 400_000);

        test('Must calculate correct ERC20-NATIVE trade with simple path.', async () => {
            const expectedToTokensAmount = '1488.721017828230077849'; // constant data about tokens rate in 13961175 block
            const from = await PriceTokenAmount.createFromToken({
                ...TOKENS.WETH,
                tokenAmount: new BigNumber(1)
            });
            const to = await PriceToken.createFromToken(TOKENS.MATIC);

            const trade = await sushiSwapProvider.calculate(from, to, {
                gasCalculation: 'calculate'
            });

            expect(trade.to.tokenAmount.isEqualTo(expectedToTokensAmount)).toBeTruthy();
            expect(trade.path.length).toBe(2);
            expect(trade.path[0].address).toBe(TOKENS.WETH.address);
            expect(trade.path[1].address).toBe(TOKENS.MATIC.address);
        }, 400_000);

        test('Must calculate correct NATIVE-ERC20 trade with simple path with rubic optimisation.', async () => {
            const expectedToTokensAmount = '2.051291'; // constant data about tokens rate in 13961175 block
            const from = await PriceTokenAmount.createFromToken({
                ...TOKENS.MATIC,
                tokenAmount: new BigNumber(1)
            });
            const to = await PriceToken.createFromToken(TOKENS.USDC);

            const trade = await sushiSwapProvider.calculate(from, to, {
                gasCalculation: 'rubicOptimisation'
            });

            expect(trade.to.tokenAmount.isEqualTo(expectedToTokensAmount)).toBeTruthy();
            expect(trade.path.length).toBe(2);
            expect(trade.path[0].address).toBe(TOKENS.MATIC.address);
            expect(trade.path[1].address).toBe(TOKENS.USDC.address);
        }, 400_000);

        test('Must calculate correct ERC20-ERC20 trade with simple path with rubic optimisation.', async () => {
            const expectedToTokensAmount = '0.003779917038690047'; // constant data about tokens rate in 13961175 block
            const from = await PriceTokenAmount.createFromToken({
                ...TOKENS.USDC,
                tokenAmount: new BigNumber(1)
            });
            const to = await PriceToken.createFromToken(TOKENS.QUICK);

            const trade = await sushiSwapProvider.calculate(from, to, {
                gasCalculation: 'rubicOptimisation'
            });

            expect(trade.to.tokenAmount.isEqualTo(expectedToTokensAmount)).toBeTruthy();
            expect(trade.path.length).toBe(2);
            expect(trade.path[0].address).toBe(TOKENS.USDC.address);
            expect(trade.path[1].address).toBe(TOKENS.QUICK.address);
        }, 400_000);

        test('Must calculate correct ERC20-NATIVE trade with simple path with rubic optimisation.', async () => {
            const expectedToTokensAmount = '0.486266716980642046'; // constant data about tokens rate in 13961175 block
            const from = await PriceTokenAmount.createFromToken({
                ...TOKENS.DAI,
                tokenAmount: new BigNumber(1)
            });
            const to = await PriceToken.createFromToken(TOKENS.MATIC);

            const trade = await sushiSwapProvider.calculate(from, to, {
                gasCalculation: 'rubicOptimisation'
            });

            expect(trade.to.tokenAmount.isEqualTo(expectedToTokensAmount)).toBeTruthy();
            expect(trade.path.length).toBe(3);
            expect(trade.path[0].address).toBe(TOKENS.DAI.address);
            expect(trade.path[1].address.toLowerCase()).toBe(TOKENS.USDT.address.toLowerCase());
            expect(trade.path[2].address).toBe(TOKENS.MATIC.address);
        }, 400_000);
    });
};
