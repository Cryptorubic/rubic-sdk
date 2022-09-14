import { Chain } from '__tests__/utils/chain';
import { mockInjector } from '__tests__/utils/mock-injector';
import { TOKENS as ALL_TOKENS } from '__tests__/utils/tokens';
import BigNumber from 'bignumber.js';
import { PriceTokenAmount } from 'src/common/tokens/price-token-amount';
import { PriceToken } from 'src/common/tokens/price-token';
import { UniSwapV3PolygonProvider } from '@rsdk-features/instant-trades/dexes/polygon/uni-swap-v3-polygon/uni-swap-v3-polygon-provider';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

const TOKENS = ALL_TOKENS[BLOCKCHAIN_NAME.POLYGON];

export const uniswapV3PolygonProviderSpec = () =>
    describe('UnisSwap V3 Polygon provider tests', () => {
        let uniswapV3Provider: UniSwapV3PolygonProvider;

        beforeAll(async () => {
            uniswapV3Provider = new UniSwapV3PolygonProvider();
        });

        beforeEach(async () => {
            const chain = await Chain.reset(BLOCKCHAIN_NAME.POLYGON);
            const configuration = await chain.getConfiguration();
            await mockInjector(configuration);
        });

        test('Must calculate correct NATIVE-ERC20 trade with simple path.', async () => {
            const expectedToTokensAmount = '2.055903'; // constant data about tokens rate in 23571568 block
            const from = await PriceTokenAmount.createFromToken({
                ...TOKENS.MATIC,
                tokenAmount: new BigNumber(1)
            });
            const to = await PriceToken.createFromToken(TOKENS.USDT);

            const trade = await uniswapV3Provider.calculate(from, to, {
                gasCalculation: 'disabled'
            });

            expect(trade.to.tokenAmount.isEqualTo(expectedToTokensAmount)).toBeTruthy();
            expect(trade.path.length).toBe(2);
            expect(trade.path[0].address).toBe(TOKENS.MATIC.address);
            expect(trade.path[1].address).toBe(TOKENS.USDT.address);
        }, 400_000);

        test('Must calculate correct ERC20-NATIVE trade with simple path.', async () => {
            const expectedToTokensAmount = '0.487261802620573316'; // constant data about tokens rate in 23571568 block
            const from = await PriceTokenAmount.createFromToken({
                ...TOKENS.USDT,
                tokenAmount: new BigNumber(1)
            });
            const to = await PriceToken.createFromToken(TOKENS.MATIC);

            const trade = await uniswapV3Provider.calculate(from, to, {
                gasCalculation: 'disabled'
            });

            expect(trade.to.tokenAmount.isEqualTo(expectedToTokensAmount)).toBeTruthy();
            expect(trade.path.length).toBe(3);
            expect(trade.path[0].address).toBe(TOKENS.USDT.address);
            expect(trade.path[1].address).toBe(TOKENS.DAI.address);
            expect(trade.path[2].address).toBe(TOKENS.MATIC.address);
        }, 400_000);

        test('Must calculate correct ERC20-ERC20 trade with simple path.', async () => {
            const expectedToTokensAmount = '0.998641521554865859'; // constant data about tokens rate in 23571568 block
            const from = await PriceTokenAmount.createFromToken({
                ...TOKENS.USDT,
                tokenAmount: new BigNumber(1)
            });
            const to = await PriceToken.createFromToken(TOKENS.DAI);

            const trade = await uniswapV3Provider.calculate(from, to, {
                gasCalculation: 'disabled'
            });

            expect(trade.to.tokenAmount.isEqualTo(expectedToTokensAmount)).toBeTruthy();
            expect(trade.path.length).toBe(2);
            expect(trade.path[0].address).toBe(TOKENS.USDT.address);
            expect(trade.path[1].address).toBe(TOKENS.DAI.address);
        }, 400_000);
    });
