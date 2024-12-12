import { RubicSdkError } from 'src/common/errors';
import { PriceTokenAmount } from 'src/common/tokens';
import { compareAddresses } from 'src/common/utils/blockchain';
import { BLOCKCHAIN_NAME, BlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import { getFromWithoutFee } from 'src/features/common/utils/get-from-without-fee';
import { FeeInfo } from 'src/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import Web3 from 'web3';

import { OrbiterQuoteConfig } from '../models/orbiter-api-quote-types';
import { OrbiterGetQuoteConfigParams } from '../models/orbiter-utils-types';

export class OrbiterUtils {
    public static compareChainId(orbiterChainId: string, blockchainName: BlockchainName): boolean {
        if (blockchainName === BLOCKCHAIN_NAME.STARKNET) {
            return orbiterChainId === 'SN_MAIN';
        }
        if (blockchainName === BLOCKCHAIN_NAME.TRON) {
            return orbiterChainId === '728126428';
        }

        return orbiterChainId === blockchainId[blockchainName].toString();
    }

    public static getQuoteConfig({
        configs,
        from,
        to
    }: OrbiterGetQuoteConfigParams): OrbiterQuoteConfig {
        const config = configs.find(conf => {
            return (
                this.compareChainId(conf.srcChain, from.blockchain) &&
                this.compareChainId(conf.tgtChain, to.blockchain) &&
                compareAddresses(conf.srcToken, from.address) &&
                compareAddresses(conf.tgtToken, to.address)
            );
        });

        if (!config) {
            throw new RubicSdkError('[ORBITER] Unsupported pair of tokens!');
        }

        return config;
    }

    /**
     *
     * @param code Orbiter identification code of chain(9001, 9002 etc), equals quoteConfig.vc
     * @param receiverAddress
     * @returns data argument for orbiter-abi methods as hex string
     */
    public static getHexDataArg(code: string, receiverAddress: string): string {
        const value = `c=${code}&t=${receiverAddress}`;
        const hexString = Web3.utils.toHex(value);

        return hexString;
    }

    public static getAmountWithVcCode(fromWeiAmount: string, config: OrbiterQuoteConfig): string {
        const regex = new RegExp(`\\d{${config.vc.length}}$`, 'g');
        const total = fromWeiAmount.replace(regex, config.vc);

        return total;
    }

    /**
     *  @example for native transfer
     *   1000000 - 2%(rubicPercentFee) -> convertToCode -> 998015
     *   amountJore -  998015 + 2%
     *   When Jora subtracts amountJore - 2%, he will get value with orbiter-vc-code
     */
    public static getFromAmountWithoutFeeWithCode(
        from: PriceTokenAmount,
        feeInfo: FeeInfo,
        quoteConfig: OrbiterQuoteConfig
    ): string {
        const fromWithoutFee = getFromWithoutFee(from, feeInfo.rubicProxy?.platformFee?.percent);
        const transferAmount = OrbiterUtils.getAmountWithVcCode(
            fromWithoutFee.stringWeiAmount,
            quoteConfig
        );

        return transferAmount;
    }
}
