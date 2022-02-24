import { Injector } from '@core/sdk/injector';
import { UniSwapV2Provider } from '@features/swap/dexes/ethereum/uni-swap-v2/uni-swap-v2-provider';

import { Chain } from '__tests__/utils/chain';
import { mockInjector } from '__tests__/utils/mock-injector';
import { TOKENS } from '__tests__/utils/tokens';
import BigNumber from 'bignumber.js';
import { BLOCKCHAIN_NAME, Web3Public } from 'src/core';
import { PriceTokenAmount } from 'src/core/blockchain/tokens/price-token-amount';
import { PriceToken } from 'src/core/blockchain/tokens/price-token';
import { TransactionReceipt } from 'web3-eth';
import fn = jest.fn;

export const uniswapV2TradeSpec = () =>
    describe('Uniswap V2 trade tests.', () => {
        let chain: Chain;
        let uniswapV2Provider: UniSwapV2Provider;
        let web3Public: Web3Public;
        let userAddress: string;

        const getTransactionFeeByReceipt = async (
            transactionReceipt: TransactionReceipt
        ): Promise<BigNumber> => {
            const transaction = (await web3Public.getTransactionByHash(
                transactionReceipt.transactionHash
            ))!;
            return new BigNumber(transactionReceipt.gasUsed).multipliedBy(transaction.gasPrice);
        };

        const getTransactionFeeByHash = async (transactionHash: string): Promise<BigNumber> => {
            const transaction = (await web3Public.getTransactionByHash(transactionHash))!;
            const transactionReceipt = (await chain.web3.eth.getTransactionReceipt(
                transactionHash
            ))!;
            return new BigNumber(transactionReceipt.gasUsed).multipliedBy(transaction.gasPrice);
        };

        beforeAll(async () => {
            uniswapV2Provider = new UniSwapV2Provider();
        });

        beforeEach(async () => {
            chain = await Chain.reset(BLOCKCHAIN_NAME.ETHEREUM);
            const configuration = await chain.getConfiguration();
            await mockInjector(configuration);
            web3Public = Injector.web3PublicService.getWeb3Public(BLOCKCHAIN_NAME.ETHEREUM);
            userAddress = Injector.web3Private.address;
        }, 20_000);

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

            const trade = await uniswapV2Provider.calculate(from, to, {
                gasCalculation: 'disabled'
            });
            const transactionReceipt = await trade.swap();
            const ethBalanceAfter = await web3Public.getBalance(userAddress);
            const usdtBalanceAfter = await web3Public.getBalance(userAddress, TOKENS.USDT.address);
            const transactionFee = await getTransactionFeeByReceipt(transactionReceipt);

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

            const trade1 = await uniswapV2Provider.calculate(from, to, {
                gasCalculation: 'disabled'
            });
            expect(trade1.to.weiAmount.isEqualTo(trade.to.weiAmount)).not.toBeTruthy();
        }, 20_000);

        test('Swap method must works with ERC20-NATIVE trade', async () => {
            const rbcTokenAmountToSwap = 1;
            const expectedToTokensAmount = '0.000068319082745321'; // constant data about tokens rate in 13961175 block
            const from = await PriceTokenAmount.createFromToken({
                ...TOKENS.RBC,
                tokenAmount: new BigNumber(rbcTokenAmountToSwap)
            });
            const to = await PriceToken.createFromToken(TOKENS.ETH);
            await chain.increaseTokensBalance(from, rbcTokenAmountToSwap, { inEtherUnits: true });
            const rbcBalanceBefore = await web3Public.getBalance(userAddress, from.address);
            const ethBalanceBefore = await web3Public.getBalance(userAddress);
            let approveTxHash = '';

            const onApprove = fn(hash => (approveTxHash = hash));
            const trade = await uniswapV2Provider.calculate(from, to, {
                gasCalculation: 'disabled'
            });
            const transactionReceipt = await trade.swap({ onApprove });
            const rbcBalanceAfter = await web3Public.getBalance(userAddress, from.address);
            const ethBalanceAfter = await web3Public.getBalance(userAddress);
            const approveTransactionFee = await getTransactionFeeByHash(approveTxHash);
            const transactionFee = await getTransactionFeeByReceipt(transactionReceipt);

            expect(transactionReceipt.status).toBeTruthy();
            expect(
                rbcBalanceAfter.isEqualTo(
                    rbcBalanceBefore.minus(rbcTokenAmountToSwap * 10 ** from.decimals)
                )
            ).toBeTruthy();

            expect(
                ethBalanceAfter.isEqualTo(
                    ethBalanceBefore
                        .plus(new BigNumber(expectedToTokensAmount).multipliedBy(10 ** to.decimals))
                        .minus(approveTransactionFee)
                        .minus(transactionFee)
                )
            ).toBeTruthy();
            expect(onApprove.mock.calls.length).toBe(1);
        }, 20_000);

        test('Swap method must works with ERC20-ERC20 trade', async () => {
            const rbcTokenAmountToSwap = 1;
            const expectedToTokensAmount = '0.216816'; // constant data about tokens rate in 13961175 block
            const from = await PriceTokenAmount.createFromToken({
                ...TOKENS.RBC,
                tokenAmount: new BigNumber(rbcTokenAmountToSwap)
            });
            const to = await PriceToken.createFromToken(TOKENS.USDT);
            await chain.increaseTokensBalance(from, rbcTokenAmountToSwap, { inEtherUnits: true });
            const rbcBalanceBefore = await web3Public.getBalance(userAddress, from.address);
            const usdtBalanceBefore = await web3Public.getBalance(userAddress, to.address);

            const trade = await uniswapV2Provider.calculate(from, to, {
                gasCalculation: 'disabled'
            });
            const transactionReceipt = await trade.swap();
            const rbcBalanceAfter = await web3Public.getBalance(userAddress, from.address);
            const usdtBalanceAfter = await web3Public.getBalance(userAddress, to.address);

            expect(transactionReceipt.status).toBeTruthy();
            expect(
                rbcBalanceAfter.isEqualTo(
                    rbcBalanceBefore.minus(rbcTokenAmountToSwap * 10 ** from.decimals)
                )
            ).toBeTruthy();

            expect(
                usdtBalanceAfter.isEqualTo(
                    usdtBalanceBefore.plus(
                        new BigNumber(expectedToTokensAmount).multipliedBy(10 ** to.decimals)
                    )
                )
            ).toBeTruthy();
        }, 20_000);
    });
