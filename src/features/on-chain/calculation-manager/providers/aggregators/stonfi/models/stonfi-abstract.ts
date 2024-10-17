import { PriceTokenAmount } from 'src/common/tokens';
import { TonEncodedConfig } from 'src/core/blockchain/web3-private-service/web3-private/ton-web3-private/models/ton-types';

export interface StonfiTxParamsProvider {
    getTxParams(
        from: PriceTokenAmount,
        to: PriceTokenAmount,
        walletAddress: string,
        minAmountOutWei: string
    ): Promise<TonEncodedConfig>;
}
