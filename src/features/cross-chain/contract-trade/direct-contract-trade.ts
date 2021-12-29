import { CrossChainSupportedBlockchain } from '@features/cross-chain/constants/cross-chain-supported-blockchains';
import { ContractData } from '@features/cross-chain/contract-data/contract-data';
import { PriceTokenAmount } from '@core/blockchain/tokens/price-token-amount';
import { ContractTrade } from '@features/cross-chain/contract-trade/contract-trade';
import BigNumber from 'bignumber.js';
import { Token } from '@core/blockchain/tokens/token';
import { Web3Pure } from 'src/core';

export class DirectContractTrade extends ContractTrade {
    public get fromToken(): PriceTokenAmount {
        return this.token;
    }

    public get toToken(): PriceTokenAmount {
        return this.token;
    }

    public get toTokenAmountMin(): BigNumber {
        return this.token.tokenAmount;
    }

    public get path(): ReadonlyArray<Token> {
        return [this.token];
    }

    constructor(
        blockchain: CrossChainSupportedBlockchain,
        contract: ContractData,
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
