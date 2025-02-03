import { getMint } from '@solana/spl-token';
import { Connection, PublicKey } from '@solana/web3.js';
import { Client as TokenSdk, UtlConfig } from '@solflare-wallet/utl-sdk';
import { compareAddresses } from 'src/common/utils/blockchain';
import pTimeout from 'src/common/utils/p-timeout';

import { SolanaToken, SolanaTokensFetchingResp } from '../models/solana-token';
import { SolanaTokensApiService } from './solana-tokens-api-service';

export class SolanaTokensService {
    private connection!: Connection;

    // key - address of token, value - idx of token in initial tokensAddress
    private tokensOrder: Record<string, number> = {};

    private initialMints: PublicKey[] = [];

    constructor(connection: Connection) {
        this.connection = connection;
    }

    public async fetchTokensData(mints: PublicKey[]): Promise<SolanaToken[]> {
        const tokensAddresses = mints.map(mint => mint.toString());
        this.initialMints = mints;
        this.tokensOrder = tokensAddresses.reduce(
            (acc, address, idx) => ({ ...acc, [address.toLowerCase()]: idx }),
            {} as Record<string, number>
        );

        const fromBackend = await this.fetchTokensFromBackend(mints);
        if (!fromBackend.hasNotFetchedTokens) return this.sortTokensByIdx(fromBackend.tokensList);

        const fromOldBackend = await this.fetchTokensFromOldBackend(
            fromBackend.notFetchedMints,
            fromBackend.tokensList
        );
        if (!fromOldBackend.hasNotFetchedTokens) {
            return this.sortTokensByIdx([...fromBackend.tokensList, ...fromOldBackend.tokensList]);
        }

        const fromMetaplex = await this.fetchTokensFromMetaplex(fromBackend.notFetchedMints, [
            ...fromBackend.tokensList,
            ...fromOldBackend.tokensList
        ]);

        if (!fromMetaplex.hasNotFetchedTokens) {
            return this.sortTokensByIdx([
                ...fromBackend.tokensList,
                ...fromOldBackend.tokensList,
                ...fromMetaplex.tokensList
            ]);
        }

        const fromSplApi = await this.fetchTokensFromSplApi(fromMetaplex.notFetchedMints, [
            ...fromBackend.tokensList,
            ...fromOldBackend.tokensList,
            ...fromMetaplex.tokensList
        ]);

        return this.sortTokensByIdx([
            ...fromBackend.tokensList,
            ...fromOldBackend.tokensList,
            ...fromMetaplex.tokensList,
            ...fromSplApi.tokensList
        ]);
    }

    private async fetchTokensFromBackend(mints: PublicKey[]): Promise<SolanaTokensFetchingResp> {
        const tokensAddresses = mints.map(mint => mint.toString());
        const tokensList = await SolanaTokensApiService.getTokensList(tokensAddresses);
        const notFetchedMints = this.getNotFetchedTokensList(tokensList);

        return {
            tokensList,
            notFetchedMints,
            hasNotFetchedTokens: notFetchedMints.length > 0
        };
    }

    private async fetchTokensFromOldBackend(
        mints: PublicKey[],
        prevFetchedTokens: SolanaToken[]
    ): Promise<SolanaTokensFetchingResp> {
        const tokensAddresses = mints.map(mint => mint.toString());
        const { content: tokensFromOlbBackend } = await pTimeout(
            SolanaTokensApiService.getTokensListOld(tokensAddresses),
            3_000,
            new Error('Api Timeout!')
        ).catch(() => ({ content: [] }));

        const notSortedTokensList = [...prevFetchedTokens, ...tokensFromOlbBackend];
        const notFetchedMints = this.getNotFetchedTokensList(notSortedTokensList);

        return {
            tokensList: notSortedTokensList,
            notFetchedMints,
            hasNotFetchedTokens: notFetchedMints.length > 0
        };
    }

    private async fetchTokensFromMetaplex(
        mints: PublicKey[],
        prevFetchedTokens: SolanaToken[]
    ): Promise<SolanaTokensFetchingResp> {
        const config = new UtlConfig({
            connection: this.connection,
            timeout: 5000
        });

        const tokenSDK = new TokenSdk(config);
        const metaplexTokens = await tokenSDK.getFromMetaplex(mints).catch(() => []);

        const notSortedTokensList = [...prevFetchedTokens, ...metaplexTokens];
        const notFetchedMints = this.getNotFetchedTokensList(notSortedTokensList);

        return {
            tokensList: metaplexTokens,
            notFetchedMints,
            hasNotFetchedTokens: notFetchedMints.length > 0
        };
    }

    private async fetchTokensFromSplApi(
        mints: PublicKey[],
        prevFetchedTokens: SolanaToken[]
    ): Promise<SolanaTokensFetchingResp> {
        const splApiResp = await Promise.all(
            mints.map(mint => getMint(this.connection, mint, 'confirmed'))
        ).catch(() => []);
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

        const notSortedTokensList = [...prevFetchedTokens, ...splApiTokens];
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
