import BigNumber from 'bignumber.js';

export interface Permit2AllowanceContractResponse {
    amount: string;
    expiration: string;
    nonce: string;
}

type AllowanceBN = BigNumber;
type ExpirationMS = string;

export type Permit2AllowanceData = [AllowanceBN, ExpirationMS];
