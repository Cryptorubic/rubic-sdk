import { NotSupportedTokensError } from 'src/common/errors';
import { compareAddresses } from 'src/common/utils/blockchain';
import { Injector } from 'src/core/injector/injector';

import { OwlToAllPairsInfoResponse } from '../models/owl-to-api-types';

export class OwlToApiService {
    private static apiUrl = 'https://owlto.finance/bridge_api/v1';

    public static async getPairInfo(
        srcChainId: number,
        srcTokenAddress: string,
        dstChainId: number,
        dstTokenAddress: string
    ): Promise<void> {
        const { data } = await Injector.httpClient.post<OwlToAllPairsInfoResponse>(
            `${this.apiUrl}/get_all_pair_infos`,
            {
                category: 'Mainnet',
                value_include_gas_fee: true
            }
        );
        const pair = data.pair_infos.find(
            data =>
                compareAddresses(srcTokenAddress, data.from_token_address) &&
                compareAddresses(dstTokenAddress, data.to_token_address) &&
                srcChainId.toString() === data.from_chain_id &&
                dstChainId.toString() === data.to_chain_id
        );
        if (!pair) {
            throw new NotSupportedTokensError();
        }
    }
}
