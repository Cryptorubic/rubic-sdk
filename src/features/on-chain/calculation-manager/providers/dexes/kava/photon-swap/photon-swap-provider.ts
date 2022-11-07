import { UniswapV2AbstractProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { PHOTON_SWAP_PROVIDER_CONFIGURATION } from 'src/features/on-chain/calculation-manager/providers/dexes/kava/photon-swap/constants';
import { PhotonSwapTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/kava/photon-swap/photon-swap-trade';

export class PhotonSwapProvider extends UniswapV2AbstractProvider<PhotonSwapTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.KAVA;

    public readonly UniswapV2TradeClass = PhotonSwapTrade;

    public readonly providerSettings = PHOTON_SWAP_PROVIDER_CONFIGURATION;
}
