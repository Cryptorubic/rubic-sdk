import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { ZrxQuoteResponse } from 'src/features/on-chain/calculation-manager/providers/dexes/common/zrx-abstract/models/zrx-types';
import { UnsupportedReceiverAddressError } from 'src/common/errors';
import { GasFeeInfo } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/models/gas-fee-info';
import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { PriceTokenAmount, Token } from 'src/common/tokens';
import { EvmOnChainTrade } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/evm-on-chain-trade';
import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';
import { EncodeTransactionOptions } from 'src/features/common/models/encode-transaction-options';
import BigNumber from 'bignumber.js';
import { Injector } from 'src/core/injector/injector';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';

interface ZrxTradeStruct {
    from: PriceTokenAmount<EvmBlockchainName>;
    to: PriceTokenAmount<EvmBlockchainName>;
    slippageTolerance: number;
    apiTradeData: ZrxQuoteResponse;
    path: ReadonlyArray<Token>;
    gasFeeInfo?: GasFeeInfo;
}

export class ZrxTrade extends EvmOnChainTrade {
    /** @internal */
    public static async getGasLimit(
        from: PriceTokenAmount<EvmBlockchainName>,
        to: PriceTokenAmount<EvmBlockchainName>,
        apiTradeData: ZrxQuoteResponse,
        useProxy: boolean
    ): Promise<BigNumber | null> {
        const fromBlockchain = from.blockchain;
        const walletAddress =
            Injector.web3PrivateService.getWeb3PrivateByBlockchain(fromBlockchain).address;
        if (!walletAddress) {
            return null;
        }

        try {
            const transactionConfig = await new ZrxTrade(
                {
                    from,
                    to,
                    slippageTolerance: 0.02,
                    apiTradeData,
                    path: []
                },
                useProxy,
                EvmWeb3Pure.EMPTY_ADDRESS
            ).encode({ fromAddress: walletAddress });

            const web3Public = Injector.web3PublicService.getWeb3Public(fromBlockchain);
            const gasLimit = (
                await web3Public.batchEstimatedGas(walletAddress, [transactionConfig])
            )[0];

            if (!gasLimit?.isFinite()) {
                return null;
            }
            return gasLimit;
        } catch (_err) {
            return null;
        }
    }

    public readonly from: PriceTokenAmount<EvmBlockchainName>;

    public readonly to: PriceTokenAmount<EvmBlockchainName>;

    /**
     * In Zrx you can't change slippage after calculation is done.
     */
    public readonly slippageTolerance: number;

    public gasFeeInfo: GasFeeInfo | null;

    private readonly apiTradeData: ZrxQuoteResponse;

    public readonly dexContractAddress: string;

    public readonly path: ReadonlyArray<Token>;

    public get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.ZRX;
    }

    constructor(tradeStruct: ZrxTradeStruct, useProxy: boolean, providerAddress: string) {
        super(useProxy, providerAddress);

        this.from = tradeStruct.from;
        this.to = tradeStruct.to;
        this.gasFeeInfo = tradeStruct.gasFeeInfo || null;
        this.slippageTolerance = tradeStruct.slippageTolerance;
        this.apiTradeData = tradeStruct.apiTradeData;
        this.dexContractAddress = this.apiTradeData.to;
        this.path = tradeStruct.path;
    }

    public async encodeDirect(options: EncodeTransactionOptions): Promise<EvmEncodeConfig> {
        if (options?.receiverAddress) {
            throw new UnsupportedReceiverAddressError();
        }

        const { gas, gasPrice } = this.getGasParams(options);

        return {
            to: this.apiTradeData.to,
            data: this.apiTradeData.data,
            value: this.apiTradeData.value,
            gas,
            gasPrice
        };
    }
}
