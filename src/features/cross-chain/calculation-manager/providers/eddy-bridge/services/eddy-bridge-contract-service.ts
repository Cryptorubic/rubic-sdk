import BigNumber from 'bignumber.js';
import { PriceToken } from 'src/common/tokens';
import { nativeTokensList } from 'src/common/tokens/constants/native-tokens';
import { BLOCKCHAIN_NAME, EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { Injector } from 'src/core/injector/injector';

import { EDDY_OMNI_CONTRACT_IN_ZETACHAIN } from '../constants/eddy-bridge-contract-addresses';
import { EDDY_BRIDGE_ABI } from '../constants/edyy-bridge-abi';
import { ZRC_20_ABI } from '../constants/zrc-20-token-abi';
import { findCompatibleZrc20TokenAddress } from '../utils/find-transit-token-address';

export class EddyBridgeContractService {
    public static async getPlatformFee(): Promise<number> {
        try {
            const web3Public = Injector.web3PublicService.getWeb3Public(BLOCKCHAIN_NAME.ZETACHAIN);
            const res = await web3Public.callContractMethod<number>(
                EDDY_OMNI_CONTRACT_IN_ZETACHAIN,
                EDDY_BRIDGE_ABI,
                'platformFee',
                []
            );
            // eddy currently takes 1% from bridged amount (platformFee = 10, ratioToAmount in than case = 0.99)
            return res / 1_000;
        } catch (err) {
            return 0;
        }
    }

    /**
     * @param toToken target chain token
     * @returns gasFee in target token units
     */
    public static async getGasInDestTokenUnits(
        toToken: PriceToken<EvmBlockchainName>
    ): Promise<BigNumber> {
        if (toToken.blockchain === BLOCKCHAIN_NAME.ZETACHAIN) return new BigNumber(0);

        const web3Public = Injector.web3PublicService.getWeb3Public(BLOCKCHAIN_NAME.ZETACHAIN);
        const res = await web3Public.callContractMethod<[string, string]>(
            findCompatibleZrc20TokenAddress(toToken),
            ZRC_20_ABI,
            'withdrawGasFee',
            []
        );

        const gasFeeNonWei = Web3Pure.fromWei(res?.[1] || 0, 18);
        const nativeTokenWithPrice = await PriceToken.createFromToken(
            nativeTokensList[toToken.blockchain]
        );
        const gasFeeUsd = gasFeeNonWei.multipliedBy(nativeTokenWithPrice.price);
        const gasFeeInDestTokenAmount = gasFeeUsd.dividedBy(toToken.price);

        return gasFeeInDestTokenAmount;
    }

    /**
     * @returns eddy static slippage
     */
    public static async getEddySlipage(): Promise<number> {
        const web3Public = Injector.web3PublicService.getWeb3Public(BLOCKCHAIN_NAME.ZETACHAIN);
        const res = await web3Public.callContractMethod<number>(
            EDDY_OMNI_CONTRACT_IN_ZETACHAIN,
            EDDY_BRIDGE_ABI,
            'slippage',
            []
        );
        // if res equals to 10 then 10 / 1000 = 1%
        return res / 1_000;
    }
}
