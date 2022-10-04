import { BridgersSourceFlag } from 'src/features/common/providers/bridgers/models/bridgers-source-flag';

export interface BridgersUpdateDataAndStatusRequest {
    hash: string;
    fromTokenChain: string;
    sourceFlag: BridgersSourceFlag;
}

export interface BridgersUpdateDataAndStatusResponse {
    data: {
        orderId?: string;
    };
}
