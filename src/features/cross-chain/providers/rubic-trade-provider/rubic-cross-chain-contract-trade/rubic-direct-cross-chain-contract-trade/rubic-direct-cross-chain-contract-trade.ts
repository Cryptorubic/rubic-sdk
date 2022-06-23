import { PriceTokenAmount } from '@core/blockchain/tokens/price-token-amount';
import BigNumber from 'bignumber.js';
import { Web3Pure } from 'src/core';
import { CrossChainContractData } from '@features/cross-chain/providers/common/celer-rubic/cross-chain-contract-data';
import { RubicCrossChainContractTrade } from '@features/cross-chain/providers/rubic-trade-provider/rubic-cross-chain-contract-trade/rubic-cross-chain-contract-trade';
import { RubicCrossChainSupportedBlockchain } from '@features/cross-chain/providers/rubic-trade-provider/constants/rubic-cross-chain-supported-blockchains';
import { RubicSdkError } from 'src/common';

export class RubicDirectCrossChainContractTrade extends RubicCrossChainContractTrade {
    public readonly fromToken: PriceTokenAmount;

    public readonly toToken: PriceTokenAmount;

    public readonly toTokenAmountMin: BigNumber;

    constructor(
        blockchain: RubicCrossChainSupportedBlockchain,
        contract: CrossChainContractData,
        private readonly token: PriceTokenAmount
    ) {
        super(blockchain, contract, 0);
        this.fromToken = this.token;
        this.toToken = this.token;
        this.toTokenAmountMin = this.token.tokenAmount;
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

        if (!methodArguments?.[0]) {
            throw new RubicSdkError('Method arguments array length has to be bigger than 0');
        }

        methodArguments[0].push(exactTokensForTokens, swapTokenWithFee);
    }
}
