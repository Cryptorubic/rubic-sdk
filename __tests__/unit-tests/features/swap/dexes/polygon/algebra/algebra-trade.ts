import { Chain } from '__tests__/utils/chain';
import { mockInjector } from '__tests__/utils/mock-injector';
import { TOKENS as ALL_TOKENS } from '__tests__/utils/tokens';
import { Utils } from '__tests__/unit-tests/features/swap/utils/utils';
import { Injector } from 'src/core/injector/injector';
import BigNumber from 'bignumber.js';
import { BLOCKCHAIN_NAME, Web3Public } from 'src/core';
import { PriceTokenAmount } from 'src/common/tokens/price-token-amount';
import { PriceToken } from 'src/common/tokens/price-token';
import { AlgebraProvider } from '@rsdk-features/instant-trades/dexes/polygon/algebra/algebra-provider';
import fn = jest.fn;

const TOKENS = ALL_TOKENS[BLOCKCHAIN_NAME.POLYGON];

export const algebraPolygonTradeSpec = () => {
    describe('Algebra trade tests.', () => {
        let chain: Chain;
        let algebraProvider: AlgebraProvider;
        let web3Public: Web3Public;
        let userAddress: string;
        let utils: Utils;

        beforeAll(async () => {
            algebraProvider = new AlgebraProvider();
        });

        beforeEach(async () => {
            chain = await Chain.reset(BLOCKCHAIN_NAME.POLYGON);
            const configuration = await chain.getConfiguration();
            await mockInjector(configuration);
            web3Public = Injector.web3PublicService.getWeb3Public(BLOCKCHAIN_NAME.POLYGON);
            userAddress = Injector.web3PrivateService.address;
            utils = new Utils(chain, web3Public);
        });

        test('Swap method must works with NATIVE-ERC20 trade', async () => {
            const maticTokenAmountToSwap = 1;
            const expectedToTokensAmount = '2.037958'; // constant data about tokens rate in 23571568 block
            const maticBalanceBefore = await web3Public.getBalance(userAddress);
            const usdtBalanceBefore = await web3Public.getBalance(userAddress, TOKENS.USDT.address);
            const from = await PriceTokenAmount.createFromToken({
                ...TOKENS.MATIC,
                tokenAmount: new BigNumber(maticTokenAmountToSwap)
            });
            const to = await PriceToken.createFromToken(TOKENS.USDT);

            const trade = await algebraProvider.calculate(from, to, { gasCalculation: 'disabled' });
            const transactionReceipt = await trade.swap();
            const maticBalanceAfter = await web3Public.getBalance(userAddress);
            const usdtBalanceAfter = await web3Public.getBalance(userAddress, TOKENS.USDT.address);
            const transactionFee = await utils.getTransactionFeeByReceipt(transactionReceipt);

            expect(transactionReceipt.status).toBeTruthy();
            expect(
                maticBalanceAfter.isEqualTo(
                    maticBalanceBefore
                        .minus(maticTokenAmountToSwap * 10 ** from.decimals)
                        .minus(transactionFee)
                )
            ).toBeTruthy();
            expect(
                usdtBalanceAfter.isEqualTo(
                    usdtBalanceBefore.plus(
                        new BigNumber(expectedToTokensAmount).multipliedBy(10 ** to.decimals)
                    )
                )
            ).toBeTruthy();

            const trade1 = await algebraProvider.calculate(from, to, {
                gasCalculation: 'disabled'
            });
            expect(trade1.to.weiAmount.isEqualTo(trade.to.weiAmount)).not.toBeTruthy();
        }, 300_000);

        test('Swap method must works with ERC20-NATIVE trade', async () => {
            const usdtTokenAmountToSwap = 1;
            const expectedToTokensAmount = '0.487931209815334164'; // constant data about tokens rate in 23571568 block
            const from = await PriceTokenAmount.createFromToken({
                ...TOKENS.USDT,
                tokenAmount: new BigNumber(usdtTokenAmountToSwap)
            });
            const to = await PriceToken.createFromToken(TOKENS.MATIC);
            await chain.increaseTokensBalance(from, usdtTokenAmountToSwap, { inEtherUnits: true });
            const usdtBalanceBefore = await web3Public.getBalance(userAddress, from.address);
            const maticBalanceBefore = await web3Public.getBalance(userAddress);
            let approveTxHash = '';

            const onApprove = fn(hash => (approveTxHash = hash));
            const trade = await algebraProvider.calculate(from, to, { gasCalculation: 'disabled' });
            const transactionReceipt = await trade.swap({ onApprove });
            const usdtBalanceAfter = await web3Public.getBalance(userAddress, from.address);
            const maticBalanceAfter = await web3Public.getBalance(userAddress);
            const approveTransactionFee = await utils.getTransactionFeeByHash(approveTxHash);
            const transactionFee = await utils.getTransactionFeeByReceipt(transactionReceipt);

            expect(transactionReceipt.status).toBeTruthy();
            expect(
                usdtBalanceAfter.isEqualTo(
                    usdtBalanceBefore.minus(usdtTokenAmountToSwap * 10 ** from.decimals)
                )
            ).toBeTruthy();

            expect(
                maticBalanceAfter.isEqualTo(
                    maticBalanceBefore
                        .plus(new BigNumber(expectedToTokensAmount).multipliedBy(10 ** to.decimals))
                        .minus(approveTransactionFee)
                        .minus(transactionFee)
                )
            ).toBeTruthy();
            expect(onApprove.mock.calls.length).toBe(1);
        }, 300_000);

        test('Swap method must works with ERC20-ERC20 trade', async () => {
            const usdtTokenAmountToSwap = 1;
            const expectedToTokensAmount = '1.000083'; // constant data about tokens rate in 23571568 block
            const from = await PriceTokenAmount.createFromToken({
                ...TOKENS.USDT,
                tokenAmount: new BigNumber(usdtTokenAmountToSwap)
            });
            const to = await PriceToken.createFromToken(TOKENS.USDC);
            await chain.increaseTokensBalance(from, usdtTokenAmountToSwap, { inEtherUnits: true });
            const usdtBalanceBefore = await web3Public.getBalance(userAddress, from.address);
            const usdcBalanceBefore = await web3Public.getBalance(userAddress, to.address);

            const trade = await algebraProvider.calculate(from, to, { gasCalculation: 'disabled' });
            const transactionReceipt = await trade.swap();
            const usdtBalanceAfter = await web3Public.getBalance(userAddress, from.address);
            const usdcBalanceAfter = await web3Public.getBalance(userAddress, to.address);

            expect(transactionReceipt.status).toBeTruthy();
            expect(
                usdtBalanceAfter.isEqualTo(
                    usdtBalanceBefore.minus(usdtTokenAmountToSwap * 10 ** from.decimals)
                )
            ).toBeTruthy();

            expect(
                usdcBalanceAfter.isEqualTo(
                    usdcBalanceBefore.plus(
                        new BigNumber(expectedToTokensAmount).multipliedBy(10 ** to.decimals)
                    )
                )
            ).toBeTruthy();
        }, 300_000);
    });
};
