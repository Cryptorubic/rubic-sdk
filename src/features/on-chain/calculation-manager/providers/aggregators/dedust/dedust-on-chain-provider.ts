import { toNano } from '@ton/core';
import BigNumber from 'bignumber.js';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import {
    BLOCKCHAIN_NAME,
    BlockchainName,
    TonBlockchainName
} from 'src/core/blockchain/models/blockchain-name';

import { OnChainTradeError } from '../../../models/on-chain-trade-error';
import { RequiredOnChainCalculationOptions } from '../../common/models/on-chain-calculation-options';
import { ON_CHAIN_TRADE_TYPE } from '../../common/models/on-chain-trade-type';
import { AggregatorOnChainProvider } from '../../common/on-chain-aggregator/aggregator-on-chain-provider-abstract';
import { GasFeeInfo } from '../../common/on-chain-trade/evm-on-chain-trade/models/gas-fee-info';
import { OnChainTrade } from '../../common/on-chain-trade/on-chain-trade';
import { DEDUST_GAS } from './constants/dedust-gas';
import { DedustOnChainTrade } from './dedust-on-chain-trade';
import { DedustSwapService } from './services/dedust-swap-service';

export class DedustOnChainProvider extends AggregatorOnChainProvider {
    public tradeType = ON_CHAIN_TRADE_TYPE.DEDUST;

    private readonly dedustSwapService = new DedustSwapService();

    public isSupportedBlockchain(blockchain: BlockchainName): blockchain is TonBlockchainName {
        return blockchain === BLOCKCHAIN_NAME.TON;
    }

    public async calculate(
        from: PriceTokenAmount<TonBlockchainName>,
        toToken: PriceToken<TonBlockchainName>,
        options: RequiredOnChainCalculationOptions
    ): Promise<OnChainTrade | OnChainTradeError> {
        try {
            const { fromWithoutFee, proxyFeeInfo } = await this.handleProxyContract(from, options);
            const fromAsset = this.dedustSwapService.getTokenAsset(fromWithoutFee);
            const toAsset = this.dedustSwapService.getTokenAsset(toToken);

            const pool = await this.dedustSwapService.getPool(fromAsset, toAsset);
            const { amountOut } = await pool.getEstimatedSwapOut({
                assetIn: fromAsset,
                amountIn: toNano(fromWithoutFee.tokenAmount.toFixed())
            });

            const to = new PriceTokenAmount({
                ...toToken.asStruct,
                weiAmount: new BigNumber(amountOut.toString())
            });

            return new DedustOnChainTrade(
                {
                    from,
                    to,
                    gasFeeInfo: await this.getGasFeeInfo(),
                    fromWithoutFee,
                    proxyFeeInfo,
                    slippageTolerance: options.slippageTolerance,
                    useProxy: false,
                    withDeflation: options.withDeflation,
                    path: this.getRoutePath(from, toToken),
                    usedForCrossChain: false
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

    // private async getPool(fromAsset: Asset, toAsset: Asset): Promise<OpenedContract<Pool>> {
    //     const tonClient = Injector.web3PrivateService.getWeb3Private(CHAIN_TYPE.TON).tonClient;
    //     const factory = tonClient.open(Factory.createFromAddress(MAINNET_FACTORY_ADDR));

    //     const pool = tonClient.open(
    //         Pool.createFromAddress(
    //             await factory.getPoolAddress({
    //                 poolType: PoolType.VOLATILE,
    //                 assets: [fromAsset, toAsset]
    //             })
    //         )
    //     );

    //     if ((await pool.getReadinessStatus()) !== ReadinessStatus.READY) {
    //         throw new Error(`[DedustOnChainProvider_getPool] Pool does not exist.`);
    //     }

    //     return pool;
    // }

    // private getTokenAsset(token: PriceToken): Asset {
    //     if (token.isNative) return Asset.native();

    //     const tonClient = Injector.web3PrivateService.getWeb3Private(CHAIN_TYPE.TON).tonClient;
    //     const parsedAddress = Address.parse(token.address);
    //     const openedTokenContract = tonClient.open(JettonRoot.createFromAddress(parsedAddress));

    //     return Asset.jetton(openedTokenContract.address);
    // }

    protected async getGasFeeInfo(): Promise<GasFeeInfo | null> {
        return {
            gasPrice: new BigNumber(1),
            gasLimit: new BigNumber(DEDUST_GAS)
        };
    }
}
