import { Injector } from '@core/sdk/injector';
import { PriceTokenAmount } from '@core/blockchain/tokens/price-token-amount';
import { GasData } from '@features/cross-chain/models/gas-data';
import { FailedToCheckForTransactionReceiptError } from '@common/errors/swap/failed-to-check-for-transaction-receipt.error';
import BigNumber from 'bignumber.js';
import { Web3Public } from 'src/core';
import { CROSS_CHAIN_TRADE_TYPE, CrossChainTrade } from 'src/features';
import LIFI, { Route } from '@lifinance/sdk';

/**
 * Calculated Celer cross chain trade.
 */
export class LifiCrossChainTrade extends CrossChainTrade {
    public get fromContractAddress() {
        // @TODO add address
        return '';
    }

    public async getContractParams() {
        // @TODO add params
        return {
            contractAddress: '',
            contractAbi: [],
            methodName: '',
            methodArguments: [],
            value: '0'
        };
    }

    public readonly type = CROSS_CHAIN_TRADE_TYPE.LIFI;

    public readonly from: PriceTokenAmount;

    public readonly to: PriceTokenAmount;

    public readonly toTokenAmountMin: BigNumber;

    public readonly gasData: GasData | null;

    protected readonly fromWeb3Public: Web3Public;

    private readonly lifi = new LIFI();

    private readonly route: Route;

    constructor(
        crossChainTrade: {
            from: PriceTokenAmount;
            to: PriceTokenAmount;
            route: Route;
            gasData: GasData | null;
            toTokenAmountMin: BigNumber;
        },
        providerAddress: string
    ) {
        super(providerAddress);

        this.from = crossChainTrade.from;
        this.to = crossChainTrade.to;
        this.route = crossChainTrade.route;
        this.gasData = crossChainTrade.gasData;
        this.toTokenAmountMin = crossChainTrade.toTokenAmountMin;

        this.fromWeb3Public = Injector.web3PublicService.getWeb3Public(this.from.blockchain);
    }

    protected async checkTradeErrors(): Promise<void | never> {
        this.checkWalletConnected();
        this.checkBlockchainCorrect();

        await Promise.all([this.checkUserBalance()]);
    }

    public async swap(): Promise<string | never> {
        await this.checkTradeErrors();
        // await this.checkAllowanceAndApprove(options);

        // const { onConfirm, gasLimit, gasPrice } = options;

        // const { contractAddress, contractAbi, methodName, methodArguments, value } =
        //     await this.getContractParams();

        let transactionHash: string;
        try {
            const { signer } = Injector.web3Private;
            await this.lifi.executeRoute(signer, this.route);

            // const onTransactionHash = (hash: string) => {
            //     if (onConfirm) {
            //         onConfirm(hash);
            //     }
            //     transactionHash = hash;
            // };

            // await Injector.web3Private.tryExecuteContractMethod(
            //     contractAddress,
            //     contractAbi,
            //     methodName,
            //     methodArguments,
            //     {
            //         gas: gasLimit,
            //         gasPrice,
            //         value,
            //         onTransactionHash
            //     },
            //     err => {
            //         const includesErrCode = err?.message?.includes('-32000');
            //         const allowedErrors = [
            //             'insufficient funds for transfer',
            //             'insufficient funds for gas * price + value'
            //         ];
            //         const includesPhrase = allowedErrors.some(error =>
            //             err?.message?.includes(error)
            //         );
            //         return includesErrCode && includesPhrase;
            //     }
            // );

            return transactionHash!;
        } catch (err) {
            if (err instanceof FailedToCheckForTransactionReceiptError) {
                return transactionHash!;
            }
            throw err;
        }
    }
}
