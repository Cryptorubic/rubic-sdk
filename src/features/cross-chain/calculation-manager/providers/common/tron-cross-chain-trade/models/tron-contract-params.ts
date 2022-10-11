import { ContractParams } from 'src/features/cross-chain/calculation-manager/providers/common/models/contract-params';

export interface TronContractParams extends ContractParams {
    feeLimit: number;
}
