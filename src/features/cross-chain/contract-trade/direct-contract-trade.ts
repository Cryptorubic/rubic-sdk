import { CrossChainSupportedBlockchain } from '@features/cross-chain/constants/cross-chain-supported-blockchains';
import { CrossChainContractData } from '@features/cross-chain/contract-data/cross-chain-contract-data';
import { PriceTokenAmount } from '@core/blockchain/tokens/price-token-amount';
import { ContractTrade } from '@features/cross-chain/contract-trade/contract-trade';
import BigNumber from 'bignumber.js';
import { Web3Pure } from 'src/core';

export class DirectContractTrade extends ContractTrade {
    public readonly fromToken: PriceTokenAmount;

    public readonly toToken: PriceTokenAmount;

    public readonly toTokenAmountMin: BigNumber;

    public readonly path: PriceTokenAmount[];

    constructor(
        blockchain: CrossChainSupportedBlockchain,
        contract: CrossChainContractData,
        private readonly token: PriceTokenAmount
    ) {
        super(blockchain, contract, 0);

        this.fromToken = this.token;
        this.toToken = this.token;
        this.toTokenAmountMin = this.token.tokenAmount;
        this.path = [this.token];
    }

    protected getFirstPath(): string[] {
        return [this.token.address];
    }

    protected getSecondPath(): string[] {
        return [Web3Pure.addressToBytes32(this.token.address)];
    }
}
