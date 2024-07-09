import { NotSupportedTokensError } from 'src/common/errors';
import { compareAddresses } from 'src/common/utils/blockchain';
import { TX_STATUS } from 'src/core/blockchain/web3-public-service/web3-public/models/tx-status';
import { Injector } from 'src/core/injector/injector';
import { TxStatusData } from 'src/features/common/status-manager/models/tx-status-data';

import {
    OwlToAllPairsInfoResponse,
    OwlToPairInfo,
    OwlTopSwapRequest,
    OwlToStatusResponse,
    OwlToSwapResponse
} from '../models/owl-to-api-types';

export class OwlToApiService {
    private static apiUrl = 'https://owlto.finance/bridge_api/v1';

    public static async getPairInfo(
        srcChainId: number,
        srcTokenAddress: string,
        dstChainId: number,
        dstTokenAddress: string
    ): Promise<OwlToPairInfo> {
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

        return pair;
    }

    public static async getSwapInfo(p: OwlTopSwapRequest): Promise<OwlToSwapResponse['data']> {
        const { data } = await Injector.httpClient.post<OwlToSwapResponse>(
            `${this.apiUrl}/get_build_tx`,
            {
                channel: 828566,
                from_address: p.walletAddress,
                to_address: p.receiverAddress,
                from_chain_name: p.srcChainName,
                to_chain_name: p.dstChainName,
                token_name: p.tokenSymbol,
                ui_value: p.amount,
                value_include_gas_fee: true
            }
        );
        if (!data.txs) {
            throw new NotSupportedTokensError();
        }

        return data;
    }

    public static async getTxStatus(srcTxHash: string): Promise<TxStatusData> {
        const { data } = await Injector.httpClient.post<OwlToStatusResponse>(
            `${this.apiUrl}/get_receipt`,
            {
                from_chain_hash: srcTxHash
            }
        );

        if (data?.to_chain_hash) {
            return {
                status: TX_STATUS.SUCCESS,
                hash: data.to_chain_hash
            };
        }
        return {
            status: TX_STATUS.PENDING,
            hash: null
        };
    }
}
