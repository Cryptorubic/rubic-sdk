import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { DRAGON_SWAP_METHOD } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/constants/DRAGON_SWAP_METHOD';
import { ExactInputOutputSwapMethodsList } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/constants/SWAP_METHOD';
import { UniswapV2AbstractTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import {
    DRAGON_SWAP_CONTRACT_ABI,
    DRAGON_SWAP_CONTRACT_ADDRESS
} from 'src/features/on-chain/calculation-manager/providers/dexes/sei/dragonswap/constants';
import { AbiItem } from 'web3-utils';

export class DragonSwapTrade extends UniswapV2AbstractTrade {
    public static get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.DRAGON_SWAP;
    }

    public readonly dexContractAddress = DRAGON_SWAP_CONTRACT_ADDRESS;

    public static readonly swapMethods: ExactInputOutputSwapMethodsList = DRAGON_SWAP_METHOD;

    public static readonly contractAbi: AbiItem[] = DRAGON_SWAP_CONTRACT_ABI;
}
