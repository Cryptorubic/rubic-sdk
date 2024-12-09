import BigNumber from 'bignumber.js';
import { RubicSdkError } from 'src/common/errors';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { nativeTokensList } from 'src/common/tokens/constants/native-tokens';
import {
    BLOCKCHAIN_NAME,
    BlockchainName,
    TonBlockchainName
} from 'src/core/blockchain/models/blockchain-name';
import { TonWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/ton-web3-pure/ton-web3-pure';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { FAKE_TON_ADDRESS } from 'src/features/common/constants/fake-wallet-address';
import { RubicStep } from 'src/features/cross-chain/calculation-manager/providers/common/models/rubicStep';

import { OnChainTradeError } from '../../../models/on-chain-trade-error';
import { RequiredOnChainCalculationOptions } from '../../common/models/on-chain-calculation-options';
import { ON_CHAIN_TRADE_TYPE } from '../../common/models/on-chain-trade-type';
import { AggregatorOnChainProvider } from '../../common/on-chain-aggregator/aggregator-on-chain-provider-abstract';
import { GasFeeInfo } from '../../common/on-chain-trade/evm-on-chain-trade/models/gas-fee-info';
import { OnChainTrade } from '../../common/on-chain-trade/on-chain-trade';
import { getMultistepData } from '../common/utils/get-ton-multistep-data';
import { CoffeSwapTrade } from './coffe-swap-on-chain-trade';
import { CoffeeRoutePath } from './models/coffe-swap-api-types';
import { CoffeeSwapApiService } from './services/coffee-swap-api-service';

export class CoffeeSwapProvider extends AggregatorOnChainProvider {
    public tradeType = ON_CHAIN_TRADE_TYPE.COFFEE_SWAP;

    public isSupportedBlockchain(blockchain: BlockchainName): blockchain is TonBlockchainName {
        return blockchain === BLOCKCHAIN_NAME.TON;
    }

    public async calculate(
        from: PriceTokenAmount<TonBlockchainName>,
        toToken: PriceToken<TonBlockchainName>,
        options: RequiredOnChainCalculationOptions
    ): Promise<OnChainTrade | OnChainTradeError> {
        try {
            const quote = await CoffeeSwapApiService.fetchQuote({
                srcToken: from,
                dstToken: toToken,
                walletAddress: options.fromAddress || FAKE_TON_ADDRESS
            });

            const to = new PriceTokenAmount({
                ...toToken.asStruct,
                tokenAmount: new BigNumber(quote.output_amount)
            });
            const routingPath = await this.getRoutingPath(quote.paths);
            const { isChangedSlippage, slippage } = getMultistepData(
                routingPath,
                options.slippageTolerance
            );

            const totalGas = new BigNumber(
                Web3Pure.toWei(quote.recommended_gas, nativeTokensList.TON.decimals)
            );

            return new CoffeSwapTrade(
                {
                    from,
                    to,
                    gasFeeInfo: { totalGas },
                    slippageTolerance: slippage,
                    useProxy: false,
                    withDeflation: options.withDeflation,
                    usedForCrossChain: false,
                    routingPath,
                    txSteps: quote.paths,
                    isChangedSlippage
                },
                options.providerAddress
            );
        } catch (err) {
            return {
                type: this.tradeType,
                error: err
            };
        }
    }

    private async getRoutingPath(txSteps: CoffeeRoutePath[]): Promise<RubicStep[]> {
        const promises = [] as Array<Promise<[PriceTokenAmount, PriceTokenAmount]>>;
        const path = txSteps[0]!;

        const getAddress = (addr: string): string =>
            addr === 'native' ? TonWeb3Pure.nativeTokenAddress : addr;

        let next: CoffeeRoutePath | undefined = path;
        while (!!next) {
            const from = PriceTokenAmount.createToken({
                address: getAddress(next.input_token.address.address),
                blockchain: BLOCKCHAIN_NAME.TON,
                tokenAmount: new BigNumber(next!.swap.input_amount)
            });
            const to = PriceTokenAmount.createToken({
                address: getAddress(next.output_token.address.address),
                blockchain: BLOCKCHAIN_NAME.TON,
                tokenAmount: new BigNumber(next!.swap.output_amount)
            });

            const stepPromises = Promise.all([from, to]);
            promises.push(stepPromises);

            next = next.next?.[0];
        }

        const resolved = await Promise.all(promises);

        const steps = resolved.map(step => ({
            type: 'on-chain',
            provider: this.tradeType,
            path: [step[0], step[1]]
        })) as RubicStep[];

        return steps;
    }

    protected getGasFeeInfo(): Promise<GasFeeInfo | null> {
        throw new RubicSdkError('Method not implemented!');
    }
}
