import BigNumber from 'bignumber.js';
import { NotSupportedTokensError } from 'src/common/errors';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { compareAddresses } from 'src/common/utils/blockchain';
import {
    BLOCKCHAIN_NAME,
    BlockchainName,
    TonBlockchainName
} from 'src/core/blockchain/models/blockchain-name';
import { RubicStep } from 'src/features/cross-chain/calculation-manager/providers/common/models/rubicStep';

import { OnChainTradeError } from '../../../models/on-chain-trade-error';
import { RequiredOnChainCalculationOptions } from '../../common/models/on-chain-calculation-options';
import { ON_CHAIN_TRADE_TYPE } from '../../common/models/on-chain-trade-type';
import { AggregatorOnChainProvider } from '../../common/on-chain-aggregator/aggregator-on-chain-provider-abstract';
import { GasFeeInfo } from '../../common/on-chain-trade/evm-on-chain-trade/models/gas-fee-info';
import { OnChainTrade } from '../../common/on-chain-trade/on-chain-trade';
import { TonOnChainTradeStruct } from '../../common/on-chain-trade/ton-on-chain-trade/models/ton-on-chian-trade-types';
import { StonfiApiService } from './services/stonfi-api-service';
import { StonfiOnChainTrade } from './stonfi-on-chain-trade';
import { getStonfiGasLimit } from './utils/get-stonfi-gas';

export class StonfiOnChainProvider extends AggregatorOnChainProvider {
    public tradeType = ON_CHAIN_TRADE_TYPE.STONFI;

    public isSupportedBlockchain(blockchain: BlockchainName): blockchain is TonBlockchainName {
        return blockchain === BLOCKCHAIN_NAME.TON;
    }

    public async calculate(
        from: PriceTokenAmount<TonBlockchainName>,
        toToken: PriceToken<TonBlockchainName>,
        options: RequiredOnChainCalculationOptions
    ): Promise<OnChainTrade | OnChainTradeError> {
        try {
            const { amountOutWei } = await StonfiApiService.makeQuoteRequest(
                from,
                toToken,
                options.slippageTolerance
            );
            const to = new PriceTokenAmount({
                ...toToken.asStruct,
                weiAmount: new BigNumber(amountOutWei)
            });

            const routingPath = [
                {
                    type: 'on-chain',
                    provider: this.tradeType,
                    path: [from, to]
                }
            ] as RubicStep[];

            const tradeStruct = {
                from,
                to,
                gasFeeInfo: null,
                slippageTolerance: options.slippageTolerance,
                useProxy: false,
                withDeflation: options.withDeflation,
                usedForCrossChain: false,
                routingPath,
                changedSlippage: false
            } as TonOnChainTradeStruct;
            tradeStruct.gasFeeInfo = await this.getGasFeeInfo(tradeStruct);

            return new StonfiOnChainTrade(tradeStruct, options.providerAddress);
        } catch (err) {
            return {
                type: this.tradeType,
                error: err
            };
        }
    }

    private skipTokenHMSTR(from: PriceTokenAmount, to: PriceToken): void {
        const addressHMSTR = 'EQAJ8uWd7EBqsmpSWaRdf_I-8R8-XHwh3gsNKhy-UrdrPcUo';
        if (
            compareAddresses(from.address, addressHMSTR) ||
            compareAddresses(to.address, addressHMSTR)
        ) {
            throw new NotSupportedTokensError();
        }
    }

    protected getGasFeeInfo(tradeStruct: TonOnChainTradeStruct): Promise<GasFeeInfo | null> {
        return Promise.resolve({
            gasPrice: new BigNumber(1),
            gasLimit: getStonfiGasLimit(tradeStruct.from, tradeStruct.to)
        });
    }
}
