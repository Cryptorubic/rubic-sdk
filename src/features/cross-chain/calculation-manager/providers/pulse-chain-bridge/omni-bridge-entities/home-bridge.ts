import BigNumber from 'bignumber.js';
import { RubicSdkError } from 'src/common/errors';
import { PulseChainCrossChainSupportedBlockchain } from 'src/features/cross-chain/calculation-manager/providers/pulse-chain-bridge/constants/pulse-chain-supported-blockchains';
import { OmniBridge } from 'src/features/cross-chain/calculation-manager/providers/pulse-chain-bridge/omni-bridge-entities/omni-bridge';

export class HomeBridge extends OmniBridge {
    constructor(
        sourceBlockchain: PulseChainCrossChainSupportedBlockchain,
        targetBlockchain: PulseChainCrossChainSupportedBlockchain
    ) {
        super(sourceBlockchain, targetBlockchain);
    }

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
            'bridgetTokenAddress',
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
}
