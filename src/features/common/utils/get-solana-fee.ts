import { PriceTokenAmount } from 'src/common/tokens';
import { compareAddresses } from 'src/common/utils/blockchain';

const DEFAULT_FEE_PERCENT = 0.02;

const REFFERAL_TOKENS = [
    '6AJcP7wuLwmRYLBNbi825wgguaPsWzPBEHcHndpRpump',
    '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
    '9nEqaUcb16sQ3Tn1psbkWqyhPdLmfHWjKGymREjsAgTE'
] as const;

export function getSolanaFee(from: PriceTokenAmount): number {
    if (REFFERAL_TOKENS.some(addr => compareAddresses(addr, from.address))) {
        return 0.007;
    }

    if (!from.price) {
        return DEFAULT_FEE_PERCENT;
    }

    const usdTokenAmount = from.tokenAmount.multipliedBy(from.price);

    if (usdTokenAmount.gt(100)) {
        return DEFAULT_FEE_PERCENT;
    }

    return 0;
}
