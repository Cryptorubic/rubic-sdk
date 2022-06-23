import { CrossChainTradeProvider } from '@features/cross-chain/providers/common/cross-chain-trade-provider';
import { CROSS_CHAIN_TRADE_TYPE } from 'src/features';
import { BlockchainName, BlockchainsInfo, PriceToken } from 'src/core';
import { RequiredCrossChainOptions } from '@features/cross-chain/models/cross-chain-options';
import { Injector } from '@core/sdk/injector';
import BigNumber from 'bignumber.js';
import { PriceTokenAmount } from '@core/blockchain/tokens/price-token-amount';
import { WrappedCrossChainTrade } from '@features/cross-chain/providers/common/models/wrapped-cross-chain-trade';
import {
    ViaCrossChainSupportedBlockchain,
    viaCrossChainSupportedBlockchains
} from '@features/cross-chain/providers/via-trade-provider/constants/via-cross-chain-supported-blockchain';
import { ViaCrossChainTrade } from '@features/cross-chain/providers/via-trade-provider/via-cross-chain-trade';
import { DEFAULT_API_KEY } from '@features/cross-chain/providers/via-trade-provider/constants/default-api-key';
import Via from '@viaprotocol/router-sdk/src';

export class ViaCrossChainTradeProvider extends CrossChainTradeProvider {
    public static isSupportedBlockchain(
        blockchain: BlockchainName
    ): blockchain is ViaCrossChainSupportedBlockchain {
        return viaCrossChainSupportedBlockchains.some(
            supportedBlockchain => supportedBlockchain === blockchain
        );
    }

    public readonly type = CROSS_CHAIN_TRADE_TYPE.VIA;

    private readonly via = new Via({
        apiKey: DEFAULT_API_KEY,
        url: 'https://router-api.via.exchange',
        timeout: 30_000
    });

    protected get walletAddress(): string {
        return Injector.web3Private.address;
    }

    public async calculate(
        from: PriceTokenAmount,
        toToken: PriceToken,
        options: RequiredCrossChainOptions
    ): Promise<Omit<WrappedCrossChainTrade, 'tradeType'> | null> {
        const fromBlockchain = from.blockchain;
        const toBlockchain = toToken.blockchain;
        if (
            !ViaCrossChainTradeProvider.isSupportedBlockchain(fromBlockchain) ||
            !ViaCrossChainTradeProvider.isSupportedBlockchain(toBlockchain)
        ) {
            return null;
        }

        try {
            const fromChainId = BlockchainsInfo.getBlockchainByName(fromBlockchain).id;
            const toChainId = BlockchainsInfo.getBlockchainByName(toBlockchain).id;

            const wrappedRoutes = await this.via.getRoutes({
                fromChainId,
                fromTokenAddress: from.address,
                fromAmount: parseInt(from.stringWeiAmount),
                toChainId,
                toTokenAddress: toToken.address,
                fromAddress: options.fromAddress || this.walletAddress,
                multiTx: true
            });
            const route = wrappedRoutes.routes[0];

            if (!route) {
                return null;
            }

            const to = new PriceTokenAmount({
                ...toToken.asStruct,
                weiAmount: new BigNumber(route.toTokenAmount)
            });

            const gasData = options.gasCalculation === 'enabled' ? null : null;

            return {
                trade: new ViaCrossChainTrade(
                    {
                        from,
                        to,
                        route,
                        gasData,
                        priceImpact: 0
                    },
                    options.providerAddress
                )
            };
        } catch (err: unknown) {
            return {
                trade: null,
                error: this.parseError(err)
            };
        }
    }
}
