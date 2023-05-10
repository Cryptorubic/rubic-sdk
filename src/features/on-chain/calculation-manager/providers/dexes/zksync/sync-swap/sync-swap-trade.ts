import BigNumber from 'bignumber.js';
import { RubicSdkError } from 'src/common/errors';
import { PriceTokenAmount } from 'src/common/tokens';
import { Cache } from 'src/common/utils/decorators';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';
import { Injector } from 'src/core/injector/injector';
import { EncodeTransactionOptions } from 'src/features/common/models/encode-transaction-options';
import { createTokenNativeAddressProxy } from 'src/features/common/utils/token-native-address-proxy';
import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { EvmOnChainTrade } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/evm-on-chain-trade';
import { EvmOnChainTradeStruct } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/models/evm-on-chain-trade-struct';
import { oneinchApiParams } from 'src/features/on-chain/calculation-manager/providers/dexes/common/oneinch-abstract/constants';
import { OneinchTradeStruct } from 'src/features/on-chain/calculation-manager/providers/dexes/common/oneinch-abstract/models/oneinch-trade-struct';
import { getOneinchApiBaseUrl } from 'src/features/on-chain/calculation-manager/providers/dexes/common/oneinch-abstract/utils';

export class SyncSwapTrade extends EvmOnChainTrade {
    public readonly dexContractAddress = '0x2da10A1e27bF85cEdD8FFb1AbBe97e53391C0295';

    /** @internal */
    public static async getGasLimit(tradeStruct: OneinchTradeStruct): Promise<BigNumber | null> {
        const fromBlockchain = tradeStruct.from.blockchain;
        const walletAddress =
            Injector.web3PrivateService.getWeb3PrivateByBlockchain(fromBlockchain).address;
        if (!walletAddress) {
            return null;
        }

        try {
            const transactionConfig = await new SyncSwapTrade(
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

    private readonly nativeSupportedFromWithoutFee: PriceTokenAmount;

    private readonly nativeSupportedTo: PriceTokenAmount;

    public get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.SYNC_SWAP;
    }

    @Cache
    private get apiBaseUrl(): string {
        return getOneinchApiBaseUrl(this.from.blockchain);
    }

    constructor(tradeStruct: EvmOnChainTradeStruct, providerAddress: string) {
        super(tradeStruct, providerAddress);

        this.nativeSupportedFromWithoutFee = createTokenNativeAddressProxy(
            tradeStruct.fromWithoutFee,
            oneinchApiParams.nativeAddress
        );
        this.nativeSupportedTo = createTokenNativeAddressProxy(
            tradeStruct.to,
            oneinchApiParams.nativeAddress
        );
    }

    public async encodeDirect(_options: EncodeTransactionOptions): Promise<EvmEncodeConfig> {
        // await this.checkFromAddress(options.fromAddress, true);
        // await this.checkReceiverAddress(options.receiverAddress);
        //
        // try {
        //     const apiTradeData = await this.getTradeData(
        //         true,
        //         options.fromAddress,
        //         options.receiverAddress
        //     );
        //     const { gas, gasPrice } = this.getGasParams(options, {
        //         gasLimit: apiTradeData.tx.gas.toString(),
        //         gasPrice: apiTradeData.tx.gasPrice
        //     });
        //
        //     return {
        //         ...apiTradeData.tx,
        //         gas,
        //         gasPrice
        //     };
        // } catch (err) {
        //     const inchSpecificError = this.specifyError(err);
        //     if (inchSpecificError) {
        //         throw inchSpecificError;
        //     }
        //     if ([400, 500, 503].includes(err.code)) {
        //         throw new SwapRequestError();
        //     }
        //     if (this.isDeflationError()) {
        //         throw new LowSlippageDeflationaryTokenError();
        //     }
        //     throw parseError(err, err?.response?.data?.description || err.message);
        // }
        throw new RubicSdkError('Test');
    }
}
