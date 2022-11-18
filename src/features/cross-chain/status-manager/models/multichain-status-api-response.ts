import { MultichainStatusMapping } from 'src/features/cross-chain/status-manager/constants/multichain-status-mapping';

interface Info {
    bind: string;
    confirmations: string;
    formatfee: number;
    formatswapvalue: number;
    formatvalue: number;
    from: string;
    fromChainID: string;
    historyType: string;
    label: string;
    pairid: string;
    status: keyof typeof MultichainStatusMapping;
    statusmsg: string;
    swapinfo: unknown;
    swaptx: string;
    time: number;
    timestamp: number;
    toChainID: string;
    txid: string;
}

export interface MultichainStatusApiResponse {
    info: Partial<Exclude<Info, 'status'>> & Required<Pick<Info, 'status'>>;
    msg: string;
}
