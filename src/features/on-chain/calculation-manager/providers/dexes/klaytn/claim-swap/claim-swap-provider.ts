import { UniswapV2AbstractProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { CLAIM_SWAP_PROVIDER_CONFIGURATION } from 'src/features/on-chain/calculation-manager/providers/dexes/klaytn/claim-swap/constants';
import { ClaimSwapTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/klaytn/claim-swap/claim-swap-trade';

export class ClaimSwapProvider extends UniswapV2AbstractProvider<ClaimSwapTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.KLAYTN;

    public readonly UniswapV2TradeClass = ClaimSwapTrade;

    public readonly providerSettings = CLAIM_SWAP_PROVIDER_CONFIGURATION;
}
