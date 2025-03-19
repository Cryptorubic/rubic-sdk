import { RubicSdkError } from 'src/common/errors';
import { wrappedAddress } from 'src/common/tokens/constants/wrapped-addresses';
import { compareAddresses } from 'src/common/utils/blockchain';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { EncodeTransactionOptions } from 'src/features/common/models/encode-transaction-options';
import { wrapAbi } from 'src/features/on-chain/calculation-manager/providers/common/evm-wrap-trade/wrap-abi';
import { ON_CHAIN_TRADE_TYPE } from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { EvmEncodedConfigAndToAmount } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-aggregator/models/aggregator-on-chain-types';
import { EvmOnChainTrade } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/evm-on-chain-trade';
import { EvmOnChainTradeStruct } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/models/evm-on-chain-trade-struct';

export class EvmWrapTrade extends EvmOnChainTrade {
    public get dexContractAddress(): string {
        return this.from.isNative ? this.to.address : this.from.address;
    }

    public readonly type = ON_CHAIN_TRADE_TYPE.WRAPPED;

    protected async getTransactionConfigAndAmount(
        options: EncodeTransactionOptions
    ): Promise<EvmEncodedConfigAndToAmount> {
        await this.checkFromAddress(options.fromAddress, true);

        const methodName = this.from.isNative ? 'deposit' : 'withdraw';
        const gasParams = this.getGasParams(options);

        const config = EvmWeb3Pure.encodeMethodCall(
            this.dexContractAddress,
            wrapAbi,
            methodName,
            this.from.isNative ? [] : [this.from.stringWeiAmount],
            this.from.isNative ? this.from.stringWeiAmount : '0',
            gasParams
        );

        return { tx: config, toAmount: this.to.stringWeiAmount };
    }

    public constructor(evmOnChainTradeStruct: EvmOnChainTradeStruct, providerAddress: string) {
        super(evmOnChainTradeStruct, providerAddress);
    }

    public static isSupportedBlockchain(blockchain: EvmBlockchainName): boolean {
        return Boolean(wrappedAddress?.[blockchain]);
    }

    public static isSupportedTrade(
        blockchain: EvmBlockchainName,
        fromAddress: string,
        toAddress: string
    ): boolean {
        if (!EvmWrapTrade.isSupportedBlockchain) {
            throw new RubicSdkError('Trade is not supported');
        }
        const wethAddress = wrappedAddress[blockchain]!;

        return (
            (compareAddresses(fromAddress, EvmWeb3Pure.EMPTY_ADDRESS) &&
                compareAddresses(toAddress, wethAddress)) ||
            (compareAddresses(toAddress, EvmWeb3Pure.EMPTY_ADDRESS) &&
                compareAddresses(fromAddress, wethAddress))
        );
    }
}
