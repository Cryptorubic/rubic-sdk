import { TonClient } from '@ton/ton';
import { PriceToken, PriceTokenAmount } from 'src/common/tokens';
import { Injector } from 'src/core/injector/injector';

import { BOUNCEABLE_TON_NATIVE_ADDRESS } from '../constants/ton-address';
import { StonfiQuoteInfo, StonfiQuoteResponse } from '../models/stonfi-api-types';

export class StonfiSwapService {
    private static instance: StonfiSwapService;

    private readonly apiUrl = 'https://api.ston.fi/v1';

    private tonClient!: TonClient;

    public static getInstance(): StonfiSwapService {
        if (!this.instance) {
            this.instance = new StonfiSwapService();
        }

        return this.instance;
    }

    private constructor() {
        this.tonClient = new TonClient({
            endpoint: 'https://toncenter.com/api/v2/jsonRPC',
            apiKey: '44176ed3735504c6fb1ed3b91715ba5272cdd2bbb304f78d1ae6de6aed47d284'
        });
    }

    // public static async getTxParams(
    //     from: PriceTokenAmount,
    //     to: PriceTokenAmount,
    //     walletAddress: string
    // ): Promise<StonfiSwapInfo> {
    //     if (from.isNative) {
    //         const router = this.tonClient.open(
    //             DEX.v2.Router.create('kQCas2p939ESyXM_BzFJzcIe3GD5S0tbjJDj6EBVn-SPsEkN')
    //         );
    //         const proxyTon = pTON.v2.create('kQDwpyxrmYQlGDViPk-oqP4XK6J11I-bx7fJAlQCWmJB4m74');

    //         const txParams = await router.getSwapTonToJettonTxParams({
    //             userWalletAddress: walletAddress,
    //             proxyTon: proxyTon,
    //             offerAmount: toNano(from.tokenAmount.toFixed()),
    //             askJettonAddress: to.address,
    //             minAskAmount: '1',
    //             queryId: 12345
    //         });

    //         return txParams;
    //     }

    //     if (to.isNative) {
    //     }

    //     return {};
    // }

    public async makeQuoteRequest(
        from: PriceTokenAmount,
        to: PriceToken,
        slippage: number
    ): Promise<StonfiQuoteInfo> {
        try {
            const srcTokenAddress = from.isNative ? BOUNCEABLE_TON_NATIVE_ADDRESS : from.address;
            const dstTokenAddress = to.isNative ? BOUNCEABLE_TON_NATIVE_ADDRESS : to.address;

            let queryParams = `offer_address=${srcTokenAddress}&ask_address=${dstTokenAddress}&units=${from.stringWeiAmount}&slippage_tolerance=${slippage}`;
            const res = await Injector.httpClient.post<StonfiQuoteResponse>(
                `${this.apiUrl}/swap/simulate?${queryParams}`
            );

            return {
                minAmountOutWei: res.min_ask_units,
                amountOutWei: res.ask_units,
                stonfiFee: res.fee_units
            };
        } catch (err) {
            throw err;
        }
    }
}
