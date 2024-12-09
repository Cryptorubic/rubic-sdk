import BigNumber from 'bignumber.js';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { nativeTokensList } from 'src/common/tokens/constants/native-tokens';
import {
    BLOCKCHAIN_NAME,
    BlockchainName,
    TonBlockchainName
} from 'src/core/blockchain/models/blockchain-name';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';

import { OnChainTradeError } from '../../../models/on-chain-trade-error';
import { RequiredOnChainCalculationOptions } from '../../common/models/on-chain-calculation-options';
import { ON_CHAIN_TRADE_TYPE } from '../../common/models/on-chain-trade-type';
import { AggregatorOnChainProvider } from '../../common/on-chain-aggregator/aggregator-on-chain-provider-abstract';
import { GasFeeInfo } from '../../common/on-chain-trade/evm-on-chain-trade/models/gas-fee-info';
import { OnChainTrade } from '../../common/on-chain-trade/on-chain-trade';
import { getMultistepData } from '../common/utils/get-ton-multistep-data';
import { DEDUST_GAS_NON_WEI } from './constants/dedust-consts';
import { DedustOnChainTrade } from './dedust-on-chain-trade';
import { DedustSwapService } from './services/dedust-swap-service';

export class DedustOnChainProvider extends AggregatorOnChainProvider {
    public tradeType = ON_CHAIN_TRADE_TYPE.DEDUST;

    public isSupportedBlockchain(blockchain: BlockchainName): blockchain is TonBlockchainName {
        return blockchain === BLOCKCHAIN_NAME.TON;
    }

    public async calculate(
        from: PriceTokenAmount<TonBlockchainName>,
        toToken: PriceToken<TonBlockchainName>,
        options: RequiredOnChainCalculationOptions
    ): Promise<OnChainTrade | OnChainTradeError> {
        try {
            const dedustSwapService = new DedustSwapService();
            const toStringWeiAmount = await dedustSwapService.calcOutputAmount(from, toToken);

            const to = new PriceTokenAmount({
                ...toToken.asStruct,
                weiAmount: new BigNumber(toStringWeiAmount)
            });

            const routingPath = await dedustSwapService.getRoutePath();
            const { isChangedSlippage, slippage } = getMultistepData(
                routingPath,
                options.slippageTolerance
            );

            return new DedustOnChainTrade(
                {
                    from,
                    to,
                    gasFeeInfo: await this.getGasFeeInfo(),
                    slippageTolerance: slippage,
                    useProxy: false,
                    withDeflation: options.withDeflation,
                    routingPath,
                    usedForCrossChain: false,
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

    protected getGasFeeInfo(): Promise<GasFeeInfo | null> {
        const totalGas = new BigNumber(
            Web3Pure.toWei(DEDUST_GAS_NON_WEI, nativeTokensList.TON.decimals)
        );
        return Promise.resolve({
            totalGas
        });
    }
}
