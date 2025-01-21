import { CrossChainTransferTradeParams } from '../../common/cross-chain-transfer-trade/models/cross-chain-transfer-trade-params';
import { ChangellyToken } from './changelly-token';

export interface ChangellyCcrTradeParams extends CrossChainTransferTradeParams {
    changellyTokens: { fromToken: ChangellyToken; toToken: ChangellyToken };
}
