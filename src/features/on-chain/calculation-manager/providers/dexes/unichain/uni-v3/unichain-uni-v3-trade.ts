import { RubicSdkError } from 'src/common/errors';
import { compareAddresses } from 'src/common/utils/blockchain';
import { MethodData } from 'src/core/blockchain/web3-public-service/web3-public/models/method-data';

import { UniswapV3AbstractTrade } from '../../common/uniswap-v3-abstract/uniswap-v3-abstract-trade';
import { UniswapV3QuoterController } from '../../common/uniswap-v3-abstract/utils/quoter-controller/uniswap-v3-quoter-controller';
import { UNICHAIN_UNISWAP_V3_SWAP_ROUTER_CONTRACT_ADDRESS } from './constants/contract-addresses';
import { UNICHAIN_UNISWAP_V3_SWAP_ROUTER_ABI } from './constants/swap-router-abi';

export class UniswapV3UnichainTrade extends UniswapV3AbstractTrade {
    public override readonly dexContractAddress = UNICHAIN_UNISWAP_V3_SWAP_ROUTER_CONTRACT_ADDRESS;

    protected override readonly contractAbi = UNICHAIN_UNISWAP_V3_SWAP_ROUTER_ABI;

    /**
     * Returns swap `exactInput` or `exactInputSingle` method's name and arguments to use in Swap Router contract.
     */
    protected override getSwapRouterExactInputMethodData(walletAddress: string): MethodData {
        if (this.exact === 'output') {
            throw new RubicSdkError('Exact "output" not supported in UniswapV3UnichainTrade!');
        }

        const amountParams = this.getAmountParams();

        if (this.route.poolsPath.length === 1) {
            const pool = this.route.poolsPath[0]!;
            const toTokenAddress = compareAddresses(
                pool.token0.address,
                this.route.initialTokenAddress
            )
                ? pool.token1.address
                : pool.token0.address;

            return {
                methodName: 'exactInputSingle',
                methodArguments: [
                    [
                        this.route.initialTokenAddress,
                        toTokenAddress,
                        this.route.poolsPath[0]?.fee,
                        walletAddress,
                        ...amountParams,
                        0
                    ]
                ]
            };
        }

        return {
            methodName: 'exactInput',
            methodArguments: [
                [
                    UniswapV3QuoterController.getEncodedPoolsPath(
                        this.route.poolsPath,
                        this.route.initialTokenAddress
                    ),
                    walletAddress,
                    ...amountParams
                ]
            ]
        };
    }
}
