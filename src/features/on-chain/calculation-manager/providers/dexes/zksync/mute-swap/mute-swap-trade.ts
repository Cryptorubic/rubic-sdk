import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { UniswapV2AbstractTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import { MUTE_SWAP_CONTRACT_ADDRESS } from 'src/features/on-chain/calculation-manager/providers/dexes/zksync/mute-swap/constants';
import { muteSwapAbi } from 'src/features/on-chain/calculation-manager/providers/dexes/zksync/mute-swap/constants/mute-swap-abi';

export class MuteSwapTrade extends UniswapV2AbstractTrade {
    public static get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.MUTE_SWAP;
    }

    public static readonly contractAbi = muteSwapAbi;

    public readonly dexContractAddress = MUTE_SWAP_CONTRACT_ADDRESS;

    protected getCallParameters(receiverAddress?: string): unknown[] {
        const { amountIn, amountOut } = this.getAmountInAndAmountOut();
        const amountParameters = this.from.isNative ? [amountOut] : [amountIn, amountOut];

        return [
            ...amountParameters,
            this.wrappedPath.map(t => t.address),
            receiverAddress || this.walletAddress,
            this.deadlineMinutesTimestamp,
            false
        ];
    }
}
