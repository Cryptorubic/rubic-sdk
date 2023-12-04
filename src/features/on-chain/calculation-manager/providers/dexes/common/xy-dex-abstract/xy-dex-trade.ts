import BigNumber from 'bignumber.js';
import { RubicSdkError } from 'src/common/errors';
import { PriceTokenAmount } from 'src/common/tokens';
import { parseError } from 'src/common/utils/errors';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';
import { Injector } from 'src/core/injector/injector';
import { EncodeTransactionOptions } from 'src/features/common/models/encode-transaction-options';
import { ON_CHAIN_TRADE_TYPE } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { EvmOnChainTrade } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/evm-on-chain-trade';
import { xyApiParams } from 'src/features/on-chain/calculation-manager/providers/dexes/common/xy-dex-abstract/constants';
import { XyDexTradeStruct } from 'src/features/on-chain/calculation-manager/providers/dexes/common/xy-dex-abstract/models/xy-dex-trade-struct';
import { XySwapRequest } from 'src/features/on-chain/calculation-manager/providers/dexes/common/xy-dex-abstract/models/xy-swap-request';
import { XySwapResponse } from 'src/features/on-chain/calculation-manager/providers/dexes/common/xy-dex-abstract/models/xy-swap-response';
import { XyDexAbstractProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/xy-dex-abstract/xy-dex-abstract-provider';

export class XyDexTrade extends EvmOnChainTrade {
    /** @internal */
    public static async getGasLimit(tradeStruct: XyDexTradeStruct): Promise<BigNumber | null> {
        const fromBlockchain = tradeStruct.from.blockchain;
        const walletAddress =
            Injector.web3PrivateService.getWeb3PrivateByBlockchain(fromBlockchain).address;
        if (!walletAddress) {
            return null;
        }

        try {
            const transactionConfig = await new XyDexTrade(
                tradeStruct,
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

    /** @internal */
    public static async checkIfNeedApproveAndThrowError(
        from: PriceTokenAmount,
        fromAddress: string,
        useProxy: boolean
    ): Promise<void | never> {
        const needApprove = await new XyDexTrade(
            {
                from,
                useProxy
            } as XyDexTradeStruct,
            EvmWeb3Pure.EMPTY_ADDRESS
        ).needApprove(fromAddress);
        if (needApprove) {
            throw new RubicSdkError('Approve is needed');
        }
    }

    public readonly dexContractAddress: string;

    public type = ON_CHAIN_TRADE_TYPE.XY_DEX;

    private readonly provider: string;

    constructor(tradeStruct: XyDexTradeStruct, providerAddress: string) {
        super(tradeStruct, providerAddress);
        this.dexContractAddress = tradeStruct.contractAddress;
        this.provider = tradeStruct.provider;
    }

    public async encodeDirect(options: EncodeTransactionOptions): Promise<EvmEncodeConfig> {
        await this.checkFromAddress(options.fromAddress, true);
        await this.checkReceiverAddress(options.receiverAddress);

        try {
            return await this.getTradeData(options.receiverAddress, options.directTransaction);
            // const gasPriceInfo = await getGasPriceInfo(this.from.blockchain);
            //
            // const { gas, gasPrice } = getGasFeeInfo(apiTradeData.routers[0]!.estimatedGas, gasPriceInfo);
            //
            // return {
            //     ...apiTradeData.tx,
            //     gas,
            //     gasPrice
            // };
        } catch (err) {
            throw parseError(err, err?.response?.data?.description || err.message);
        }
    }

    private async getTradeData(
        receiverAddress?: string,
        directTransaction?: EvmEncodeConfig
    ): Promise<EvmEncodeConfig> {
        if (directTransaction) {
            return {
                data: directTransaction.data,
                to: directTransaction.to,
                value: directTransaction.value
            };
        }
        const receiver = receiverAddress || this.walletAddress;

        const chainId = blockchainId[this.from.blockchain];
        const srcQuoteTokenAddress = this.from.isNative
            ? xyApiParams.nativeAddress
            : this.from.address;
        const dstQuoteTokenAddress = this.to.isNative ? xyApiParams.nativeAddress : this.to.address;

        const quoteTradeParams: XySwapRequest = {
            srcChainId: chainId,
            srcQuoteTokenAddress,
            srcQuoteTokenAmount: this.from.stringWeiAmount,
            dstChainId: chainId,
            dstQuoteTokenAddress,
            slippage: this.slippageTolerance * 100,
            receiver,
            srcSwapProvider: this.provider
        };

        const tradeData = await this.httpClient.get<XySwapResponse>(
            `${XyDexAbstractProvider.apiUrl}buildTx`,
            {
                params: { ...quoteTradeParams }
            }
        );

        await EvmOnChainTrade.checkAmountChange(
            tradeData.tx!,
            tradeData.routes[0]!.dstQuoteTokenAmount,
            this.to.stringWeiAmount
        );

        return tradeData.tx;
    }
}
