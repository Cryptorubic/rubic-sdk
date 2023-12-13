import BigNumber from 'bignumber.js';
import { EvmWeb3Private } from 'src/core/blockchain/web3-private-service/web3-private/evm-web3-private/evm-web3-private';
import { EvmWeb3Public } from 'src/core/blockchain/web3-public-service/web3-public/evm-web3-public/evm-web3-public';
import { Injector } from 'src/core/injector/injector';
import { pulseChainContractAddress } from 'src/features/cross-chain/calculation-manager/providers/pulse-chain-bridge/constants/pulse-chain-contract-address';
import { PulseChainCrossChainSupportedBlockchain } from 'src/features/cross-chain/calculation-manager/providers/pulse-chain-bridge/constants/pulse-chain-supported-blockchains';

export abstract class OmniBridge {
    protected get sourceBridgeAddress(): string {
        return pulseChainContractAddress[this.sourceBlockchain];
    }

    protected get targetBridgeAddress(): string {
        return pulseChainContractAddress[this.targetBlockchain];
    }

    protected constructor(
        private readonly sourceBlockchain: PulseChainCrossChainSupportedBlockchain,
        private readonly targetBlockchain: PulseChainCrossChainSupportedBlockchain
    ) {}

    protected get web3Private(): EvmWeb3Private {
        return Injector.web3PrivateService.getWeb3PrivateByBlockchain(this.sourceBlockchain);
    }

    protected get sourceWeb3Public(): EvmWeb3Public {
        return Injector.web3PublicService.getWeb3Public(this.sourceBlockchain);
    }

    protected get targetWeb3Public(): EvmWeb3Public {
        return Injector.web3PublicService.getWeb3Public(this.targetBlockchain);
    }

    /**
     * Check if token registered in source network.
     * @param address Token address in source network.
     */
    public abstract isTokenRegistered(address: string): Promise<boolean>;

    /**
     * Check if registered is native bridge token.
     * @param address Token address in source network.
     */
    protected abstract isRegisteredAsNative(address: string): Promise<boolean>;

    /**
     * Fetch target token address for non native token.
     * @param address Token address in source network.
     */
    protected abstract getNonNativeToken(address: string): Promise<string>;

    /**
     * Fetch target token address for native token.
     * @param address Token address in source network.
     */
    protected abstract getNativeToken(address: string): Promise<string>;

    /**
     * Get bridge token address in target network.
     * @param fromAddress Token address in source network.
     */
    public async getBridgeToken(fromAddress: string): Promise<string> {
        const isRegisteredAsNative = await this.isRegisteredAsNative(fromAddress);
        return isRegisteredAsNative
            ? this.getNativeToken(fromAddress)
            : this.getNonNativeToken(fromAddress);
    }

    /**
     * Get min swap amount in source network.
     * @param address Token address in source network.
     */
    public abstract getMinAmountToken(address: string): Promise<BigNumber>;

    /**
     * Check if token allowed to send in source network (min/max amounts, daily limits).
     * @param address Token address in source network.
     * @param amount Swap amount.
     */
    protected abstract checkSourceLimits(address: string, amount: string): Promise<void>;

    /**
     * Check if token allowed to get in target network (min/max amounts, daily limits).
     * @param address Token address in target network.
     * @param amount Swap amount.
     */
    protected abstract checkTargetLimits(address: string, amount: string): Promise<void>;

    /**
     * Check if allowed to swap.
     * @param fromAddress Token address in source network.
     * @param toAddress Token address in target network.
     * @param amount Swap amount.
     */
    public async checkLimits(
        fromAddress: string,
        toAddress: string,
        amount: string
    ): Promise<void> {
        await this.checkSourceLimits(fromAddress, amount);
        await this.checkTargetLimits(toAddress, amount);
    }

    /**
     * Get fee manager address.
     */
    protected abstract getFeeManager(): Promise<string>;

    /**
     *
     * Get fee type for trade.
     */
    protected abstract getFeeType(): Promise<string>;

    /**
     * Calculate output amount for trade.
     * @param toAddress Token address in target network.
     * @param feeManagerAddress Fee manager contract address.
     * @param feeType Type of fee.
     */
    protected abstract getOutputAmount(
        toAddress: string,
        feeManagerAddress: string,
        feeType: string
    ): Promise<BigNumber>;

    /**
     * Calculate output amount for trade.
     * @param toAddress Token address in target network.
     */
    public async calculateAmount(toAddress: string): Promise<BigNumber> {
        const feeManagerAddress = await this.getFeeManager();
        const feeType = await this.getFeeType();
        return this.getOutputAmount(toAddress, feeManagerAddress, feeType);
    }
}
