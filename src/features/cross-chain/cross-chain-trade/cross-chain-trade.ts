import { ContractTrade } from '@features/cross-chain/models/ContractTrade/ContractTrade';
import { Web3Pure } from '@core/blockchain/web3-pure/web3-pure';
import { CROSS_CHAIN_ROUTING_SWAP_METHOD } from '@features/cross-chain/cross-chain-trade/models/CROSS_CHAIN_ROUTING_SWAP_METHOD';
import { Injector } from '@core/sdk/injector';
import { Web3Private } from '@core/blockchain/web3-private/web3-private';
import { PriceTokenAmount } from '@core/blockchain/tokens/price-token-amount';
import { CrossChainContractMethodData } from '@features/cross-chain/cross-chain-trade/models/CrossChainContractMethodData';
import { GasData } from '@common/models/GasData';
import { BLOCKCHAIN_NAME } from '@core/blockchain/models/BLOCKCHAIN_NAME';
import crossChainContractAbi from '@features/cross-chain/constants/crossChainContractAbi';
import { MinMaxAmountsErrors } from '@features/cross-chain/cross-chain-trade/models/MinMaxAmountsErrors';

export class CrossChainTrade {
    public static async getGasData(
        fromTrade: ContractTrade,
        toTrade: ContractTrade,
        cryptoFeeToken: PriceTokenAmount
    ): Promise<GasData | null> {
        const fromBlockchain = fromTrade.blockchain;
        const { web3Private } = Injector;
        const walletAddress = web3Private.address;
        if (fromBlockchain !== BLOCKCHAIN_NAME.ETHEREUM || !walletAddress) {
            return null;
        }

        try {
            const { contractAddress, methodName, methodArguments, value } =
                await new CrossChainTrade(
                    fromTrade,
                    toTrade,
                    cryptoFeeToken,
                    {},
                    null
                ).getContractMethodData();

            const web3Public = Injector.web3PublicService.getWeb3Public(fromBlockchain);
            const [gasLimit, gasPrice] = await Promise.all([
                web3Public.getEstimatedGas(
                    crossChainContractAbi,
                    contractAddress,
                    methodName,
                    methodArguments,
                    walletAddress,
                    value
                ),
                web3Private.getGasPrice()
            ]);

            return {
                gasLimit,
                gasPrice
            };
        } catch (_err) {
            return null;
        }
    }

    private readonly web3Private: Web3Private;

    private get walletAddress(): string {
        return this.web3Private.address;
    }

    constructor(
        private readonly fromTrade: ContractTrade,
        private readonly toTrade: ContractTrade,
        private readonly cryptoFeeToken: PriceTokenAmount,
        private readonly minMaxAmountsErrors: MinMaxAmountsErrors,
        private readonly gasData: GasData | null
    ) {
        this.web3Private = Injector.web3Private;
    }

    private async getContractMethodData(): Promise<CrossChainContractMethodData> {
        const { fromTrade, toTrade } = this;

        const contractAddress = fromTrade.contract.address;

        const isFromTokenNative = Web3Pure.isNativeAddress(fromTrade.fromToken.address);
        const methodName = isFromTokenNative
            ? CROSS_CHAIN_ROUTING_SWAP_METHOD.SWAP_CRYPTO
            : CROSS_CHAIN_ROUTING_SWAP_METHOD.SWAP_TOKENS;

        const toBlockchainInContract = await toTrade.contract.getNumOfContract();

        const tokenInAmountAbsolute = Web3Pure.toWei(
            fromTrade.fromToken.tokenAmount,
            fromTrade.fromToken.decimals
        );
        const tokenOutAmountMin = fromTrade.toAmountMin;
        const tokenOutAmountMinAbsolute = Web3Pure.toWei(
            tokenOutAmountMin,
            fromTrade.fromToken.decimals
        );

        const fromTransitTokenAmountAbsolute = fromTrade.toAmountWei;

        const methodArguments = [
            [
                toBlockchainInContract,
                tokenInAmountAbsolute,
                fromTrade.path,
                toTrade.path,
                fromTransitTokenAmountAbsolute,
                tokenOutAmountMinAbsolute,
                this.walletAddress,
                Web3Pure.isNativeAddress(toTrade.toToken.address),
                true
            ]
        ];

        const value = this.cryptoFeeToken.weiAmount
            .plus(isFromTokenNative ? tokenInAmountAbsolute : 0)
            .toFixed(0);

        return {
            contractAddress,
            methodName,
            methodArguments,
            value
        };
    }
}
