import { EvmOnChainTradeStruct } from '../../common/on-chain-trade/evm-on-chain-trade/models/evm-on-chain-trade-struct';
import { OdosBestRouteRequestBody } from './odos-api-best-route-types';

export interface OdosOnChainTradeStruct extends EvmOnChainTradeStruct {
    /**
     * Used to get fresh active pathId for swap request
     */
    bestRouteRequestBody: OdosBestRouteRequestBody;
}
