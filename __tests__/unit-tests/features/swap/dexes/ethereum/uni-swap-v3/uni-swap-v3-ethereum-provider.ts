import { Chain } from '__tests__/utils/chain';
import { mockInjector } from '__tests__/utils/mock-injector';
import { TOKENS as ALL_TOKENS } from '__tests__/utils/tokens';
import BigNumber from 'bignumber.js';
import { PriceTokenAmount } from 'src/common/tokens-manager/tokens/price-token-amount';
import { PriceToken } from 'src/common/tokens-manager/tokens/price-token';
import { UniSwapV3EthereumTrade } from 'src/features/instant-trades/dexes/ethereum/uni-swap-v3-ethereum/uni-swap-v3-ethereum-trade';
import { UNI_SWAP_V3_ETHEREUM_PROVIDER_CONFIGURATION } from 'src/features/instant-trades/dexes/ethereum/uni-swap-v3-ethereum/constants/provider-configuration';
import { UNI_SWAP_V3_ETHEREUM_ROUTER_CONFIGURATION } from 'src/features/instant-trades/dexes/ethereum/uni-swap-v3-ethereum/constants/router-configuration';
import { UniSwapV3EthereumProvider } from 'src/features/instant-trades/dexes/ethereum/uni-swap-v3-ethereum/uni-swap-v3-ethereum-provider';
import { BLOCKCHAIN_NAME } from '@rsdk-core/blockchain/models/blockchain-name';

const TOKENS = ALL_TOKENS[BLOCKCHAIN_NAME.ETHEREUM];

export const uniswapV3EthProviderSpec = () =>
    describe('UnisSwap V3 Ethereum provider tests', () => {
        let uniswapV3Provider: UniSwapV3EthereumProvider;

        beforeAll(async () => {
            uniswapV3Provider = new UniSwapV3EthereumProvider();
        });

        beforeEach(async () => {
            const chain = await Chain.reset(BLOCKCHAIN_NAME.ETHEREUM);
            const configuration = await chain.getConfiguration();
            await mockInjector(configuration);
        });

        test('Initialize values', () => {
            expect(uniswapV3Provider.blockchain).toBe(BLOCKCHAIN_NAME.ETHEREUM);
            expect(typeof uniswapV3Provider.InstantTradeClass).toBe(typeof UniSwapV3EthereumTrade);
            expect(uniswapV3Provider.providerConfiguration).toBe(
                UNI_SWAP_V3_ETHEREUM_PROVIDER_CONFIGURATION
            );
            expect(uniswapV3Provider.routerConfiguration).toBe(
                UNI_SWAP_V3_ETHEREUM_ROUTER_CONFIGURATION
            );
        });

        test('Must calculate correct NATIVE-ERC20 trade with simple path.', async () => {
            const expectedToTokensAmount = '3177.56875989798300356'; // constant data about tokens rate in 13961175 block
            const from = await PriceTokenAmount.createFromToken({
                ...TOKENS.ETH,
                tokenAmount: new BigNumber(1)
            });
            const to = await PriceToken.createFromToken(TOKENS.DAI);

            const trade = await uniswapV3Provider.calculate(from, to, {
                gasCalculation: 'disabled'
            });

            expect(trade.to.tokenAmount.isEqualTo(expectedToTokensAmount)).toBeTruthy();
            expect(trade.path.length).toBe(2);
            expect(trade.path[0].address).toBe(TOKENS.ETH.address);
            expect(trade.path[1].address).toBe(TOKENS.DAI.address);
        }, 800_000);

        test('Must calculate correct ERC20-NATIVE trade with simple path.', async () => {
            const expectedToTokensAmount = '0.000314923189705958'; // constant data about tokens rate in 13961175 block
            const from = await PriceTokenAmount.createFromToken({
                ...TOKENS.USDT,
                tokenAmount: new BigNumber(1)
            });
            const to = await PriceToken.createFromToken(TOKENS.ETH);

            const trade = await uniswapV3Provider.calculate(from, to, {
                gasCalculation: 'disabled'
            });

            expect(trade.to.tokenAmount.isEqualTo(expectedToTokensAmount)).toBeTruthy();
            expect(trade.path.length).toBe(2);
            expect(trade.path[0].address).toBe(TOKENS.USDT.address);
            expect(trade.path[1].address).toBe(TOKENS.ETH.address);
        }, 400_000);

        test('Must calculate correct ERC20-ERC20 trade with simple path.', async () => {
            const expectedToTokensAmount = '1.02692208070202167'; // constant data about tokens rate in 13961175 block
            const from = await PriceTokenAmount.createFromToken({
                ...TOKENS.USDT,
                tokenAmount: new BigNumber(1)
            });
            const to = await PriceToken.createFromToken(TOKENS.DAI);

            const trade = await uniswapV3Provider.calculate(from, to, {
                gasCalculation: 'disabled'
            });

            expect(trade.to.tokenAmount.isEqualTo(expectedToTokensAmount)).toBeTruthy();
            expect(trade.path.length).toBe(3);
            expect(trade.path[0].address).toBe(TOKENS.USDT.address);
            expect(trade.path[1].address).toBe(TOKENS.WBTC.address);
            expect(trade.path[2].address).toBe(TOKENS.DAI.address);
        }, 400_000);
    });
