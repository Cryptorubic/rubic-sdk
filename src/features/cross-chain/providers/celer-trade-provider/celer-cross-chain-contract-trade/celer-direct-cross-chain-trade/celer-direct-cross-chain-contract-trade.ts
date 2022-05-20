import { PriceTokenAmount } from '@core/blockchain/tokens/price-token-amount';
import BigNumber from 'bignumber.js';
import { BlockchainsInfo, MAINNET_BLOCKCHAIN_NAME, Web3Pure } from 'src/core';
import { CelerCrossChainContractTrade } from '@features/cross-chain/providers/celer-trade-provider/celer-cross-chain-contract-trade/celer-cross-chain-contract-trade';
import { EMPTY_ADDRESS } from '@core/blockchain/constants/empty-address';
import { CelerCrossChainContractData } from '@features/cross-chain/providers/celer-trade-provider/celer-cross-chain-contract-data';

export class CelerDirectCrossChainContractTrade extends CelerCrossChainContractTrade {
    public readonly fromToken: PriceTokenAmount;

    public readonly toToken: PriceTokenAmount;

    public readonly toTokenAmountMin: BigNumber;

    constructor(
        blockchain: MAINNET_BLOCKCHAIN_NAME,
        contract: CelerCrossChainContractData,
        private readonly token: PriceTokenAmount
    ) {
        super(blockchain, contract, 0);
        this.fromToken = this.token;
        this.toToken = this.token;
        this.toTokenAmountMin = this.toToken.tokenAmount;
    }

    protected getFirstPath(): string[] {
        return [this.token.address];
    }

    public getSecondPath(): string[] {
        return [Web3Pure.addressToBytes32(this.token.address)];
    }

    protected async modifyArgumentsForProvider(methodArguments: unknown[][]): Promise<void> {
        const exactTokensForTokens = true;
        const swapTokenWithFee = false;

        methodArguments[0].push(exactTokensForTokens, swapTokenWithFee);
    }

    public getCelerSourceTrade(): string {
        return this.toToken.address;
    }

    public getCelerDestionationTrade(integratorAddress: string): unknown[] {
        return Object.values({
            dex: EMPTY_ADDRESS,
            integrator: integratorAddress,
            path: [this.toToken.address],
            deadline: 0,
            amountOutMinimum: '0'
        });
    }

    /**
     * Returns method's arguments to use in source network.
     */
    public async getMethodArguments(
        toContractTrade: CelerCrossChainContractTrade,
        walletAddress: string,
        providerAddress: string,
        maxSlippage?: number
    ): Promise<unknown[]> {
        console.debug('[MAX SLIPPAGE]', maxSlippage);
        const receiver = toContractTrade.contract.address || walletAddress;
        console.debug('[RECEIVER]', receiver);
        const tokenInAmountAbsolute = this.fromToken.stringWeiAmount;
        console.debug('[tokenInAmountAbsolute]', tokenInAmountAbsolute);
        const targetChainId = BlockchainsInfo.getBlockchainByName(this.toToken.blockchain).id;
        console.debug('[targetChainId]', targetChainId);
        const source = this.getCelerSourceTrade();
        console.debug('[source]', source);
        const destination = toContractTrade.getCelerDestionationTrade(providerAddress);
        console.debug('[destination]', destination);

        return [receiver, tokenInAmountAbsolute, targetChainId, source, destination, maxSlippage];
    }
}
