import { CelerCrossChainTrade } from 'src/features';
import { CrossChainContractTrade } from 'src/features/cross-chain/providers/common/celer-rubic/cross-chain-contract-trade';
import { PriceTokenAmount } from 'src/core';
import { GasData } from 'src/features/cross-chain/models/gas-data';
import { ContractParams } from 'src/features/cross-chain/models/contract-params';
import { CelerCrossChainContractTrade } from 'src/features/cross-chain/providers/celer-trade-provider/celer-cross-chain-contract-trade/celer-cross-chain-contract-trade';
import BigNumber from 'bignumber.js';
import { nftCelerCrossChainContractAddress } from 'src/features/cross-chain/providers/nft-celer-trade-provider/costants/nft-celer-cross-chain-contract-address';
import { ntfCelerCrossChainContractAbi } from 'src/features/cross-chain/providers/nft-celer-trade-provider/costants/nft-celer-cross-chain-contract-abi';

export class NftCelerCrossChainTrade extends CelerCrossChainTrade {
    private readonly swapData: string;

    protected get fromContractAddress(): string {
        return nftCelerCrossChainContractAddress;
    }

    constructor(
        crossChainTrade: {
            fromTrade: CrossChainContractTrade;
            toTrade: CrossChainContractTrade;
            cryptoFeeToken: PriceTokenAmount;
            transitFeeToken: PriceTokenAmount;
            gasData: GasData | null;
            feeInPercents: number;
            swapData: string;
        },
        providerAddress: string,
        maxSlippage: number
    ) {
        super(crossChainTrade, providerAddress, maxSlippage);

        this.swapData = crossChainTrade.swapData;
    }

    protected async getContractParams(fromAddress?: string): Promise<ContractParams> {
        const contractAddress = nftCelerCrossChainContractAddress;
        const contractAbi = ntfCelerCrossChainContractAbi;
        const methodName = 'bridgeWithSwap';

        const fromTrade = this.fromTrade as CelerCrossChainContractTrade;
        const toTrade = this.toTrade as CelerCrossChainContractTrade;
        const celerMethodArguments = await fromTrade.getMethodArguments(
            toTrade,
            fromAddress || this.walletAddress,
            this.providerAddress,
            {
                maxSlippage: this.maxSlippage
            }
        );
        const dstSwapArguments = celerMethodArguments[4] as Array<unknown>;
        const nftDstSwapArguments = [dstSwapArguments[0]]
            .concat(true)
            .concat(dstSwapArguments.slice(1, 5))
            .concat([[3, '600000000000000000', this.swapData]])
            .concat(dstSwapArguments.slice(5, 6))
            .concat(['600000000000000000']);
        const methodArguments = (['0x4B4044Fda9e2CEe76a554923AFA627C727dA9E29'] as unknown[])
            .concat(celerMethodArguments.slice(1, 4))
            .concat([nftDstSwapArguments])
            .concat(celerMethodArguments.slice(5));

        const tokenInAmountAbsolute = fromTrade.fromToken.weiAmount;
        const msgValue = await this.calculateSwapValue(tokenInAmountAbsolute, methodArguments);
        const value = new BigNumber(msgValue).toFixed(0);

        return {
            contractAddress,
            contractAbi,
            methodName,
            methodArguments,
            value
        };
    }
}
