import BigNumber from 'bignumber.js';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { EvmWeb3Private } from 'src/core/blockchain/web3-private-service/web3-private/evm-web3-private/evm-web3-private';
import { EvmWeb3Public } from 'src/core/blockchain/web3-public-service/web3-public/evm-web3-public/evm-web3-public';
import { Injector } from 'src/core/injector/injector';
import { feeManagerAbi } from 'src/features/cross-chain/calculation-manager/providers/pulse-chain-bridge/constants/fee-manager-abi';
import { foreignBridgeAbi } from 'src/features/cross-chain/calculation-manager/providers/pulse-chain-bridge/constants/foreign-bridge-abi';
import { homeBridgeAbi } from 'src/features/cross-chain/calculation-manager/providers/pulse-chain-bridge/constants/home-bridge-abi';
import { pulseChainContractAddress } from 'src/features/cross-chain/calculation-manager/providers/pulse-chain-bridge/constants/pulse-chain-contract-address';
import { PulseChainCrossChainSupportedBlockchain } from 'src/features/cross-chain/calculation-manager/providers/pulse-chain-bridge/constants/pulse-chain-supported-blockchains';
import { AbiItem } from 'web3-utils';

export abstract class OmniBridge {
    protected readonly sourceBridgeAddress: string;

    protected readonly targetBridgeAddress: string;

    protected readonly sourceBridgeAbi: AbiItem[];

    protected readonly targetBridgeAbi: AbiItem[];

    protected get web3Private(): EvmWeb3Private {
        return Injector.web3PrivateService.getWeb3PrivateByBlockchain(this.sourceBlockchain);
    }

    protected get sourceWeb3Public(): EvmWeb3Public {
        return Injector.web3PublicService.getWeb3Public(this.sourceBlockchain);
    }

    protected get targetWeb3Public(): EvmWeb3Public {
        return Injector.web3PublicService.getWeb3Public(this.targetBlockchain);
    }

    protected constructor(
        private readonly sourceBlockchain: PulseChainCrossChainSupportedBlockchain,
        private readonly targetBlockchain: PulseChainCrossChainSupportedBlockchain
    ) {
        this.sourceBridgeAddress = pulseChainContractAddress[sourceBlockchain];
        this.targetBridgeAddress = pulseChainContractAddress[targetBlockchain];

        if (sourceBlockchain === BLOCKCHAIN_NAME.ETHEREUM) {
            this.sourceBridgeAbi = foreignBridgeAbi;
            this.targetBridgeAbi = homeBridgeAbi;
        } else {
            this.sourceBridgeAbi = foreignBridgeAbi;
            this.targetBridgeAbi = homeBridgeAbi;
        }
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
    private getFeeManager(): Promise<string> {
        const web3Public = Injector.web3PublicService.getWeb3Public(BLOCKCHAIN_NAME.PULSECHAIN);
        return web3Public.callContractMethod<string>(
            pulseChainContractAddress[BLOCKCHAIN_NAME.PULSECHAIN],
            homeBridgeAbi,
            'feeManager',
            []
        );
    }

    /**
     *
     * Get fee type for trade.
     */
    private getFeeType(): Promise<string> {
        const web3Public = Injector.web3PublicService.getWeb3Public(BLOCKCHAIN_NAME.PULSECHAIN);
        return web3Public.callContractMethod<string>(
            pulseChainContractAddress[BLOCKCHAIN_NAME.PULSECHAIN],
            feeManagerAbi,
            this.sourceBlockchain === BLOCKCHAIN_NAME.ETHEREUM
                ? 'FOREIGN_TO_HOME_FEE'
                : 'HOME_TO_FOREIGN_FEE',
            []
        );
    }

    /**
     * Calculate output amount for trade.
     * @param toAddress Token address in target network.
     * @param feeManagerAddress Fee manager contract address.
     * @param feeType Type of fee.
     * @param fromAmount Amount of tokens to send.
     */
    private async getOutputAmount(
        toAddress: string,
        feeManagerAddress: string,
        feeType: string,
        fromAmount: string
    ): Promise<BigNumber> {
        const web3Public = Injector.web3PublicService.getWeb3Public(BLOCKCHAIN_NAME.PULSECHAIN);
        const amount = await web3Public.callContractMethod<string>(
            feeManagerAddress,
            feeManagerAbi,
            'calculateFee',
            [feeType, toAddress, fromAmount]
        );
        return new BigNumber(amount);
    }

    /**
     * Calculate output amount for trade.
     * @param toAddress Token address in target network.
     * @param fromAmount Amount of tokens to send.
     */
    public async calculateAmount(toAddress: string, fromAmount: string): Promise<BigNumber> {
        const feeManagerAddress = await this.getFeeManager();
        const feeType = await this.getFeeType();
        return this.getOutputAmount(toAddress, feeManagerAddress, feeType, fromAmount);
    }
}
