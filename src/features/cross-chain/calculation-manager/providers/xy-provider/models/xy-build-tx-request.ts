import { XyCrossChainQuoteRequest } from 'src/features/cross-chain/calculation-manager/providers/xy-provider/models/xy-cross-chain-quote-request';

export interface XyBuildTxRequest extends XyCrossChainQuoteRequest {
    /**
     * Destination chain quote token receiver.
     */
    receiver: string;

    /**
     * Source chain bridge token address.
     */
    srcBridgeTokenAddress?: string;

    /**
     * Destination chain bridge token address.
     */
    dstBridgeTokenAddress?: string;
}
