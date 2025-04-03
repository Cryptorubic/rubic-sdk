import {
    QuoteAllInterface,
    QuoteRequestInterface,
    SwapRequestInterface,
    WsQuoteRequestInterface,
    WsQuoteResponseInterface
} from '@cryptorubic/core';
import { catchError, concatMap, from, fromEvent, map, Observable, of } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { Injector } from 'src/core/injector/injector';
import { WrappedCrossChainTradeOrNull } from 'src/features/cross-chain/calculation-manager/models/wrapped-cross-chain-trade-or-null';
import { WrappedOnChainTradeOrNull } from 'src/features/on-chain/calculation-manager/models/wrapped-on-chain-trade-or-null';
import { WrappedAsyncTradeOrNull } from 'src/features/ws-api/models/wrapped-async-trade-or-null';
import { TransformUtils } from 'src/features/ws-api/transform-utils';

import { CrossChainTxStatusConfig } from './models/cross-chain-tx-status-config';
import { RubicApiErrorDto } from './models/rubic-api-error';
import { SwapResponseInterface } from './models/swap-response-interface';
import { TransferSwapRequestInterface } from './chains/transfer-trade/models/transfer-swap-request-interface';

export class RubicApiService {
    private get apiUrl(): string {
        const env = this.envType;
        if (env === 'local') {
            return 'http://localhost:3000';
        }
        if (env === 'dev') {
            return 'https://dev1-api-v2.rubic.exchange';
        }
        if (env === 'dev2') {
            return 'https://dev2-api-v2.rubic.exchange';
        }
        if (env === 'rubic') {
            return 'https://rubic-api-v2.rubic.exchange';
        }
        return 'https://api-v2.rubic.exchange';
    }

    private readonly client = this.getSocket();

    private latestQuoteParams: QuoteRequestInterface | null = null;

    constructor(private readonly envType: string) {}

    private getSocket(): Socket {
        const ioClient = io(this.apiUrl, {
            reconnectionDelayMax: 10000,
            path: '/api/routes/ws/',
            transports: ['websocket']
        });
        return ioClient;
    }

    public calculateAsync(params: WsQuoteRequestInterface, attempt = 0): void {
        this.latestQuoteParams = params;
        if (attempt > 2) {
            return;
        }
        if (this.client.connected) {
            this.client.emit('calculate', params);
        } else {
            const repeatInterval = 3_000;
            setTimeout(() => {
                this.calculateAsync(params, attempt + 1);
            }, repeatInterval);
        }
    }

    public fetchSwapData<T>(
        body: SwapRequestInterface | TransferSwapRequestInterface
    ): Promise<SwapResponseInterface<T>> {
        return Injector.httpClient.post<SwapResponseInterface<T>>(
            `${this.apiUrl}/api/routes/swap`,
            body
        );
    }

    public fetchRoutes(body: QuoteRequestInterface): Promise<QuoteAllInterface> {
        return Injector.httpClient.post<QuoteAllInterface>(
            `${this.apiUrl}/api/routes/quoteAll`,
            body
        );
    }

    public fetchCelerRefundData(): void {
        // return Injector.httpClient.post<TransactionInterface>(
        //     `${this.apiUrl}/api/routes/swap`,
        //     body
        // );
    }

    public disconnectSocket(): void {
        this.client.disconnect();
    }

    public closetSocket(): void {
        this.client.close();
    }

    public handleQuotesAsync(): Observable<WrappedAsyncTradeOrNull> {
        return fromEvent<
            WsQuoteResponseInterface & {
                data: RubicApiErrorDto;
                type: string;
            }
        >(this.client, 'events').pipe(
            concatMap(wsResponse => {
                const { trade, total, calculated, data } = wsResponse;
                let promise: Promise<
                    null | WrappedCrossChainTradeOrNull | WrappedOnChainTradeOrNull
                > = Promise.resolve(null);

                const rubicApiError = data
                    ? {
                          ...data,
                          type: wsResponse.type
                      }
                    : data;

                promise =
                    this.latestQuoteParams?.srcTokenBlockchain !==
                    this.latestQuoteParams?.dstTokenBlockchain
                        ? TransformUtils.transformCrossChain(
                              trade!,
                              this.latestQuoteParams!,
                              this.latestQuoteParams!.integratorAddress!,
                              rubicApiError
                          )
                        : TransformUtils.transformOnChain(
                              trade!,
                              this.latestQuoteParams!,
                              this.latestQuoteParams!.integratorAddress!,
                              rubicApiError
                          );
                return from(promise).pipe(
                    catchError(err => {
                        console.log(err);
                        return of(null);
                    }),
                    map(wrappedTrade => ({
                        total,
                        calculated,
                        wrappedTrade
                    }))
                );
            })
        );
    }

    public fetchCrossChainTxStatus(srcTxHash: string): Promise<CrossChainTxStatusConfig> {
        return Injector.httpClient.get(`${this.apiUrl}/api/info/status?srcTxHash=${srcTxHash}`);
    }

    public fetchCrossChainTxStatusExtended(
        srcTxHash: string,
        rubicId: string
    ): Promise<CrossChainTxStatusConfig> {
        return Injector.httpClient.get(
            `${this.apiUrl}/api/info/statusExtended?srcTxHash=${srcTxHash}&rubicId=${rubicId}`
        );
    }

    public getMessageToAuthWallet(walletAddress: string): Promise<{ messageToAuth: string }> {
        return Injector.httpClient.get(
            `${this.apiUrl}/api/utility/authWalletMessage?walletAddress=${walletAddress}`
        );
    }
}
