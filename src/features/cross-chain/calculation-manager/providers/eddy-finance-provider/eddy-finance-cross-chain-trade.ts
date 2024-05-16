
import { PriceTokenAmount } from "src/common/tokens";
import { EvmBlockchainName } from "src/core/blockchain/models/blockchain-name";
import { CROSS_CHAIN_TRADE_TYPE } from "../../models/cross-chain-trade-type";
import { EvmCrossChainTrade } from "../common/emv-cross-chain-trade/evm-cross-chain-trade";
import { GasData } from "../common/emv-cross-chain-trade/models/gas-data";
import { BridgeType, BRIDGE_TYPE } from "../common/models/bridge-type";


export class EddyFinanceCrossChainTrade extends EvmCrossChainTrade{

public readonly type = CROSS_CHAIN_TRADE_TYPE.EDDY_FINANCE;

public readonly from: PriceTokenAmount<EvmBlockchainName>;

public readonly to: PriceTokenAmount<EvmBlockchainName>;

public readonly isAggregator = false;

public readonly gasData: GasData;

public readonly bridgeType = BRIDGE_TYPE.ZETACHAIN;


}