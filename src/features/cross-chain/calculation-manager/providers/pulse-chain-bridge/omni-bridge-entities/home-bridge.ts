import BigNumber from 'bignumber.js';
import { RubicSdkError } from 'src/common/errors';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/evm-web3-pure';
import { EvmEncodeConfig } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure/models/evm-encode-config';
import { erc677Abi } from 'src/features/cross-chain/calculation-manager/providers/pulse-chain-bridge/constants/erc-677-abi';
import { nativeBridgeAbi } from 'src/features/cross-chain/calculation-manager/providers/pulse-chain-bridge/constants/native-bridge-abi';
import { omniBridgeNativeRouter } from 'src/features/cross-chain/calculation-manager/providers/pulse-chain-bridge/constants/pulse-chain-contract-address';
import { OmniBridge } from 'src/features/cross-chain/calculation-manager/providers/pulse-chain-bridge/omni-bridge-entities/omni-bridge';

export class HomeBridge extends OmniBridge {
    public isTokenRegistered(address: string): Promise<boolean> {
        return this.sourceWeb3Public.callContractMethod<boolean>(
            this.sourceBridgeAddress,
            this.sourceBridgeAbi,
            'isTokenRegistered',
            [address]
        );
    }

    protected isRegisteredAsNative(address: string): Promise<boolean> {
        return this.sourceWeb3Public.callContractMethod<boolean>(
            this.sourceBridgeAddress,
            this.sourceBridgeAbi,
            'isRegisteredAsNativeToken',
            [address]
        );
    }

    protected getNonNativeToken(address: string): Promise<string> {
        return this.sourceWeb3Public.callContractMethod<string>(
            this.sourceBridgeAddress,
            this.sourceBridgeAbi,
            'nativeTokenAddress',
            [address]
        );
    }

    protected getNativeToken(address: string): Promise<string> {
        return this.targetWeb3Public.callContractMethod<string>(
            this.targetBridgeAddress,
            this.targetBridgeAbi,
            'bridgedTokenAddress',
            [address]
        );
    }

    public async getMinAmountToken(address: string): Promise<BigNumber> {
        const amount = await this.sourceWeb3Public.callContractMethod<string>(
            this.sourceBridgeAddress,
            this.sourceBridgeAbi,
            'minPerTx',
            [address]
        );
        return new BigNumber(amount);
    }

    protected async checkSourceLimits(address: string, amount: string): Promise<void> {
        const allowSend = await this.sourceWeb3Public.callContractMethod<string>(
            this.sourceBridgeAddress,
            this.sourceBridgeAbi,
            'withinLimit',
            [address, amount]
        );
        if (!allowSend) {
            throw new RubicSdkError('Swap is not allowed due to contract limitations');
        }
    }

    protected async checkTargetLimits(address: string, amount: string): Promise<void> {
        const allowSend = await this.targetWeb3Public.callContractMethod<string>(
            this.targetBridgeAddress,
            this.targetBridgeAbi,
            'withinExecutionLimit',
            [address, amount]
        );
        if (!allowSend) {
            throw new RubicSdkError('Swap is not allowed due to contract limitations');
        }
    }

    public getDataForNativeSwap(receiverAddress: string, value: string): EvmEncodeConfig {
        return EvmWeb3Pure.encodeMethodCall(
            omniBridgeNativeRouter,
            nativeBridgeAbi,
            'wrapAndRelayTokens',
            [receiverAddress],
            value
        );
    }

    public getDataForTokenSwap(
        receiverAddress: string,
        amount: string,
        isERC677: boolean,
        tokenAddress: string
    ): EvmEncodeConfig {
        if (isERC677) {
            return EvmWeb3Pure.encodeMethodCall(
                tokenAddress,
                erc677Abi,
                'transferAndCall',
                [this.sourceBridgeAddress, amount, receiverAddress],
                '0'
            );
        }

        return EvmWeb3Pure.encodeMethodCall(
            this.sourceBridgeAddress,
            this.sourceBridgeAbi,
            'relayTokens',
            [tokenAddress, receiverAddress, amount],
            '0'
        );
    }
}
