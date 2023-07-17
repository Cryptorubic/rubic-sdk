import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { UniswapV2AbstractProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { PULSEX_V1_PROVIDER_CONFIGURATION } from 'src/features/on-chain/calculation-manager/providers/dexes/pulsechain/pulsex-v1/constants';
import { PulseXV1Trade } from 'src/features/on-chain/calculation-manager/providers/dexes/pulsechain/pulsex-v1/pulsex-v1-trade';

export class PulseXV1Provider extends UniswapV2AbstractProvider<PulseXV1Trade> {
    public readonly blockchain = BLOCKCHAIN_NAME.PULSECHAIN;

    public readonly UniswapV2TradeClass = PulseXV1Trade;

    public readonly providerSettings = PULSEX_V1_PROVIDER_CONFIGURATION;
}
