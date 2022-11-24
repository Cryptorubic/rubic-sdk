import { UniswapV2AbstractTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { CLAIM_SWAP_CONTRACT_ADDRESS } from 'src/features/on-chain/calculation-manager/providers/dexes/klaytn/claim-swap/constants';
import { KLAY_SWAP_METHOD } from 'src/features/on-chain/calculation-manager/providers/dexes/klaytn/klaytn-swap-method';
import { KLAY_ABI } from 'src/features/on-chain/calculation-manager/providers/dexes/klaytn/klaytn-abi';

export class ClaimSwapTrade extends UniswapV2AbstractTrade {
    public static readonly contractAbi = KLAY_ABI;

    public static readonly swapMethods = KLAY_SWAP_METHOD;

    public static get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.CLAIM_SWAP;
    }

    public readonly dexContractAddress = CLAIM_SWAP_CONTRACT_ADDRESS;
}
