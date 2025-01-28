import { RubicSdkError } from 'src/common/errors';
import { Cache } from 'src/common/utils/decorators';
import { BlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';
import { Injector } from 'src/core/injector/injector';

import { RUBIC_X_API_APIKEY, RUBIC_X_API_OKU_BASE_URL } from '../constants/okuswap-api';
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
    @Cache({
        maxAge: 15_000
    })
    public static async makeQuoteRequest(
        subProvider: string,
        body: OkuQuoteRequestBody
    ): Promise<OkuQuoteResponse> {
        try {
            return Injector.httpClient.post<OkuQuoteResponse>(
                `${RUBIC_X_API_OKU_BASE_URL}/${subProvider}/swap_quote`,
                body,
                {
                    headers: {
                        apikey: RUBIC_X_API_APIKEY
                    }
                }
            );
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
                `${RUBIC_X_API_OKU_BASE_URL}/${subProvider}/execution_information`,
                body,
                {
                    headers: {
                        apikey: RUBIC_X_API_APIKEY
                    }
                }
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

    @Cache({
        maxAge: 15_000
    })
    public static async getOkuSubProvidersForChain(blockchain: BlockchainName): Promise<string[]> {
        try {
            const { status: subProviders } = await Injector.httpClient.get<OkuSubProvidersRes>(
                `${RUBIC_X_API_OKU_BASE_URL}/overview`,
                {
                    headers: {
                        apikey: RUBIC_X_API_APIKEY
                    }
                }
            );
            return subProviders
                .filter(p => this.isSupportedProvider(p, blockchain))
                .map(p => p.name);
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
