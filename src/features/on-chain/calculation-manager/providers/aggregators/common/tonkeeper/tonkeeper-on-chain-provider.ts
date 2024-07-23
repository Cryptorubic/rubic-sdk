import { Address } from '@ton/core';
import BigNumber from 'bignumber.js';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { nativeTokensList } from 'src/common/tokens/constants/native-tokens';
import {
    BLOCKCHAIN_NAME,
    BlockchainName,
    TonBlockchainName
} from 'src/core/blockchain/models/blockchain-name';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';

import { OnChainTradeError } from '../../../../models/on-chain-trade-error';
import { RequiredOnChainCalculationOptions } from '../../../common/models/on-chain-calculation-options';
import { AggregatorOnChainProvider } from '../../../common/on-chain-aggregator/aggregator-on-chain-provider-abstract';
import { GasFeeInfo } from '../../../common/on-chain-trade/evm-on-chain-trade/models/gas-fee-info';
import { OnChainTrade } from '../../../common/on-chain-trade/on-chain-trade';
import { TonkeeperCommonQuoteInfo, TonkeeperDexType } from './models/tonkeeper-api-types';
import { TonkeeperOnChainTradeStruct } from './models/tonkeeper-trade-struct';
import { TonkeeperApiService } from './services/tonkeeper-api-service';
import { TonkeeperOnChainTrade } from './tonkeeper-on-chain-trade';

export abstract class TonkeeperOnChainProvider<
    T extends TonkeeperCommonQuoteInfo
> extends AggregatorOnChainProvider {
    protected abstract tonkeeperDexType: TonkeeperDexType;

    public isSupportedBlockchain(blockchain: BlockchainName): blockchain is TonBlockchainName {
        return blockchain === BLOCKCHAIN_NAME.TON;
    }

    public async calculate(
        from: PriceTokenAmount,
        toToken: PriceToken,
        options: RequiredOnChainCalculationOptions
    ): Promise<OnChainTrade | OnChainTradeError> {
        try {
            const [fromRawAddress, toRawAddress] = this.getRawAddresses(from, toToken);
            const { fromWithoutFee, proxyFeeInfo } = await this.handleProxyContract(from, options);

            const bestRoute = await TonkeeperApiService.makeQuoteReq(
                fromRawAddress,
                toRawAddress,
                fromWithoutFee.stringWeiAmount,
                this.tonkeeperDexType
            );
            const to = new PriceTokenAmount({
                ...toToken.asStruct,
                weiAmount: new BigNumber(bestRoute.trades[0].toAmount)
            });

            const tradeStruct = {
                from,
                to,
                slippageTolerance: options.slippageTolerance,
                useProxy: false,
                withDeflation: options.withDeflation,
                gasFeeInfo: null,
                path: this.getRoutePath(from, toToken),
                proxyFeeInfo,
                fromWithoutFee,
                tonkeeperDexType: this.tonkeeperDexType,
                bestRoute,
                rawAddresses: {
                    fromRawAddress,
                    toRawAddress
                }
            } as TonkeeperOnChainTradeStruct<T>;
            tradeStruct.gasFeeInfo = await this.getGasFeeInfo(tradeStruct);

            return new TonkeeperOnChainTrade(tradeStruct, options.providerAddress);
        } catch (err) {
            return {
                type: this.tradeType,
                error: err
            };
        }
    }

    private getRawAddresses(from: PriceTokenAmount, toToken: PriceToken): [string, string] {
        const rawAddresses = [from, toToken].map(token => {
            if (token.address.startsWith('0:') || token.address.startsWith('-1:')) {
                return token.address;
            }
            if (token.isNative) {
                return 'ton';
            }
            return Address.parse(token.address).toRawString();
        }) as [string, string];
        return rawAddresses;
    }

    protected async getGasFeeInfo(
        tradeStruct: TonkeeperOnChainTradeStruct<T>
    ): Promise<GasFeeInfo | null> {
        const nativeTonCoin = nativeTokensList[BLOCKCHAIN_NAME.TON];
        const gasLimitWei = tradeStruct.bestRoute.trades[0].blockchainFee;
        const gasLimitNonWei = Web3Pure.fromWei(gasLimitWei, nativeTonCoin.decimals);
        return {
            gasPrice: new BigNumber(1),
            gasLimit: gasLimitNonWei
        };
    }
}
