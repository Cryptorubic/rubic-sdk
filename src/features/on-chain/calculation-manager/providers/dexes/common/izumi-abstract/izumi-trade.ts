import BigNumber from 'bignumber.js';
import { initialChainTable } from 'iziswap-sdk/lib/base';
import { TokenInfoFormatted } from 'iziswap-sdk/lib/base/types';
import {
    getSwapChainWithExactInputCall,
    getSwapContract,
    SwapChainWithExactInputParams
} from 'iziswap-sdk/lib/swap';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import { Injector } from 'src/core/injector/injector';
import { EncodeTransactionOptions } from 'src/features/common/models/encode-transaction-options';
import {
    ON_CHAIN_TRADE_TYPE,
    OnChainTradeType
} from 'src/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { EvmEncodedConfigAndToAmount } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-aggregator/models/aggregator-on-chain-types';
import { EvmOnChainTrade } from 'src/features/on-chain/calculation-manager/providers/common/on-chain-trade/evm-on-chain-trade/evm-on-chain-trade';
import { getGasPriceInfo } from 'src/features/on-chain/calculation-manager/providers/common/utils/get-gas-price-info';
import { IzumiTradeStruct } from 'src/features/on-chain/calculation-manager/providers/dexes/common/izumi-abstract/models/izumi-trade-struct';

export class IzumiTrade extends EvmOnChainTrade {
    public static async getGasLimit(
        tradeStruct: IzumiTradeStruct,
        providerAddress: string
    ): Promise<BigNumber | null> {
        const fromBlockchain = tradeStruct.from.blockchain;
        const walletAddress =
            Injector.web3PrivateService.getWeb3PrivateByBlockchain(fromBlockchain).address;
        if (!walletAddress) {
            return null;
        }

        try {
            const transactionConfig = await new IzumiTrade(tradeStruct, providerAddress).encode({
                fromAddress: walletAddress
            });

            const web3Public = Injector.web3PublicService.getWeb3Public(fromBlockchain);
            const gasLimit = await web3Public.getEstimatedGasByData(
                walletAddress,
                transactionConfig.to,
                {
                    data: transactionConfig.data,
                    value: transactionConfig.value
                }
            );

            if (!gasLimit?.isFinite()) {
                return null;
            }
            return gasLimit;
        } catch (err) {
            console.debug(err);
            return null;
        }
    }

    public get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.IZUMI;
    }

    public readonly dexContractAddress: string;

    private readonly swapConfig: {
        readonly tokenChain: string[];
        readonly feeChain: number[];
    };

    private readonly strictERC20Token: boolean = false;

    protected async getTransactionConfigAndAmount(
        options: EncodeTransactionOptions
    ): Promise<EvmEncodedConfigAndToAmount> {
        const tokenChain = blockchainId[this.from.blockchain];
        const swapParams = {
            feeChain: this.swapConfig.feeChain,
            tokenChain: this.swapConfig.tokenChain.map(token => ({
                address: token,
                chainId: tokenChain
            })) as unknown as TokenInfoFormatted[],
            inputAmount: this.fromWithoutFee.stringWeiAmount,
            minOutputAmount: this.toTokenAmountMin.stringWeiAmount,
            recipient: options?.receiverAddress || this.walletAddress,
            strictERC20Token: this.strictERC20Token
        } as SwapChainWithExactInputParams;

        const chainId = blockchainId[this.from.blockchain];
        const chain = initialChainTable[chainId]!;
        const web3 = Injector.web3PublicService.getWeb3Public(this.from.blockchain).web3Provider;
        const swapContract = getSwapContract(this.dexContractAddress, web3);
        const gasPriceInfo = await getGasPriceInfo(this.from.blockchain);

        const { swapCalling, options: data } = getSwapChainWithExactInputCall(
            swapContract,
            this.walletAddress,
            chain ?? chainId,
            swapParams,
            gasPriceInfo.gasPrice.toFixed()
        );

        const config = {
            to: this.dexContractAddress,
            value: data.value,
            data: swapCalling.encodeABI()
        };

        return { tx: config, toAmount: this.to.stringWeiAmount };
    }

    constructor(tradeStruct: IzumiTradeStruct, providerAddress: string) {
        super(tradeStruct, providerAddress);
        this.dexContractAddress = tradeStruct.dexContractAddress;
        this.swapConfig = tradeStruct.swapConfig;
        this.strictERC20Token = tradeStruct.strictERC20Token;
    }
}
