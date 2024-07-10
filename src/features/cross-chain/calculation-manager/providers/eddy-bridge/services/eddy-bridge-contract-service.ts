import BigNumber from 'bignumber.js';
import { PriceTokenAmount } from 'src/common/tokens';
import { BLOCKCHAIN_NAME, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { Injector } from 'src/core/injector/injector';

import { EDDY_CONTRACT_ADDRESS_IN_ZETACHAIN } from '../constants/eddy-bridge-contract-addresses';
import { EDDY_BRIDGE_ABI } from '../constants/edyy-bridge-abi';
import { ZRC_20_ABI } from '../constants/zrc-20-token-abi';

export class EddyBridgeContractService {
    public static async getPlatformFee(): Promise<number> {
        const web3Public = Injector.web3PublicService.getWeb3Public(BLOCKCHAIN_NAME.ZETACHAIN);
        const res = await web3Public.callContractMethod<number>(
            EDDY_CONTRACT_ADDRESS_IN_ZETACHAIN,
            EDDY_BRIDGE_ABI,
            'platformFee',
            []
        );
        // eddy currently takes 1% from bridged amount (platformFee = 10, ratioToAmount in than case = 0.99)
        return res / 1_000;
    }

    public static async getGasInTargetChain(
        from: PriceTokenAmount<EvmBlockchainName>
    ): Promise<BigNumber> {
        const web3Public = Injector.web3PublicService.getWeb3Public(BLOCKCHAIN_NAME.ZETACHAIN);
        const res = await web3Public.callContractMethod<[string, string]>(
            from.address,
            ZRC_20_ABI,
            'withdrawGasFee',
            []
        );
        const gasFeeNonWei = Web3Pure.fromWei(res?.[1] || 0, from.decimals);

        return gasFeeNonWei;
    }

    /**
     *
     * @returns eddy static slippage from 0 to 1
     */
    public static async getEddySlipage(): Promise<number> {
        const web3Public = Injector.web3PublicService.getWeb3Public(BLOCKCHAIN_NAME.ZETACHAIN);
        const res = await web3Public.callContractMethod<number>(
            EDDY_CONTRACT_ADDRESS_IN_ZETACHAIN,
            EDDY_BRIDGE_ABI,
            'slippage',
            []
        );
        // if res equals to 10 then 10 / 1000 = 1%
        return res / 1_000;
    }
}
