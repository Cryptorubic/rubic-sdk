import { CrossChainSupportedBlockchain } from '@features/cross-chain/constants/cross-chain-supported-blockchains';
import { CrossChainContractData } from '@features/cross-chain/contract-data/cross-chain-contract-data';
import { ContractTrade } from '@features/cross-chain/contract-trade/contract-trade';
import { UniswapV2AbstractTrade } from '@features/swap/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-trade';
import { Web3Pure } from 'src/core';

export class InstantTradeContractTrade extends ContractTrade {
    public readonly fromToken = this.instantTrade.from;

    public readonly toToken = this.instantTrade.to;

    public readonly toTokenAmountMin = this.toToken.tokenAmount.multipliedBy(
        1 - this.slippageTolerance
    );

    public readonly path = this.instantTrade.path;

    constructor(
        blockchain: CrossChainSupportedBlockchain,
        contract: CrossChainContractData,
        providerIndex: number,
        public readonly slippageTolerance: number,
        private readonly instantTrade: UniswapV2AbstractTrade
    ) {
        super(blockchain, contract, providerIndex);
    }

    protected getFirstPath(): string[] {
        return this.instantTrade.wrappedPath.map(token => token.address);
    }

    protected getSecondPath(): string[] {
        return this.instantTrade.wrappedPath.map(token => Web3Pure.addressToBytes32(token.address));
    }
}
