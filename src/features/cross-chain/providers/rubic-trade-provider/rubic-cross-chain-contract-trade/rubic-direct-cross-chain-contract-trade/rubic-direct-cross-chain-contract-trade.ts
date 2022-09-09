import BigNumber from 'bignumber.js';
import { CrossChainContractData } from '@rsdk-features/cross-chain/providers/common/celer-rubic/cross-chain-contract-data';
import { RubicCrossChainContractTrade } from '@rsdk-features/cross-chain/providers/rubic-trade-provider/rubic-cross-chain-contract-trade/rubic-cross-chain-contract-trade';
import { RubicCrossChainSupportedBlockchain } from '@rsdk-features/cross-chain/providers/rubic-trade-provider/constants/rubic-cross-chain-supported-blockchains';
import { PriceTokenAmount, RubicSdkError } from 'src/common';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';

export class RubicDirectCrossChainContractTrade extends RubicCrossChainContractTrade {
    public readonly fromToken: PriceTokenAmount<EvmBlockchainName>;

    public readonly toToken: PriceTokenAmount<EvmBlockchainName>;

    public readonly toTokenAmountMin: BigNumber;

    constructor(
        blockchain: RubicCrossChainSupportedBlockchain,
        contract: CrossChainContractData,
        private readonly token: PriceTokenAmount<EvmBlockchainName>
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
        return [EvmWeb3Pure.addressToBytes32(this.token.address)];
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
