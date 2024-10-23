import { ZERO_ADDRESS } from '@1inch/limit-order-protocol-utils';
import BigNumber from 'bignumber.js';
import { PriceTokenAmount } from 'src/common/tokens';
import { deadlineMinutesTimestamp } from 'src/common/utils/options';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { Injector } from 'src/core/injector/injector';
import { EncodeTransactionOptions } from 'src/features/common/models/encode-transaction-options';
import { createTokenNativeAddressProxy } from 'src/features/common/utils/token-native-address-proxy';
import { oneinchApiParams } from 'src/features/on-chain/calculation-manager/providers/aggregators/1inch/constants/constants';
import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { EvmEncodedConfigAndToAmount } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-aggregator/models/aggregator-on-chain-types';
import { EvmOnChainTrade } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/evm-on-chain-trade';
import { EvmOnChainTradeStruct } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/models/evm-on-chain-trade-struct';
import { syncSwapAbi } from 'src/features/on-chain/calculation-manager/providers/dexes/common/sync-swap-abstract/sync-swap-abi';
import { BestPathsWithAmounts } from 'src/features/on-chain/calculation-manager/providers/dexes/common/sync-swap-abstract/utils/typings';

export class SyncSwapAbstractTrade extends EvmOnChainTrade {
    public readonly dexContractAddress: string;

    private readonly bestPathWithAmounts: BestPathsWithAmounts;

    /** @internal */
    public static async getGasLimit(
        tradeStruct: EvmOnChainTradeStruct & { bestPathWithAmounts: BestPathsWithAmounts },
        dexContractAddress: string,
        providerAddress: string
    ): Promise<BigNumber | null> {
        const fromBlockchain = tradeStruct.from.blockchain;
        const walletAddress =
            Injector.web3PrivateService.getWeb3PrivateByBlockchain(fromBlockchain).address;
        if (!walletAddress) {
            return null;
        }

        try {
            const transactionConfig = await new SyncSwapAbstractTrade(
                tradeStruct,
                providerAddress || EvmWeb3Pure.EMPTY_ADDRESS,
                dexContractAddress
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
        tradeStruct: EvmOnChainTradeStruct & { bestPathWithAmounts: BestPathsWithAmounts },
        providerAddress: string,
        dexContractAddress: string
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
        this.bestPathWithAmounts = tradeStruct.bestPathWithAmounts;
        this.dexContractAddress = dexContractAddress;
    }

    protected async getTransactionConfigAndAmount(
        options: EncodeTransactionOptions
    ): Promise<EvmEncodedConfigAndToAmount> {
        await this.checkFromAddress(options.fromAddress, true);
        await this.checkReceiverAddress(options.receiverAddress);

        const params = this.getCallParameters(options?.receiverAddress);
        const gasParams = this.getGasParams(options);
        const value = this.from.isNative ? this.from.stringWeiAmount : '0';

        const config = EvmWeb3Pure.encodeMethodCall(
            this.dexContractAddress,
            syncSwapAbi,
            'swap',
            params,
            value,
            gasParams
        );

        return { tx: config, toAmount: this.to.stringWeiAmount };
    }

    public getCallParameters(receiverAddress?: string): unknown[] {
        const paths = this.bestPathWithAmounts.pathsWithAmounts.map(path => {
            const pathTokenInRoute = path.stepsWithAmount[0]!.tokenIn;
            const pathTokenIn = this.from.isNative ? ZERO_ADDRESS : pathTokenInRoute;

            return {
                steps: path.stepsWithAmount.map((step, i) => {
                    const isLastStep = i === path.stepsWithAmount.length - 1;
                    const stepTo = isLastStep
                        ? receiverAddress || this.walletAddress
                        : path.stepsWithAmount[i + 1]!.pool.pool;

                    let withdrawMode = 0;
                    if (isLastStep) {
                        withdrawMode = this.to.isNative ? 1 : 2;
                    }

                    const data = EvmWeb3Pure.encodeParameters(
                        ['address', 'address', 'uint8'],
                        [step.tokenIn, stepTo, withdrawMode]
                    );

                    return {
                        pool: step.pool.pool,
                        data,
                        callback: ZERO_ADDRESS,
                        callbackData: '0x'
                    };
                }),

                tokenIn: pathTokenIn,
                amountIn: path.amountIn
            };
        });
        return [paths, this.toTokenAmountMin.stringWeiAmount, String(deadlineMinutesTimestamp(30))];
    }
}
