import { CbridgeChain } from 'src/features/cross-chain/calculation-manager/providers/cbridge/models/cbridge-chain';
import { CbridgeChainTokenInfo } from 'src/features/cross-chain/calculation-manager/providers/cbridge/models/cbridge-chain-token-info';
import { PeggedPairConfig } from 'src/features/cross-chain/calculation-manager/providers/cbridge/models/pegged-pair-config';

export interface CbridgeTransferConfigsResponse {
    readonly chains: CbridgeChain[];
    readonly chain_token: { [P: number]: CbridgeChainTokenInfo };
    readonly farming_reward_contract_addr: string;
    readonly pegged_pair_configs: PeggedPairConfig[];
}
