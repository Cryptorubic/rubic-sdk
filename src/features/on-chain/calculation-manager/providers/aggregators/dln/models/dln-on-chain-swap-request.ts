import { DlnOnChainEstimateRequest } from 'src/features/on-chain/calculation-manager/providers/aggregators/dln/models/dln-on-chain-estimate-request';

export interface DlnOnChainSwapRequest extends DlnOnChainEstimateRequest {
    tokenOutRecipient: string;
    referralCode: string;
}
