import { Percent, TradeType } from '@pancakeswap/sdk';
import { SwapRouter } from '@pancakeswap/smart-router/evm';
import { SmartRouterTrade } from '@pancakeswap/smart-router/evm/v3-router/types';
import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';
import { EncodeTransactionOptions } from 'src/features/common/models/encode-transaction-options';
import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { EvmOnChainTrade } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/evm-on-chain-trade';
import { PancakeRouterTradeStruct } from 'src/features/on-chain/calculation-manager/providers/dexes/common/pancake-router/models/pancake-router-trade-struct';
export class PancakeRouterTrade extends EvmOnChainTrade {
    public get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.PANCAKE_SWAP;
    }

    public readonly dexContractAddress: string;

    public async encodeDirect(options: EncodeTransactionOptions): Promise<EvmEncodeConfig> {
        const slippage = Number.parseInt(String(this.slippageTolerance * 100));
        const slippagePercent = new Percent(slippage, 100);
        const payload = SwapRouter.swapCallParameters(this.trade, {
            slippageTolerance: slippagePercent,
            ...(options.receiverAddress && { recipient: options.receiverAddress as `0x${string}` })
        });
        return {
            to: this.dexContractAddress,
            value: payload.value,
            data: payload.calldata
        };
    }

    private readonly trade: SmartRouterTrade<TradeType>;

    constructor(tradeStruct: PancakeRouterTradeStruct, providerAddress: string) {
        super(tradeStruct, providerAddress);
        this.trade = tradeStruct.trade;
        this.dexContractAddress = tradeStruct.dexContractAddress;
    }
}
