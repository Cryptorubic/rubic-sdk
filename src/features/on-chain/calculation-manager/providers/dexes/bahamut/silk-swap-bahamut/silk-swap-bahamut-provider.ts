import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

import { evmProviderDefaultOptions } from '../../common/on-chain-provider/evm-on-chain-provider/constants/evm-provider-default-options';
import { UniswapV2CalculationOptions } from '../../common/uniswap-v2-abstract/models/uniswap-v2-calculation-options';
import { UniswapV2AbstractProvider } from '../../common/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { SILK_SWAP_BAHAMUT_PROVIDER_CONFIGURATION } from './constants';
import { SilkSwapBahamutTrade } from './silk-swap-bahamut-trade';

export class SilkSwapBahamutProvider extends UniswapV2AbstractProvider<SilkSwapBahamutTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.BAHAMUT;

    protected readonly defaultOptions: UniswapV2CalculationOptions = {
        ...evmProviderDefaultOptions,
        deadlineMinutes: 60,
        disableMultihops: false
    };

    public readonly UniswapV2TradeClass = SilkSwapBahamutTrade;

    public readonly providerSettings = SILK_SWAP_BAHAMUT_PROVIDER_CONFIGURATION;
}
