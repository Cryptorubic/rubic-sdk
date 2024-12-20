import BigNumber from 'bignumber.js';
import { PriceToken } from 'src/common/tokens';
import { BLOCKCHAIN_NAME, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { OnChainProxyFeeInfo } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-proxy-fee-info';
import { Exact } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/models/exact';
import { AerodromePathFactory } from 'src/features/on-chain/calculation-manager/providers/dexes/base/aerodrome/aerodrome-path-factory';
import { AerodromeTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/base/aerodrome/aerodrome-trade';
import { AERODROME_PROVIDER_CONFIGURATION } from 'src/features/on-chain/calculation-manager/providers/dexes/base/aerodrome/constants';
import { UniswapCalculatedInfo } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/models/uniswap-calculated-info';
import { UniswapV2CalculationOptions } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/models/uniswap-v2-calculation-options';
import { UniswapV2AbstractProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-provider';

export class AerodromeProvider extends UniswapV2AbstractProvider<AerodromeTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.BASE;

    public readonly UniswapV2TradeClass = AerodromeTrade;

    public readonly providerSettings = AERODROME_PROVIDER_CONFIGURATION;

    protected async getAmountAndPath(
        from: PriceToken<EvmBlockchainName>,
        to: PriceToken<EvmBlockchainName>,
        weiAmount: BigNumber,
        exact: Exact,
        options: UniswapV2CalculationOptions,
        proxyFeeInfo: OnChainProxyFeeInfo | undefined
    ): Promise<UniswapCalculatedInfo> {
        const pathFactory = new AerodromePathFactory(this, {
            from,
            to,
            weiAmount,
            exact,
            options,
            proxyFeeInfo
        });
        return pathFactory.getAmountAndPath();
    }
}
