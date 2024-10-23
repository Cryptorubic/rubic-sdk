export type TonCenterResp<SuccessRespType> = TonCenterFailResp | SuccessRespType;

export interface TonCenterFailResp {
    detail: Array<{ msg: string }>;
}

export interface TonCenterBlocksResp {
    blocks: TonCenterBlockInfo[];
}

export interface TonCenterBlockInfo {
    workchain: 0 | -1;
    shard: string;
    seqno: number;
    root_hash: string;
    file_hash: string;
}
