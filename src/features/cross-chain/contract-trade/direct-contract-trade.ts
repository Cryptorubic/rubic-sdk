import { CrossChainSupportedBlockchain } from '@features/cross-chain/constants/cross-chain-supported-blockchains';
import { CrossChainContractData } from '@features/cross-chain/contract-data/cross-chain-contract-data';
import { PriceTokenAmount } from '@core/blockchain/tokens/price-token-amount';
import { ContractTrade } from '@features/cross-chain/contract-trade/contract-trade';
import { Web3Pure } from 'src/core';

export class DirectContractTrade extends ContractTrade {
    public readonly fromToken = this.token;

    public readonly toToken = this.token;

    public readonly toTokenAmountMin = this.token.tokenAmount;

    public readonly path = [this.token];

    constructor(
        blockchain: CrossChainSupportedBlockchain,
        contract: CrossChainContractData,
        private readonly token: PriceTokenAmount
    ) {
        super(blockchain, contract, 0);
    }

    protected getFirstPath(): string[] {
        return [this.token.address];
    }

    protected getSecondPath(): string[] {
        return [Web3Pure.addressToBytes32(this.token.address)];
    }
}
