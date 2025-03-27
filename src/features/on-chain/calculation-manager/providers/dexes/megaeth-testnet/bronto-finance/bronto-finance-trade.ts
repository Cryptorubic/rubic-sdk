import { MethodData } from 'src/core/blockchain/web3-public-service/web3-public/models/method-data';
import { ON_CHAIN_TRADE_TYPE, OnChainTradeType } from '../../../common/models/on-chain-trade-type';
import { UNISWAP_V3_SWAP_ROUTER_CONTRACT_ABI } from '../../common/uniswap-v3-abstract/constants/swap-router-contract-abi';
import { UniswapV3AbstractTrade } from '../../common/uniswap-v3-abstract/uniswap-v3-abstract-trade';
import { MEGAETH_TESTNET_ROUTER_CONTRACT_ADDRESS } from './constants/provider-config';
import { RubicSdkError } from 'src/common/errors';
import { BrontoFinanceQuoterController } from '../../common/uniswap-v3-abstract/bronto-finance-quoter-controller';
import { feeToTickSpacing } from './constants/router-config';
import { compareAddresses } from 'src/common/utils/blockchain';

export class BrontoFinanceTrade extends UniswapV3AbstractTrade {
    public get type(): OnChainTradeType {
        return ON_CHAIN_TRADE_TYPE.BRONTO_FINANCE;
    }

    public readonly dexContractAddress = MEGAETH_TESTNET_ROUTER_CONTRACT_ADDRESS;

    protected readonly contractAbi = UNISWAP_V3_SWAP_ROUTER_CONTRACT_ABI;

    /**
     * Returns swap `exactInput` method's name and arguments to use in Swap contract.
     */
    protected getSwapRouterExactInputMethodData(walletAddress: string): MethodData {
        const amountParams = this.getAmountParams();

        // if (this.route.poolsPath.length === 1) {
        //     const methodName = this.exact === 'input' ? 'exactInputSingle' : 'exactOutputSingle';

        //     const pool = this.route.poolsPath[0];
        //     if (!pool) {
        //         throw new RubicSdkError('Initial pool has to be defined');
        //     }
        //     const toTokenAddress = compareAddresses(
        //         pool.token0.address,
        //         this.route.initialTokenAddress
        //     )
        //         ? pool.token1.address
        //         : pool.token0.address;

        //     if (!this.route?.poolsPath?.[0]) {
        //         throw new RubicSdkError('PoolsPath[0] has to be defined');
        //     }
        //     return {
        //         methodName,
        //         methodArguments: [
        //             [
        //                 this.route.initialTokenAddress,
        //                 toTokenAddress,
        //                 this.route.poolsPath[0].fee,
        //                 walletAddress,
        //                 this.deadlineMinutesTimestamp,
        //                 ...amountParams,
        //                 0
        //             ]
        //         ]
        //     };
        // }

        const methodName = this.exact === 'input' ? 'exactInput' : 'exactOutput';

        return {
            methodName,
            methodArguments: [
                [
                    BrontoFinanceQuoterController.getEncodedPoolsPath(
                        this.route.poolsPath,
                        this.route.initialTokenAddress
                    ),
                    walletAddress,
                    this.deadlineMinutesTimestamp,
                    ...amountParams
                ]
            ]
        };
    }
}
