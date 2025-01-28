import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

import { UniswapV2AbstractProvider } from '../../common/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { FRAXSWAP_V2_PROVIDER_CONFIGURATION } from './constants';
import { FraxSwapV2Trade } from './frax-swap-v2-trade';

export class FraxSwapV2Provider extends UniswapV2AbstractProvider<FraxSwapV2Trade> {
    public readonly blockchain = BLOCKCHAIN_NAME.FRAXTAL;

    public readonly UniswapV2TradeClass = FraxSwapV2Trade;

    public readonly providerSettings = FRAXSWAP_V2_PROVIDER_CONFIGURATION;
}
