import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { UniswapV3AbstractTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v3-abstract/uniswap-v3-abstract-trade';
import {
    FUSIONX_UNISWAP_V3_SWAP_ROUTER_CONTRACT_ABI,
    FUSIONX_UNISWAP_V3_SWAP_ROUTER_CONTRACT_ADDRESS
} from 'src/features/on-chain/calculation-manager/providers/dexes/mantle/fusionx/constants/router-configuration';

export class FusionXTrade extends UniswapV3AbstractTrade {
    public get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.FUSIONX;
    }

    public readonly dexContractAddress = FUSIONX_UNISWAP_V3_SWAP_ROUTER_CONTRACT_ADDRESS;

    protected readonly contractAbi = FUSIONX_UNISWAP_V3_SWAP_ROUTER_CONTRACT_ABI;
}
