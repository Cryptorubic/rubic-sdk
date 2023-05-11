import BigNumber from 'bignumber.js';
import { PriceTokenAmount } from 'src/common/tokens';
import { parseError } from 'src/common/utils/errors';
import { deadlineMinutesTimestamp } from 'src/common/utils/options';
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
import { PoolInfo } from 'src/features/on-chain/calculation-manager/providers/dexes/zksync/models/pool-info';
import { syncSwapAbi } from 'src/features/on-chain/calculation-manager/providers/dexes/zksync/sync-swap/sync-swap-abi';

export class SyncSwapTrade extends EvmOnChainTrade {
    public readonly dexContractAddress = '0x2da10A1e27bF85cEdD8FFb1AbBe97e53391C0295';

    private readonly poolData: PoolInfo;

    /** @internal */
    public static async getGasLimit(
        tradeStruct: EvmOnChainTradeStruct & { poolData: PoolInfo }
    ): Promise<BigNumber | null> {
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

    constructor(
        tradeStruct: EvmOnChainTradeStruct & { poolData: PoolInfo },
        providerAddress: string
    ) {
        super(tradeStruct, providerAddress);

        this.nativeSupportedFromWithoutFee = createTokenNativeAddressProxy(
            tradeStruct.fromWithoutFee,
            oneinchApiParams.nativeAddress
        );
        this.nativeSupportedTo = createTokenNativeAddressProxy(
            tradeStruct.to,
            oneinchApiParams.nativeAddress
        );
        this.poolData = tradeStruct.poolData;
    }

    public async encodeDirect(options: EncodeTransactionOptions): Promise<EvmEncodeConfig> {
        await this.checkFromAddress(options.fromAddress, true);
        await this.checkReceiverAddress(options.receiverAddress);

        try {
            const params = this.getCallParameters(options?.receiverAddress);
            const gasParams = this.getGasParams(options);
            const value = this.from.isNative ? this.from.stringWeiAmount : '0';

            return EvmWeb3Pure.encodeMethodCall(
                this.dexContractAddress,
                syncSwapAbi,
                'swap',
                params,
                value,
                gasParams
            );
        } catch (err) {
            console.debug(err);
            throw parseError(err);
        }
    }

    private getCallParameters(receiverAddress?: string): unknown[] {
        const poolType = this.to.isNative ? '1' : '2';
        const swapData = EvmWeb3Pure.encodeParameters(
            ['address', 'address', 'uint8'],
            [this.from.address, receiverAddress || this.walletAddress, poolType]
        );
        const steps = [
            {
                pool: this.poolData.pool,
                data: swapData,
                callback: EvmWeb3Pure.EMPTY_ADDRESS,
                callbackData: '0x'
            }
        ];
        const paths = [
            {
                steps,
                tokenIn: this.from.address,
                amountIn: this.fromWithoutFee.stringWeiAmount
            }
        ];
        return [paths, this.toTokenAmountMin.stringWeiAmount, String(deadlineMinutesTimestamp(30))];
    }
}
