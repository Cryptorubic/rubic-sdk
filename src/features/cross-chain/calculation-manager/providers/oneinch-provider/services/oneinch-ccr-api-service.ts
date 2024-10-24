import { PriceToken } from 'src/common/tokens';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import { TX_STATUS } from 'src/core/blockchain/web3-public-service/web3-public/models/tx-status';
import { Injector } from 'src/core/injector/injector';
import { FAKE_WALLET_ADDRESS } from 'src/features/common/constants/fake-wallet-address';
import { TxStatusData } from 'src/features/common/status-manager/models/tx-status-data';

import { ONEINCH_NATIVE_ADDRESS } from '../constants/oneinch-ccr-native-address';
import {
    OneinchCcrQuoteResponse,
    OneinchQuoteParams,
    OneinchReadySecretsResponse,
    OneinchStatusResponse,
    OneinchSwapOrderParams,
    OneinchSwapOrderResponse
} from '../models/oneinch-api-types';
import { OneinchCcrUtils } from './oneinch-ccr-utils';

export class OneinchCcrApiService {
    private static readonly apiUrl = 'https://api.1inch.dev/fusion-plus';

    private static readonly xApiUrl = 'https://x-api.rubic.exchange/api/fusion-plus';

    private static readonly apiKey = 'sndfje3u4b3fnNSDNFUSDNVSunw345842hrnfd3b4nt4';

    /**
     * @TODO add fee and source
     */
    public static async fetchQuote({
        srcToken,
        dstToken,
        walletAddress
    }: OneinchQuoteParams): Promise<OneinchCcrQuoteResponse> {
        try {
            const res = await Injector.httpClient.get<OneinchCcrQuoteResponse>(
                `${this.xApiUrl}/quoter/v1.0/quote/receive`,
                {
                    headers: { apikey: this.apiKey },
                    params: {
                        srcChain: blockchainId[srcToken.blockchain],
                        dstChain: blockchainId[dstToken.blockchain],
                        srcTokenAddress: this.getApiTokenAddress(srcToken),
                        dstTokenAddress: this.getApiTokenAddress(dstToken),
                        amount: srcToken.stringWeiAmount,
                        walletAddress: walletAddress || FAKE_WALLET_ADDRESS,
                        enableEstimate: true
                    }
                }
            );

            return res;
        } catch (err) {
            throw err;
        }
    }

    /**
     * @TODO add fee=100&
feeReceiver=${address}&
source=rubic&
     *  */
    public static async buildSwapOrder({
        dstToken,
        srcToken,
        walletAddress,
        quote,
        secretHashes
    }: OneinchSwapOrderParams): Promise<OneinchSwapOrderResponse> {
        try {
            const queryParams = `srcChain=${blockchainId[srcToken.blockchain]}&
dstChain=${blockchainId[dstToken.blockchain]}&
srcTokenAddress=${this.getApiTokenAddress(srcToken)}&
dstTokenAddress=${this.getApiTokenAddress(dstToken)}&
amount=${srcToken.stringWeiAmount}&
walletAddress=${walletAddress}&
preset=${quote.recommendedPreset}`;

            const res = await Injector.httpClient.post<OneinchSwapOrderResponse>(
                `${this.xApiUrl}/quoter/v1.0/quote/build?${queryParams}`,
                { quote: quote, secretsHashList: secretHashes },
                { headers: { apikey: this.apiKey } }
            );

            return res;
        } catch (err) {
            throw err;
        }
    }

    public static async submitSwapOrder(
        quoteResp: OneinchCcrQuoteResponse,
        swapResp: OneinchSwapOrderResponse,
        walletAddress: string,
        secretHashes: string[]
    ): Promise<void> {
        try {
            const signature = await OneinchCcrUtils.signTypedData(
                swapResp.typedData,
                walletAddress
            );
            await Injector.httpClient.post(
                `${this.xApiUrl}/relayer/v1.0/submit`,
                {
                    signature,
                    order: swapResp.typedData.message,
                    srcChainId: swapResp.typedData.domain.chainId,
                    extension: swapResp.extension,
                    quoteId: quoteResp.quoteId,
                    ...(secretHashes.length > 1 && { secretHashes })
                },
                { headers: { apikey: this.apiKey } }
            );
        } catch (err) {
            throw err;
        }
    }

    public static async fetchReadySecrets(orderHash: string): Promise<OneinchReadySecretsResponse> {
        try {
            const readySecrets = await Injector.httpClient.get<OneinchReadySecretsResponse>(
                `${this.xApiUrl}/orders/v1.0/order/ready-to-accept-secret-fills/${orderHash}`,
                { headers: { apikey: this.apiKey } }
            );

            return readySecrets;
        } catch (err) {
            throw err;
        }
    }

    public static async submitSecretForSwapOrder(orderHash: string, secret: string): Promise<void> {
        try {
            await Injector.httpClient.post(
                `${this.xApiUrl}/relayer/v1.0/submit/secret`,
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

    public static async fetchTxStatus(orderHash: string): Promise<TxStatusData> {
        try {
            const { status, fills } = await Injector.httpClient.get<OneinchStatusResponse>(
                `${this.xApiUrl}/orders/v1.0/order/status/${orderHash}`
            );

            if (status === 'cancelled' || status === 'expired') {
                return {
                    hash: null,
                    status: TX_STATUS.FAIL
                };
            }

            if (status === 'executed') {
                const dstWithdrawnEvent = fills
                    .at(-1)
                    ?.escrowEvents.find(e => e.action === 'withdrawn' && e.side === 'dst');
                const dstTxHash = dstWithdrawnEvent?.transactionHash;

                return {
                    hash: dstTxHash || null,
                    status: TX_STATUS.SUCCESS
                };
            }

            return { status: TX_STATUS.PENDING, hash: null };
        } catch (err) {
            return { status: TX_STATUS.PENDING, hash: null };
        }
    }

    public static async fetchSrcTxHash(orderHash: string): Promise<string | null> {
        try {
            const { fills } = await Injector.httpClient.get<OneinchStatusResponse>(
                `${this.xApiUrl}/orders/v1.0/order/status/${orderHash}`
            );
            const srcEscrowFirstEvent = fills[0]?.escrowEvents.find(
                e => e.side === 'src' && e.action === 'src_escrow_created'
            );

            return srcEscrowFirstEvent?.transactionHash || null;
        } catch (err) {
            throw err;
        }
    }

    private static getApiTokenAddress(token: PriceToken): string {
        return token.isNative ? ONEINCH_NATIVE_ADDRESS : token.address;
    }
}
