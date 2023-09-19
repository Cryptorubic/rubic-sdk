import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { AERODROME_ABI } from 'src/features/on-chain/calculation-manager/providers/dexes/base/aerodrome/aerodrome-abi';
import { AERODROME_CONTRACT_ADDRESS } from 'src/features/on-chain/calculation-manager/providers/dexes/base/aerodrome/constants';
import { UniswapV2AbstractTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-trade';

export class AerodromeTrade extends UniswapV2AbstractTrade {
    public static get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.AERODROME;
    }

    public static readonly contractAbi = AERODROME_ABI;

    public readonly dexContractAddress = AERODROME_CONTRACT_ADDRESS;

    protected getCallParameters(receiverAddress?: string): unknown[] {
        const { amountIn, amountOut } = this.getAmountInAndAmountOut();
        const amountParameters = this.from.isNative ? [amountOut] : [amountIn, amountOut];

        const path = this.routPoolInfo;

        return [
            ...amountParameters,
            path,
            receiverAddress || this.walletAddress,
            this.deadlineMinutesTimestamp
        ];
    }
}
