import { UniSwapV2Provider } from '@features/swap/dexes/ethereum/uni-swap-v2/uni-swap-v2-provider';
import { configuration } from '__tests__/utils/configuration';
import { mockInjector } from '__tests__/utils/mock-injector';
import { TOKENS } from '__tests__/utils/tokens';
import BigNumber from 'bignumber.js';
import { PriceTokenAmount } from 'src/core/blockchain/tokens/price-token-amount';
import { PriceToken } from 'src/core/blockchain/tokens/price-token';

describe('Uniswap V2 provider tests', () => {
    let uniswapV2Provider: UniSwapV2Provider;

    beforeAll(async () => {
        await mockInjector(configuration);
    });

    beforeEach(() => {
        uniswapV2Provider = new UniSwapV2Provider();
    });

    test('Must calculate correct ETH-USDT trade with simple path.', async () => {
        const expectedToTokensAmount = 3173.460947; // constant data about tokens rate in 13961175 block
        const from = await PriceTokenAmount.createFromToken({
            ...TOKENS.ETH,
            tokenAmount: new BigNumber(1)
        });
        const to = await PriceToken.createFromToken(TOKENS.USDT);

        const trade = await uniswapV2Provider.calculate(from, to, { gasCalculation: 'disabled' });

        expect(trade.to.tokenAmount.isEqualTo(expectedToTokensAmount)).toBeTruthy();
        expect(trade.path.length).toBe(2);
        expect(trade.path[0].address).toBe(TOKENS.ETH.address);
        expect(trade.path[1].address).toBe(TOKENS.USDT.address);
    });
});
