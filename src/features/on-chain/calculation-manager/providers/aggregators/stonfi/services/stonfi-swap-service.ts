import { DEX, pTON } from '@ston-fi/sdk';
import { PriceTokenAmount } from 'src/common/tokens';
import { TonEncodedConfig } from 'src/core/blockchain/web3-private-service/web3-private/ton-web3-private/models/ton-types';
import { TonClientInstance } from 'src/core/blockchain/web3-private-service/web3-private/ton-web3-private/ton-client/ton-client-instance';

import { convertTxParamsToTonConfig } from '../utils/convert-params-to-ton-config';

export class StonfiSwapService {
    private tonClient = TonClientInstance.getInstance();

    private readonly stonfiRouter = this.tonClient.open(new DEX.v1.Router());

    constructor() {}

    public async getTxParams(
        from: PriceTokenAmount,
        to: PriceTokenAmount,
        walletAddress: string,
        minAmountOutWei: string
    ): Promise<TonEncodedConfig> {
        if (from.isNative) {
            const txParams = await this.stonfiRouter.getSwapTonToJettonTxParams({
                userWalletAddress: walletAddress,
                proxyTon: new pTON.v1(),
                offerAmount: from.stringWeiAmount,
                askJettonAddress: to.address,
                minAskAmount: minAmountOutWei
            });

            return convertTxParamsToTonConfig(txParams);
        }

        if (to.isNative) {
            const txParams = await this.stonfiRouter.getSwapJettonToTonTxParams({
                userWalletAddress: walletAddress,
                offerJettonAddress: from.address,
                offerAmount: from.stringWeiAmount,
                proxyTon: new pTON.v1(),
                minAskAmount: minAmountOutWei
            });

            return convertTxParamsToTonConfig(txParams);
        }

        const txParams = await this.stonfiRouter.getSwapJettonToJettonTxParams({
            userWalletAddress: walletAddress,
            offerJettonAddress: from.address,
            offerAmount: from.stringWeiAmount,
            askJettonAddress: to.address,
            minAskAmount: minAmountOutWei
        });

        return convertTxParamsToTonConfig(txParams);
    }
}
