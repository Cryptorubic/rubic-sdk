import { ContractParams } from 'src/features/cross-chain/providers/common/models/contract-params';

export interface TronContractParams extends ContractParams {
    feeLimit: number;
}
