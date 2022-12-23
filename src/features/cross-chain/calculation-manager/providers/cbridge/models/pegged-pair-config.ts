import { CbridgeChainTokenInfo } from 'src/features/cross-chain/calculation-manager/providers/cbridge/models/cbridge-chain-token-info';

export interface PeggedPairConfig {
    readonly org_chain_id: string;
    readonly org_token: CbridgeChainTokenInfo;
    readonly pegged_chain_id: string;
    readonly pegged_token: CbridgeChainTokenInfo;
    readonly pegged_deposit_contract_addr: string;
    readonly pegged_burn_contract_addr: string;
    readonly vault_version: number;
    readonly bridge_version: number;
}
