import { CrossChainSupportedBlockchain } from '@features/cross-chain/constants/cross-chain-supported-blockchains';
import { CrossChainContractData } from '@features/cross-chain/contract-data/cross-chain-contract-data';
import { ContractTrade } from '@features/cross-chain/contract-trade/contract-trade';
import { UniswapV2AbstractTrade } from '@features/swap/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import BigNumber from 'bignumber.js';
import { PriceTokenAmount, Token, Web3Pure } from 'src/core';

export class InstantTradeContractTrade extends ContractTrade {
    public readonly fromToken: PriceTokenAmount;

    public readonly toToken: PriceTokenAmount;

    public readonly toTokenAmountMin: BigNumber;

    public readonly path: ReadonlyArray<Token>;

    constructor(
        blockchain: CrossChainSupportedBlockchain,
        contract: CrossChainContractData,
        providerIndex: number,
        public readonly slippageTolerance: number,
        private readonly instantTrade: UniswapV2AbstractTrade
    ) {
        super(blockchain, contract, providerIndex);

        this.fromToken = this.instantTrade.from;
        this.toToken = this.instantTrade.to;
        this.toTokenAmountMin = this.toToken.tokenAmount.multipliedBy(1 - this.slippageTolerance);
        this.path = this.instantTrade.path;
    }

    protected getFirstPath(): string[] {
        return this.instantTrade.wrappedPath.map(token => token.address);
    }

    protected getSecondPath(): string[] {
        return this.instantTrade.wrappedPath.map(token => Web3Pure.addressToBytes32(token.address));
    }
}
