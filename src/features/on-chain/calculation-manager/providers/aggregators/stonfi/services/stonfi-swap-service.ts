import { DEX, pTON } from '@ston-fi/sdk';
import { TonClient } from '@ton/ton';
import { PriceTokenAmount } from 'src/common/tokens';
import { CHAIN_TYPE } from 'src/core/blockchain/models/chain-type';
import { TonEncodedConfig } from 'src/core/blockchain/web3-private-service/web3-private/ton-web3-private/models/ton-types';
import { Injector } from 'src/core/injector/injector';

import { STONFI_REFERRAL_ADDRESS } from '../constants/ton-addresses';
import { convertTxParamsToTonConfig } from '../utils/convert-params-to-ton-config';

export class StonfiSwapService {
    private get tonClient(): TonClient {
        return (
            Injector.web3PrivateService.getWeb3Private(CHAIN_TYPE.TON).tonClient ||
            new TonClient({
                endpoint: 'https://toncenter.com/api/v2/jsonRPC',
                apiKey: '44176ed3735504c6fb1ed3b91715ba5272cdd2bbb304f78d1ae6de6aed47d284'
            })
        );
    }

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
                minAskAmount: minAmountOutWei,
                referralAddress: STONFI_REFERRAL_ADDRESS
            });

            return convertTxParamsToTonConfig(txParams);
        }

        if (to.isNative) {
            const txParams = await this.stonfiRouter.getSwapJettonToTonTxParams({
                userWalletAddress: walletAddress,
                offerJettonAddress: from.address,
                offerAmount: from.stringWeiAmount,
                proxyTon: new pTON.v1(),
                minAskAmount: minAmountOutWei,
                referralAddress: STONFI_REFERRAL_ADDRESS
            });

            return convertTxParamsToTonConfig(txParams);
        }

        const txParams = await this.stonfiRouter.getSwapJettonToJettonTxParams({
            userWalletAddress: walletAddress,
            offerJettonAddress: from.address,
            offerAmount: from.stringWeiAmount,
            askJettonAddress: to.address,
            minAskAmount: minAmountOutWei,
            referralAddress: STONFI_REFERRAL_ADDRESS
        });

        return convertTxParamsToTonConfig(txParams);
    }
}
