import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import { Injector } from 'src/core/injector/injector';
import { FAKE_WALLET_ADDRESS } from 'src/features/common/constants/fake-wallet-address';

import {
    OneinchQuoteParams,
    OneinchQuoteResponse,
    OneinchSwapOrderParams,
    OneinchSwapOrderResponse
} from '../models/oneinch-api-types';
import { OneinchCcrUtils } from './oneinch-ccr-utils';

export class OneinchCcrApiService {
    private static readonly apiUrl = 'https://api.1inch.dev/fusion-plus';

    private static readonly apiKey = 'sndfje3u4b3fnNSDNFUSDNVSunw345842hrnfd3b4nt4';

    public static async fetchQuote({
        srcToken,
        dstToken,
        walletAddress
    }: OneinchQuoteParams): Promise<OneinchQuoteResponse> {
        try {
            const res = await Injector.httpClient.get<OneinchQuoteResponse>(
                `${this.apiUrl}/quoter/v1.0/quote/receive`,
                {
                    headers: { apikey: this.apiKey },
                    params: {
                        srcChain: blockchainId[srcToken.blockchain],
                        dstChain: blockchainId[dstToken.blockchain],
                        srcTokenAddress: srcToken.address,
                        dstTokenAddress: dstToken.address,
                        amount: srcToken.stringWeiAmount,
                        walletAddress: walletAddress || FAKE_WALLET_ADDRESS,
                        enableEstimate: true,
                        fee: 100,
                        source: 'rubic'
                    }
                }
            );

            return res;
        } catch (err) {
            throw err;
        }
    }

    // @TODO add feeReceiver
    public static async fetchSwapOrder({
        dstToken,
        srcToken,
        walletAddress,
        quote,
        secretHashes
    }: OneinchSwapOrderParams): Promise<OneinchSwapOrderResponse> {
        try {
            const queryParams = `srcChain=${blockchainId[srcToken.blockchain]}&
dstChain=${blockchainId[dstToken.blockchain]}&
srcTokenAddress=${srcToken.address}&
dstTokenAddress=${dstToken.address}&
amount=${srcToken.stringWeiAmount}&
walletAddress=${walletAddress}&
fee=100&
feeReceiver=${walletAddress}&
source=rubic&
preset=fast`;

            const res = await Injector.httpClient.post<OneinchSwapOrderResponse>(
                `${this.apiUrl}/quoter/v1.0/quote/build?${queryParams}`,
                { quote: quote, secretsHashList: secretHashes },
                { headers: { apikey: this.apiKey } }
            );

            return res;
        } catch (err) {
            throw err;
        }
    }

    public static async submitSwapOrder(
        quoteResp: OneinchQuoteResponse,
        swapResp: OneinchSwapOrderResponse,
        walletAddress: string,
        secretHashes: string[]
    ): Promise<void> {
        try {
            const signature = await OneinchCcrUtils.signTypedData(
                swapResp.typedData,
                walletAddress
            );
            const res = await Injector.httpClient.post(
                `${this.apiUrl}/relayer/v1.0/submit`,
                {
                    signature,
                    order: swapResp.typedData.message,
                    srcChainId: swapResp.typedData.domain.chainId,
                    extension: swapResp.extension,
                    quoteId: quoteResp.quoteId,
                    secretHashes
                },
                { headers: { apikey: this.apiKey } }
            );

            console.log(
                `[OneinchCcrApiService_submitSwapOrder] %cResponse is ${res}`,
                'color: green; font-size: 24px;'
            );
        } catch (err) {
            throw err;
        }
    }

    public static async submitSecretForSwapOrder(orderHash: string, secret: string): Promise<void> {
        try {
            await Injector.httpClient.post(
                `${this.apiUrl}/relayer/v1.0/submit/secret`,
                {
                    secret,
                    orderHash
                },
                { headers: { apikey: this.apiKey } }
            );
        } catch (err) {
            throw err;
        }
    }

    public static async fetchTxStatus(): Promise<void> {}
}
