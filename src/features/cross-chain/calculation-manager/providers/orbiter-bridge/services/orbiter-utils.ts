import BigNumber from 'bignumber.js';
import { RubicSdkError } from 'src/common/errors';
import { PriceTokenAmount } from 'src/common/tokens';
import {
    BLOCKCHAIN_NAME,
    BlockchainName,
    EvmBlockchainName
} from 'src/core/blockchain/models/blockchain-name';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import Web3 from 'web3';

import { ORBITER_FEE_DIVIDER } from '../constants/orbiter-api';
import { OrbiterQuoteConfig } from '../models/orbiter-api-quote-types';
import { OrbiterGetQuoteConfigParams } from '../models/orbiter-utils-types';

export class OrbiterUtils {
    public static compareChainId(orbiterChainId: string, blockchainName: BlockchainName): boolean {
        if (blockchainName === BLOCKCHAIN_NAME.STARKNET) {
            return orbiterChainId === 'SN_MAIN';
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
                conf.srcToken.toLowerCase() === from.address.toLowerCase() &&
                conf.tgtToken.toLowerCase() === to.address.toLowerCase()
            );
        });

        if (!config) {
            throw new RubicSdkError('[ORBITER] Unsupported pair of tokens!');
        }

        return config;
    }

    public static isAmountCorrect(fromAmount: BigNumber, config: OrbiterQuoteConfig): boolean {
        return fromAmount.lt(config.maxAmt) && fromAmount.gt(config.minAmt);
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

    public static getTradingFee(
        from: PriceTokenAmount<EvmBlockchainName>,
        config: OrbiterQuoteConfig
    ): BigNumber {
        const digit = from.decimals === 18 ? 8 : 5;
        const tradingFee = from.tokenAmount
            .multipliedBy(config.tradeFee)
            .dividedBy(ORBITER_FEE_DIVIDER)
            .decimalPlaces(digit, BigNumber.ROUND_UP);

        return tradingFee;
    }

    public static getAmountWithVcCode(fromWeiAmount: string, config: OrbiterQuoteConfig): string {
        const pattern = `{${config.vc.length}}$`;
        const regex = new RegExp(pattern, 'gi');
        const total = fromWeiAmount.replace(regex, config.vc);

        return total;
    }
}
