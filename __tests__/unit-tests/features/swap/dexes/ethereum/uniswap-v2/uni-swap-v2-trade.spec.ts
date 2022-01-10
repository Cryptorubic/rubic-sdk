import { Injector } from '@core/sdk/injector';
import { UniSwapV2Provider } from '@features/swap/dexes/ethereum/uni-swap-v2/uni-swap-v2-provider';
import { Chain } from '__tests__/utils/chain';
import { mockInjector } from '__tests__/utils/mock-injector';
import { TOKENS } from '__tests__/utils/tokens';
import BigNumber from 'bignumber.js';
import { BLOCKCHAIN_NAME, Web3Public } from 'src/core';
import { PriceTokenAmount } from 'src/core/blockchain/tokens/price-token-amount';
import { PriceToken } from 'src/core/blockchain/tokens/price-token';

describe('Uniswap V2 trade tests.', () => {
    let uniswapV2Provider: UniSwapV2Provider;
    let web3Public: Web3Public;
    let userAddress: string;

    beforeAll(async () => {
        uniswapV2Provider = new UniSwapV2Provider();
    });

    beforeEach(async () => {
        const chain = await Chain.reset(BLOCKCHAIN_NAME.ETHEREUM);
        const configuration = await chain.getConfiguration();
        await mockInjector(configuration);
        web3Public = Injector.web3PublicService.getWeb3Public(BLOCKCHAIN_NAME.ETHEREUM);
        userAddress = Injector.web3Private.address;
    });

    test('Swap method must works with NATIVE-ERC20 trade', async () => {
        const ethTokenAmountToSwap = 1;
        const expectedToTokensAmount = 3173.460947; // constant data about tokens rate in 13961175 block
        const ethBalanceBefore = await web3Public.getBalance(userAddress);
        const usdtBalanceBefore = await web3Public.getBalance(userAddress, TOKENS.USDT.address);
        const from = await PriceTokenAmount.createFromToken({
            ...TOKENS.ETH,
            tokenAmount: new BigNumber(ethTokenAmountToSwap)
        });
        const to = await PriceToken.createFromToken(TOKENS.USDT);

        const trade = await uniswapV2Provider.calculate(from, to, { gasCalculation: 'disabled' });
        const transactionReceipt = await trade.swap();
        const ethBalanceAfter = await web3Public.getBalance(userAddress);
        const usdtBalanceAfter = await web3Public.getBalance(userAddress, TOKENS.USDT.address);
        const transaction = (await web3Public.getTransactionByHash(
            transactionReceipt.transactionHash
        ))!;
        const transactionFee = new BigNumber(transactionReceipt.gasUsed).multipliedBy(
            transaction.gasPrice
        );

        expect(transactionReceipt.status).toBeTruthy();
        expect(
            ethBalanceAfter.isEqualTo(
                ethBalanceBefore
                    .minus(ethTokenAmountToSwap * 10 ** TOKENS.ETH.decimals)
                    .minus(transactionFee)
            )
        ).toBeTruthy();
        expect(
            usdtBalanceAfter.isEqualTo(
                usdtBalanceBefore.plus(expectedToTokensAmount * 10 ** TOKENS.USDT.decimals)
            )
        ).toBeTruthy();

        const trade1 = await uniswapV2Provider.calculate(from, to, { gasCalculation: 'disabled' });
        expect(trade1.to.weiAmount.isEqualTo(trade.to.weiAmount)).not.toBeTruthy();
    }, 10_000);

    test('Swap method must works', async () => {
        const ethTokenAmountToSwap = 1;
        const expectedToTokensAmount = 3173.460947; // constant data about tokens rate in 13961175 block
        const ethBalanceBefore = await web3Public.getBalance(userAddress);
        const usdtBalanceBefore = await web3Public.getBalance(userAddress, TOKENS.USDT.address);
        const from = await PriceTokenAmount.createFromToken({
            ...TOKENS.ETH,
            tokenAmount: new BigNumber(ethTokenAmountToSwap)
        });
        const to = await PriceToken.createFromToken(TOKENS.USDT);

        const trade = await uniswapV2Provider.calculate(from, to, { gasCalculation: 'disabled' });
        const transactionReceipt = await trade.swap();
        const ethBalanceAfter = await web3Public.getBalance(userAddress);
        const usdtBalanceAfter = await web3Public.getBalance(userAddress, TOKENS.USDT.address);
        const transaction = (await web3Public.getTransactionByHash(
            transactionReceipt.transactionHash
        ))!;
        const transactionFee = new BigNumber(transactionReceipt.gasUsed).multipliedBy(
            transaction.gasPrice
        );

        expect(transactionReceipt.status).toBeTruthy();
        expect(
            ethBalanceAfter.isEqualTo(
                ethBalanceBefore
                    .minus(ethTokenAmountToSwap * 10 ** TOKENS.ETH.decimals)
                    .minus(transactionFee)
            )
        ).toBeTruthy();
        expect(
            usdtBalanceAfter.isEqualTo(
                usdtBalanceBefore.plus(expectedToTokensAmount * 10 ** TOKENS.USDT.decimals)
            )
        ).toBeTruthy();

        const trade1 = await uniswapV2Provider.calculate(from, to, { gasCalculation: 'disabled' });
        expect(trade1.to.weiAmount.isEqualTo(trade.to.weiAmount)).not.toBeTruthy();
    }, 10_000);
});
