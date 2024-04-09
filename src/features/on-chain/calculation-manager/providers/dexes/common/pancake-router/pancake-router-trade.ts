import { Percent, TradeType } from '@pancakeswap/sdk';
import { SwapRouter } from '@pancakeswap/smart-router/evm';
import { SmartRouterTrade } from '@pancakeswap/smart-router/evm/v3-router/types';
import BigNumber from 'bignumber.js';
import { Injector } from 'src/core/injector/injector';
import { EncodeTransactionOptions } from 'src/features/common/models/encode-transaction-options';
import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { GetToAmountAndTxDataResponse } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-aggregator/models/aggregator-on-chain-types';
import { EvmOnChainTrade } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/evm-on-chain-trade';
import { PancakeRouterTradeStruct } from 'src/features/on-chain/calculation-manager/providers/dexes/common/pancake-router/models/pancake-router-trade-struct';

export class PancakeRouterTrade extends EvmOnChainTrade {
    public static async getGasLimit(
        tradeStruct: PancakeRouterTradeStruct,
        providerAddress: string
    ): Promise<BigNumber | null> {
        const fromBlockchain = tradeStruct.from.blockchain;
        const walletAddress =
            Injector.web3PrivateService.getWeb3PrivateByBlockchain(fromBlockchain).address;
        if (!walletAddress) {
            return null;
        }

        try {
            const transactionConfig = await new PancakeRouterTrade(
                tradeStruct,
                providerAddress
            ).encode({ fromAddress: walletAddress });

            const web3Public = Injector.web3PublicService.getWeb3Public(fromBlockchain);
            const gasLimit = await web3Public.getEstimatedGasByData(
                walletAddress,
                transactionConfig.to,
                {
                    data: transactionConfig.data,
                    value: transactionConfig.value
                }
            );

            if (!gasLimit?.isFinite()) {
                return null;
            }
            return gasLimit;
        } catch (err) {
            console.debug(err);
            return null;
        }
    }

    public get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.PANCAKE_SWAP;
    }

    public readonly dexContractAddress: string;

    protected async getTransactionConfigAndAmount(
        options: EncodeTransactionOptions
    ): Promise<GetToAmountAndTxDataResponse> {
        const slippage = Number.parseInt(String(this.slippageTolerance * 100));
        const slippagePercent = new Percent(slippage, 100);
        const payload = SwapRouter.swapCallParameters(this.trade, {
            slippageTolerance: slippagePercent,
            ...(options.receiverAddress && { recipient: options.receiverAddress as `0x${string}` })
        });
        const config = {
            to: this.dexContractAddress,
            value: payload.value,
            data: payload.calldata
        };

        return { tx: config, toAmount: this.to.stringWeiAmount };
    }

    private readonly trade: SmartRouterTrade<TradeType>;

    constructor(tradeStruct: PancakeRouterTradeStruct, providerAddress: string) {
        super(tradeStruct, providerAddress);
        this.trade = tradeStruct.trade;
        this.dexContractAddress = tradeStruct.dexContractAddress;
    }
}
