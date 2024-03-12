import { RubicSdkError } from 'src/common/errors';
import { BlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';
import { Injector } from 'src/core/injector/injector';

import { OKUSWAP_API_BASE_URL } from '../constants/okuswap-api';
import {
    OkuQuoteRequestBody,
    OkuQuoteResponse,
    OkuSubProviderInfo,
    OkuSubProvidersRes,
    OkuSwapRequestBody,
    OkuSwapResponse
} from '../models/okuswap-api-types';
import { OKUSWAP_BLOCKCHAINS } from '../models/okuswap-chain-names';
import { OkuSwapSupportedBlockchain } from '../models/okuswap-on-chain-supported-chains';

export class OkuSwapApiService {
    public static async makeQuoteRequest(
        subProvider: string,
        body: OkuQuoteRequestBody
    ): Promise<OkuQuoteResponse> {
        try {
            const res = await Injector.httpClient.post<OkuQuoteResponse>(
                `${OKUSWAP_API_BASE_URL}/${subProvider}/swap_quote`,
                body
            );

            return res;
        } catch (err) {
            throw new RubicSdkError(`[OKUSWAP] Err in api-method makeQuoteRequest - ${err}!`);
        }
    }

    public static async makeSwapRequest(
        subProvider: string,
        body: OkuSwapRequestBody
    ): Promise<Pick<EvmEncodeConfig, 'data' | 'to' | 'value'>> {
        try {
            const { trade } = await Injector.httpClient.post<OkuSwapResponse>(
                `${OKUSWAP_API_BASE_URL}/${subProvider}/execution_information`,
                body
            );

            return {
                to: trade.to,
                data: trade.data,
                value: trade.value
            };
        } catch (err) {
            throw new RubicSdkError(`[OKUSWAP] Err in api-method makeSwapRequest - ${err}!`);
        }
    }

    public static async getOkuSubProvidersForChain(blockchain: BlockchainName): Promise<string[]> {
        try {
            const { status: subProviders } = await Injector.httpClient.get<OkuSubProvidersRes>(
                `${OKUSWAP_API_BASE_URL}/overview`
            );
            const availableSubProviders = subProviders
                .filter(p => this.isSupportedProvider(p, blockchain))
                .map(p => p.name);

            return availableSubProviders;
        } catch (err) {
            throw new RubicSdkError(
                `[OKUSWAP] Err in api-method getOkuSubProvidersForChain - ${err}!`
            );
        }
    }

    private static isSupportedProvider(
        provider: OkuSubProviderInfo,
        blockchain: BlockchainName
    ): boolean {
        return (
            provider.active &&
            !!provider.report?.chains.includes(
                OKUSWAP_BLOCKCHAINS[blockchain as OkuSwapSupportedBlockchain]
            )
        );
    }
}
