import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { UniswapV2AbstractProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { PULSEX_V2_PROVIDER_CONFIGURATION } from 'src/features/on-chain/calculation-manager/providers/dexes/pulsechain/pulsex-v2/constants';
import { PulseXV2Trade } from 'src/features/on-chain/calculation-manager/providers/dexes/pulsechain/pulsex-v2/pulsex-v2-trade';

export class PulseXV2Provider extends UniswapV2AbstractProvider<PulseXV2Trade> {
    public readonly blockchain = BLOCKCHAIN_NAME.PULSECHAIN;

    public readonly UniswapV2TradeClass = PulseXV2Trade;

    public readonly providerSettings = PULSEX_V2_PROVIDER_CONFIGURATION;
}
