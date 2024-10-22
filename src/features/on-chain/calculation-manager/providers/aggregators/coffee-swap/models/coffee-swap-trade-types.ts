import { TonOnChainTradeStruct } from '../../../common/on-chain-trade/ton-on-chain-trade/models/ton-on-chian-trade-types';
import { CoffeeRoutePath } from './coffe-swap-api-types';

export interface CoffeeSwapTradeStruct extends TonOnChainTradeStruct {
    txSteps: CoffeeRoutePath[];
}
