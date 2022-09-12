import { Chain } from '__tests__/utils/chain';
import { mockInjector } from '__tests__/utils/mock-injector';
import { TOKENS as ALL_TOKENS } from '__tests__/utils/tokens';
import BigNumber from 'bignumber.js';
import { PriceTokenAmount } from 'src/common/tokens/price-token-amount';
import { PriceToken } from 'src/common/tokens/price-token';
import { UniSwapV2EthereumProvider } from 'src/features/instant-trades/dexes/ethereum/uni-swap-v2-ethereum/uni-swap-v2-ethereum-provider';
import { UniSwapV2EthereumTrade } from 'src/features/instant-trades/dexes/ethereum/uni-swap-v2-ethereum/uni-swap-v2-ethereum-trade';
import { UNISWAP_V2_ETHEREUM_PROVIDER_CONFIGURATION } from 'src/features/instant-trades/dexes/ethereum/uni-swap-v2-ethereum/constants';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

const TOKENS = ALL_TOKENS[BLOCKCHAIN_NAME.ETHEREUM];

export const uniswapV2ProviderSpec = () =>
    describe('Uniswap V2 provider tests', () => {
        let uniswapV2Provider: UniSwapV2EthereumProvider;

        beforeAll(async () => {
            uniswapV2Provider = new UniSwapV2EthereumProvider();
        });

        beforeEach(async () => {
            const chain = await Chain.reset(BLOCKCHAIN_NAME.ETHEREUM);
            const configuration = await chain.getConfiguration();
            await mockInjector(configuration);
        });

        test('Initialize values', () => {
            expect(uniswapV2Provider.blockchain).toBe(BLOCKCHAIN_NAME.ETHEREUM);
            expect(typeof uniswapV2Provider.InstantTradeClass).toBe(typeof UniSwapV2EthereumTrade);
            expect(uniswapV2Provider.providerSettings).toBe(
                UNISWAP_V2_ETHEREUM_PROVIDER_CONFIGURATION
            );
        });

        test('Must calculate correct NATIVE-ERC20 trade with simple path.', async () => {
            const expectedToTokensAmount = 3173.460947; // constant data about tokens rate in 13961175 block
            const from = await PriceTokenAmount.createFromToken({
                ...TOKENS.ETH,
                tokenAmount: new BigNumber(1)
            });
            const to = await PriceToken.createFromToken(TOKENS.USDT);

            const trade = await uniswapV2Provider.calculate(from, to, {
                gasCalculation: 'disabled'
            });

            expect(trade.to.tokenAmount.isEqualTo(expectedToTokensAmount)).toBeTruthy();
            expect(trade.path.length).toBe(2);
            expect(trade.path[0].address).toBe(TOKENS.ETH.address);
            expect(trade.path[1].address).toBe(TOKENS.USDT.address);
        }, 400_000);

        test('Must calculate correct ERC20-NATIVE trade with simple path.', async () => {
            const expectedToTokensAmount = '0.000313213011396446'; // constant data about tokens rate in 13961175 block
            const from = await PriceTokenAmount.createFromToken({
                ...TOKENS.USDT,
                tokenAmount: new BigNumber(1)
            });
            const to = await PriceToken.createFromToken(TOKENS.ETH);

            const trade = await uniswapV2Provider.calculate(from, to, {
                gasCalculation: 'disabled'
            });

            expect(trade.to.tokenAmount.isEqualTo(expectedToTokensAmount)).toBeTruthy();
            expect(trade.path.length).toBe(2);
            expect(trade.path[0].address).toBe(TOKENS.USDT.address);
            expect(trade.path[1].address).toBe(TOKENS.ETH.address);
        }, 400_000);

        test('Must calculate correct ERC20-ERC20 trade with simple path.', async () => {
            const expectedToTokensAmount = '4.557092512974888195'; // constant data about tokens rate in 13961175 block
            const from = await PriceTokenAmount.createFromToken({
                ...TOKENS.USDT,
                tokenAmount: new BigNumber(1)
            });
            const to = await PriceToken.createFromToken(TOKENS.RBC);

            const trade = await uniswapV2Provider.calculate(from, to, {
                gasCalculation: 'disabled'
            });

            expect(trade.to.tokenAmount.isEqualTo(expectedToTokensAmount)).toBeTruthy();
            expect(trade.path.length).toBe(3);
            expect(trade.path[0].address).toBe(TOKENS.USDT.address);
            expect(trade.path[1].address).toBe(TOKENS.WETH.address);
            expect(trade.path[2].address).toBe(TOKENS.RBC.address);
        }, 400_000);
    });
