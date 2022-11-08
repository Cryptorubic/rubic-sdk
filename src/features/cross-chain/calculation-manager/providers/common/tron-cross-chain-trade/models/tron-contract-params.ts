import { ContractParams } from 'src/features/common/models/contract-params';

export interface TronContractParams extends ContractParams {
    feeLimit: number;
}
