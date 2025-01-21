import { getMint } from '@solana/spl-token';
import { Connection, PublicKey } from '@solana/web3.js';
import { Client as TokenSdk, UtlConfig } from '@solflare-wallet/utl-sdk';
import { compareAddresses } from 'src/common/utils/blockchain';
import pTimeout from 'src/common/utils/p-timeout';

import { SolanaToken, SolanaTokensFetchingResp } from '../models/solana-token';
import { SolanaTokensApiService } from './solana-tokens-api-service';

export class SolanaTokensService {
    private static instance: SolanaTokensService | null = null;

    private connection!: Connection;

    // key - address of token, value - idx of token in initial tokensAddress
    private tokensOrder: Record<string, number> = {};

    private initialMints: PublicKey[] = [];

    public static getInstance(connection: Connection): SolanaTokensService {
        if (!this.instance) {
            this.instance = new SolanaTokensService();
            this.instance.connection = connection;
        }

        return this.instance;
    }

    private constructor() {}

    public async fetchTokensData(mints: PublicKey[]): Promise<SolanaToken[]> {
        const tokensAddresses = mints.map(mint => mint.toString());
        this.initialMints = mints;
        this.tokensOrder = tokensAddresses.reduce(
            (acc, address, idx) => ({ ...acc, [address.toLowerCase()]: idx }),
            {} as Record<string, number>
        );

        const fromBackend = await this.fetchTokensFromBackend(mints);
        if (!fromBackend.hasNotFetchedTokens) return this.sortTokensByIdx(fromBackend.tokensList);

        const fromMetaplex = await this.fetchTokensFromMetaplex(
            fromBackend.notFetchedMints,
            fromBackend.tokensList
        );
        const backendWithMetaplexTokens = this.sortTokensByIdx([
            ...fromBackend.tokensList,
            ...fromMetaplex.tokensList
        ]);
        if (!fromMetaplex.hasNotFetchedTokens) return backendWithMetaplexTokens;

        const fromSplApi = await this.fetchTokensFromSplApi(
            fromMetaplex.notFetchedMints,
            backendWithMetaplexTokens
        );

        return this.sortTokensByIdx([
            ...fromBackend.tokensList,
            ...fromMetaplex.tokensList,
            ...fromSplApi.tokensList
        ]);
    }

    private async fetchTokensFromBackend(mints: PublicKey[]): Promise<SolanaTokensFetchingResp> {
        try {
            const tokensAddresses = mints.map(mint => mint.toString());
            const { content: notSortedTokensList } = await pTimeout(
                SolanaTokensApiService.getTokensList(tokensAddresses),
                1_000,
                new Error('Api Timeout!')
            );
            const notFetchedMints = this.getNotFetchedTokensList(notSortedTokensList);

            return {
                tokensList: notSortedTokensList,
                notFetchedMints,
                hasNotFetchedTokens: notFetchedMints.length > 0
            };
        } catch {
            return {
                tokensList: [],
                notFetchedMints: [...mints],
                hasNotFetchedTokens: true
            };
        }
    }

    private async fetchTokensFromMetaplex(
        mints: PublicKey[],
        prevTokensList: SolanaToken[]
    ): Promise<SolanaTokensFetchingResp> {
        const config = new UtlConfig({
            connection: this.connection,
            timeout: 5000
        });

        const tokenSDK = new TokenSdk(config);
        const metaplexTokens = await tokenSDK.getFromMetaplex(mints);

        const notSortedTokensList = [...prevTokensList, ...metaplexTokens];
        const notFetchedMints = this.getNotFetchedTokensList(notSortedTokensList);

        return {
            tokensList: metaplexTokens,
            notFetchedMints,
            hasNotFetchedTokens: notFetchedMints.length > 0
        };
    }

    private async fetchTokensFromSplApi(
        mints: PublicKey[],
        prevTokensList: SolanaToken[]
    ): Promise<SolanaTokensFetchingResp> {
        const splApiResp = await Promise.all(
            mints.map(mint => getMint(this.connection, mint, 'confirmed'))
        );
        const splApiTokens = splApiResp.filter(Boolean).map(
            token =>
                ({
                    name: `Token ${token.address.toString().slice(0, 10)}`,
                    symbol: `Token ${token.address.toString().slice(0, 10)}`,
                    logoURI: null,
                    decimals: token.decimals,
                    address: token.address.toString(),
                    verified: token.isInitialized
                } as SolanaToken)
        );

        const notSortedTokensList = [...prevTokensList, ...splApiTokens];
        const notFetchedMints = this.getNotFetchedTokensList(notSortedTokensList);

        return {
            tokensList: notSortedTokensList,
            notFetchedMints,
            hasNotFetchedTokens: notFetchedMints.length > 0
        };
    }

    private sortTokensByIdx(notSortedList: SolanaToken[]): SolanaToken[] {
        const sortedList = [] as SolanaToken[];
        for (const token of notSortedList) {
            const originalIdx = this.tokensOrder[token.address.toLowerCase()]!;
            sortedList[originalIdx] = token;
        }

        return sortedList;
    }

    private getNotFetchedTokensList(tokensList: SolanaToken[]): PublicKey[] {
        const notFetchedTokensList = this.initialMints.filter(mint =>
            tokensList.every(token => !compareAddresses(token.address, mint.toString()))
        );

        return notFetchedTokensList;
    }
}
