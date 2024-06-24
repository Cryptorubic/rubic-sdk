import { TX_STATUS } from 'src/core/blockchain/web3-public-service/web3-public/models/tx-status';
import { Injector } from 'src/core/injector/injector';
import { TxStatusData } from 'src/features/common/status-manager/models/tx-status-data';
import { CrossChainTradeData } from 'src/features/cross-chain/status-manager/models/cross-chain-trade-data';

interface SrcHashResponse {
    inTxHashToCctx: {
        cctx_index: string[];
    };
}

interface CctxHashResponse {
    CrossChainTx?: {
        outbound_tx_params?: Array<{ outbound_tx_hash: string }>;
    };
}

export async function getEddyBridgeDstSwapStatus(data: CrossChainTradeData): Promise<TxStatusData> {
    const srcRes = await Injector.httpClient.get<SrcHashResponse>(
        `https://zetachain.blockpi.network/lcd/v1/public/zeta-chain/crosschain/inTxHashToCctx/${data.srcTxHash}`
    );
    const cctxHash = srcRes.inTxHashToCctx.cctx_index[0];

    const cctxRes = await Injector.httpClient.get<CctxHashResponse>(`
        https://zetachain.blockpi.network/lcd/v1/public/zeta-chain/crosschain/cctx/${cctxHash}
    `);
    const dstTxHash = cctxRes.CrossChainTx?.outbound_tx_params?.[0]?.outbound_tx_hash;

    if (dstTxHash) {
        return {
            hash: dstTxHash,
            status: TX_STATUS.SUCCESS
        };
    }

    return {
        hash: null,
        status: TX_STATUS.PENDING
    };
}
