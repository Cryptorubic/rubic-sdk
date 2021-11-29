import { ContractTrade } from '@features/cross-chain/models/ContractTrade/ContractTrade';

export class CrossChainTrade {
    constructor(
        private readonly fromTrade: ContractTrade,
        private readonly toTrade: ContractTrade
    ) {}
}
