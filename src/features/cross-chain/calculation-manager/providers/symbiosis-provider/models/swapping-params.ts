import {
    SymbiosisToken,
    SymbiosisTokenAmount
} from 'src/features/cross-chain/calculation-manager/providers/symbiosis-provider/models/symbiosis-trade-data';

export type SwappingParams = {
    tokenAmountIn: SymbiosisTokenAmount;
    tokenOut: SymbiosisToken;
    from: string;
    to: string;
    revertableAddress: string;
    slippage: number;
    deadline: number;
    partnerId: string;
};
