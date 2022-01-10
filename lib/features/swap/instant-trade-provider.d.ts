import { BLOCKCHAIN_NAME } from '../../core/blockchain/models/BLOCKCHAIN_NAME';
import { PriceToken } from '../../core/blockchain/tokens/price-token';
import { PriceTokenAmount } from '../../core/blockchain/tokens/price-token-amount';
import { InstantTrade } from './instant-trade';
import { SwapCalculationOptions } from './models/swap-calculation-options';
import { Web3Public } from '../../core/blockchain/web3-public/web3-public';
import { GasPriceInfo } from './models/gas-price-info';
import BigNumber from 'bignumber.js';
import { GasFeeInfo } from './models/gas-fee-info';
import { TradeType } from '..';
export declare abstract class InstantTradeProvider {
    abstract readonly blockchain: BLOCKCHAIN_NAME;
    protected abstract readonly gasMargin: number;
    abstract get type(): TradeType;
    protected get web3Public(): Web3Public;
    abstract calculate(from: PriceTokenAmount, to: PriceToken, options?: SwapCalculationOptions): Promise<InstantTrade>;
    protected getGasPriceInfo(): Promise<GasPriceInfo>;
    protected getGasFeeInfo(estimatedGas: BigNumber | string | number | undefined, gasPriceInfo: GasPriceInfo | undefined): GasFeeInfo;
}
