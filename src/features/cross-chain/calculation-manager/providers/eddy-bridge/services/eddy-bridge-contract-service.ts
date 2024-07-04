import BigNumber from 'bignumber.js';
import { PriceTokenAmount } from 'src/common/tokens';
import { BLOCKCHAIN_NAME, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { Injector } from 'src/core/injector/injector';

import { EDDY_CONTRACT_ADDRESS_IN_ZETACHAIN } from '../constants/eddy-bridge-contract-addresses';
import { EDDY_BRIDGE_ABI } from '../constants/edyy-bridge-abi';
import { ZRC_20_ABI } from '../constants/zrc-20-token-abi';

export class EddyBridgeContractService {
    public static getPlatformFee(): Promise<number> {
        const web3Public = Injector.web3PublicService.getWeb3Public(BLOCKCHAIN_NAME.ZETACHAIN);
        return web3Public.callContractMethod<number>(
            EDDY_CONTRACT_ADDRESS_IN_ZETACHAIN,
            EDDY_BRIDGE_ABI,
            'platformFee',
            []
        );
    }

    public static async getGasInTargetChain(
        from: PriceTokenAmount<EvmBlockchainName>
    ): Promise<BigNumber> {
        const web3Public = Injector.web3PublicService.getWeb3Public(BLOCKCHAIN_NAME.ZETACHAIN);
        const gasFeeInTargetChainWei = await web3Public.callContractMethod<[string, string]>(
            from.address,
            ZRC_20_ABI,
            'withdrawGasFee',
            []
        );
        const gasFeeNonWei = Web3Pure.fromWei(gasFeeInTargetChainWei?.[1], from.decimals);

        return gasFeeNonWei;
    }

    public static async getEddySlipage(): Promise<number> {
        const web3Public = Injector.web3PublicService.getWeb3Public(BLOCKCHAIN_NAME.ZETACHAIN);
        return web3Public.callContractMethod<number>(
            EDDY_CONTRACT_ADDRESS_IN_ZETACHAIN,
            EDDY_BRIDGE_ABI,
            'slippage',
            []
        );
    }
}
